#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  dispatch_spec.sh <ABS_SPEC_PATH> [--phase pre|finalize] [--no-pr] [--allow-outside-owned-paths]

Options:
  --phase pre|finalize          Select workflow phase (default: pre)
  --no-pr                       Skip PR creation in finalize phase
  --allow-outside-owned-paths   Bypass owned_paths enforcement
  -h, --help                    Show this help
USAGE
}

fail() {
  echo "[spec-dispatch] ERROR: $*" >&2
  exit 1
}

PHASE="pre"
NO_PR=0
ALLOW_OUTSIDE_OWNED_PATHS=0
SPEC_PATH=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --phase)
      shift
      [[ $# -gt 0 ]] || fail "Missing value for --phase"
      PHASE="$1"
      ;;
    --no-pr)
      NO_PR=1
      ;;
    --allow-outside-owned-paths)
      ALLOW_OUTSIDE_OWNED_PATHS=1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      if [[ -z "$SPEC_PATH" ]]; then
        SPEC_PATH="$1"
      else
        fail "Unexpected extra argument: $1"
      fi
      ;;
  esac
  shift
done

[[ -n "$SPEC_PATH" ]] || fail "Missing <ABS_SPEC_PATH>"
[[ "$PHASE" == "pre" || "$PHASE" == "finalize" ]] || fail "--phase must be pre or finalize"
[[ "$SPEC_PATH" = /* ]] || fail "Spec path must be absolute"

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[[ -n "$REPO_ROOT" ]] || fail "Run inside a git repository"

[[ -f "$SPEC_PATH" ]] || fail "Spec file not found: $SPEC_PATH"
[[ "$SPEC_PATH" == "$REPO_ROOT/specs/"* ]] || fail "Spec path must be inside $REPO_ROOT/specs"

SPEC_ID=""
TITLE=""
WAVE=""
BRANCH=""
BASE_BRANCH=""
declare -a TEST_COMMANDS=()
declare -a OWNED_PATHS=()

while IFS= read -r line; do
  case "$line" in
    SPEC_ID=*) SPEC_ID="${line#SPEC_ID=}" ;;
    TITLE=*) TITLE="${line#TITLE=}" ;;
    WAVE=*) WAVE="${line#WAVE=}" ;;
    BRANCH=*) BRANCH="${line#BRANCH=}" ;;
    BASE_BRANCH=*) BASE_BRANCH="${line#BASE_BRANCH=}" ;;
    TEST_COMMAND=*) TEST_COMMANDS+=("${line#TEST_COMMAND=}") ;;
    OWNED_PATH=*) OWNED_PATHS+=("${line#OWNED_PATH=}") ;;
  esac
done < <(python3 - "$SPEC_PATH" <<'PY'
import re
import sys

path = sys.argv[1]
with open(path, encoding="utf-8") as handle:
    lines = handle.read().splitlines()

if not lines or lines[0].strip() != "---":
    raise SystemExit("Spec is missing opening YAML frontmatter delimiter")

frontmatter = []
idx = 1
while idx < len(lines) and lines[idx].strip() != "---":
    frontmatter.append(lines[idx])
    idx += 1

if idx >= len(lines):
    raise SystemExit("Spec is missing closing YAML frontmatter delimiter")

parsed = {}
current_key = None
for raw in frontmatter:
    if not raw.strip() or raw.lstrip().startswith("#"):
        continue

    key_match = re.match(r"^([A-Za-z0-9_]+):\s*(.*)$", raw)
    if key_match:
        key = key_match.group(1)
        value = key_match.group(2).strip()
        if value == "":
            parsed[key] = []
            current_key = key
        else:
            if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
                value = value[1:-1]
            parsed[key] = value
            current_key = None
        continue

    list_match = re.match(r"^\s*-\s*(.*)$", raw)
    if list_match and current_key:
        item = list_match.group(1).strip()
        if (item.startswith('"') and item.endswith('"')) or (item.startswith("'") and item.endswith("'")):
            item = item[1:-1]
        parsed.setdefault(current_key, []).append(item)

required = ["spec_id", "wave", "branch", "base_branch", "test_commands", "owned_paths"]
missing = [key for key in required if key not in parsed or parsed[key] in ("", [])]
if missing:
    raise SystemExit(f"Spec is missing required frontmatter key(s): {', '.join(missing)}")

if not isinstance(parsed["test_commands"], list) or not parsed["test_commands"]:
    raise SystemExit("test_commands must be a non-empty YAML list")
if not isinstance(parsed["owned_paths"], list) or not parsed["owned_paths"]:
    raise SystemExit("owned_paths must be a non-empty YAML list")

print(f"SPEC_ID={parsed['spec_id']}")
print(f"TITLE={parsed.get('title', parsed['spec_id'])}")
print(f"WAVE={parsed['wave']}")
print(f"BRANCH={parsed['branch']}")
print(f"BASE_BRANCH={parsed['base_branch']}")
for command in parsed["test_commands"]:
    print(f"TEST_COMMAND={command}")
for owned_path in parsed["owned_paths"]:
    print(f"OWNED_PATH={owned_path}")
PY
)

[[ -n "$SPEC_ID" ]] || fail "Unable to parse spec_id"
[[ -n "$BRANCH" ]] || fail "Unable to parse branch"
[[ -n "$BASE_BRANCH" ]] || fail "Unable to parse base_branch"
[[ "$BRANCH" == codex/* ]] || fail "Spec branch must start with codex/: $BRANCH"

ensure_branch() {
  local current_branch
  current_branch="$(git branch --show-current)"

  if [[ "$current_branch" == "$BRANCH" ]]; then
    return
  fi

  git fetch origin --prune

  if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
    git switch "$BRANCH"
    return
  fi

  if git show-ref --verify --quiet "refs/remotes/origin/$BASE_BRANCH"; then
    git switch -c "$BRANCH" "origin/$BASE_BRANCH"
    return
  fi

  if git show-ref --verify --quiet "refs/heads/$BASE_BRANCH"; then
    git switch -c "$BRANCH" "$BASE_BRANCH"
    return
  fi

  fail "Base branch not found locally or on origin: $BASE_BRANCH"
}

bootstrap_ui_deps_if_missing() {
  if [[ ! -x "$REPO_ROOT/src/ui/node_modules/.bin/vitest" ]]; then
    echo "[spec-dispatch] Installing UI dependencies (npm ci)..."
    npm --prefix "$REPO_ROOT/src/ui" ci
  fi
}

collect_changed_files() {
  local base_ref merge_base
  if git show-ref --verify --quiet "refs/remotes/origin/$BASE_BRANCH"; then
    base_ref="origin/$BASE_BRANCH"
  elif git show-ref --verify --quiet "refs/heads/$BASE_BRANCH"; then
    base_ref="$BASE_BRANCH"
  else
    fail "Cannot determine base ref for changed-file comparison: $BASE_BRANCH"
  fi

  merge_base="$(git merge-base "$base_ref" HEAD)"
  git diff --name-only "$merge_base...HEAD"
}

validate_owned_paths() {
  (( ALLOW_OUTSIDE_OWNED_PATHS == 1 )) && {
    echo "[spec-dispatch] Skipping owned_paths validation (--allow-outside-owned-paths set)"
    return
  }

  mapfile -t changed_files < <(collect_changed_files)
  if [[ ${#changed_files[@]} -eq 0 ]]; then
    echo "[spec-dispatch] No changed files detected yet."
    return
  fi

  local has_violation=0
  for changed in "${changed_files[@]}"; do
    local allowed=0
    for owned in "${OWNED_PATHS[@]}"; do
      if [[ "$changed" == "$owned" || "$changed" == "$owned/"* ]]; then
        allowed=1
        break
      fi
    done
    if [[ $allowed -eq 0 ]]; then
      echo "[spec-dispatch] Owned path violation: $changed" >&2
      has_violation=1
    fi
  done

  if [[ $has_violation -ne 0 ]]; then
    fail "Changed files include paths outside spec owned_paths"
  fi
}

run_test_commands() {
  local cmd
  for cmd in "${TEST_COMMANDS[@]}"; do
    echo "[spec-dispatch] Running test command: $cmd"
    (
      cd "$REPO_ROOT"
      bash -lc "$cmd"
    )
  done
}

write_pr_summary() {
  local template_path summary_file changed_block tests_block
  local -a changed_files

  template_path="$REPO_ROOT/skills/spec-dispatch/references/pr_summary_template.md"
  [[ -f "$template_path" ]] || fail "PR summary template missing: $template_path"

  mapfile -t changed_files < <(collect_changed_files)
  if [[ ${#changed_files[@]} -eq 0 ]]; then
    changed_block="- No file changes detected"
  else
    changed_block="$(printf '%s\n' "${changed_files[@]}" | sed 's/^/- /')"
  fi

  tests_block="$(printf '%s\n' "${TEST_COMMANDS[@]}" | sed 's/^/- PASS: /')"

  summary_file="${TMPDIR:-/tmp}/${SPEC_ID}-pr-summary.md"

  SPEC_ID_ENV="$SPEC_ID" \
  TITLE_ENV="$TITLE" \
  BRANCH_ENV="$BRANCH" \
  BASE_BRANCH_ENV="$BASE_BRANCH" \
  SPEC_PATH_ENV="$SPEC_PATH" \
  CHANGED_FILES_ENV="$changed_block" \
  TEST_RESULTS_ENV="$tests_block" \
  python3 - "$template_path" "$summary_file" <<'PY'
import os
import sys

src = sys.argv[1]
out = sys.argv[2]
with open(src, encoding="utf-8") as handle:
    template = handle.read()

rendered = (
    template.replace("{{SPEC_ID}}", os.environ["SPEC_ID_ENV"])
    .replace("{{TITLE}}", os.environ["TITLE_ENV"])
    .replace("{{BRANCH}}", os.environ["BRANCH_ENV"])
    .replace("{{BASE_BRANCH}}", os.environ["BASE_BRANCH_ENV"])
    .replace("{{SPEC_PATH}}", os.environ["SPEC_PATH_ENV"])
    .replace("{{CHANGED_FILES}}", os.environ["CHANGED_FILES_ENV"])
    .replace("{{TEST_RESULTS}}", os.environ["TEST_RESULTS_ENV"])
)

with open(out, "w", encoding="utf-8") as handle:
    handle.write(rendered)
PY

  echo "$summary_file"
}

create_or_print_pr() {
  local summary_file pr_title
  summary_file="$1"
  pr_title="[$SPEC_ID] $TITLE"

  if (( NO_PR == 1 )); then
    echo "[spec-dispatch] Skipping PR creation (--no-pr)."
    echo "[spec-dispatch] PR body file: $summary_file"
    return
  fi

  if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
    (
      cd "$REPO_ROOT"
      gh pr create --base "$BASE_BRANCH" --head "$BRANCH" --title "$pr_title" --body-file "$summary_file"
    ) && return
    echo "[spec-dispatch] gh pr create failed. Falling back to manual instructions." >&2
  fi

  cat <<MANUAL
[spec-dispatch] Create PR manually:
  Base branch: $BASE_BRANCH
  Head branch: $BRANCH
  Title: $pr_title
  Body file: $summary_file

If gh is installed and authenticated, run:
  gh pr create --base "$BASE_BRANCH" --head "$BRANCH" --title "$pr_title" --body-file "$summary_file"
MANUAL
}

ensure_branch
bootstrap_ui_deps_if_missing

echo "[spec-dispatch] Spec: $SPEC_ID (wave $WAVE)"
echo "[spec-dispatch] Branch: $BRANCH"
echo "[spec-dispatch] Base branch: $BASE_BRANCH"
echo "[spec-dispatch] Owned paths: ${#OWNED_PATHS[@]}"

if [[ "$PHASE" == "pre" ]]; then
  echo "[spec-dispatch] Pre phase complete. Implement the spec, then run finalize phase."
  exit 0
fi

validate_owned_paths
run_test_commands
validate_owned_paths
SUMMARY_FILE="$(write_pr_summary)"

echo "[spec-dispatch] Wrote PR summary: $SUMMARY_FILE"
create_or_print_pr "$SUMMARY_FILE"

echo "[spec-dispatch] Finalize phase complete."
