#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  bash scripts/spec-launch.sh [SPEC_ID] [launch|pre|finalize]

Examples:
  bash scripts/spec-launch.sh W1-S2
  bash scripts/spec-launch.sh W1-S2 pre
  bash scripts/spec-launch.sh W1-S2 finalize

Notes:
  - Run this from the main repo checkout, not inside a spec worktree.
  - If SPEC_ID is omitted, it is inferred from the current directory name when possible.
  - `launch` runs spec-dispatch preflight, sets default local env, and opens codex.
  - `finalize` runs spec-dispatch finalize with `--no-pr`.
USAGE
}

fail() {
  echo "[spec-launch] ERROR: $*" >&2
  exit 1
}

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
dispatch_script="$repo_root/skills/spec-dispatch/scripts/dispatch_spec.sh"

[[ -f "$dispatch_script" ]] || fail "Dispatcher not found: $dispatch_script"

spec_id=""
mode="launch"

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    launch|pre|finalize)
      mode="$1"
      ;;
    W[0-9]-S[0-9]*|w[0-9]-s[0-9]*)
      [[ -z "$spec_id" ]] || fail "Only one SPEC_ID is allowed"
      spec_id="${1^^}"
      ;;
    *)
      fail "Unknown argument: $1"
      ;;
  esac
  shift
done

if [[ -z "$spec_id" ]]; then
  current_dir_name="${PWD##*/}"
  if [[ "$current_dir_name" =~ ^W[0-9]-S[0-9]+$ ]]; then
    spec_id="$current_dir_name"
  fi
fi

[[ -n "$spec_id" ]] || fail "Missing SPEC_ID (example: W1-S2)"

case "$spec_id" in
  W1-S1) spec_rel="specs/wave-1/W1-S1-setup-data-contracts.md" ;;
  W1-S2) spec_rel="specs/wave-1/W1-S2-wizard-modal-ui.md" ;;
  W1-S3) spec_rel="specs/wave-1/W1-S3-welcome-screen-ui.md" ;;
  W1-S4) spec_rel="specs/wave-1/W1-S4-game-hub-home-ui.md" ;;
  *) fail "Unsupported SPEC_ID: $spec_id" ;;
esac

worktree_root="$repo_root/worktrees/$spec_id"
[[ -d "$worktree_root" ]] || fail "Worktree not found: $worktree_root"

spec_abs="$worktree_root/$spec_rel"
[[ -f "$spec_abs" ]] || fail "Spec file not found: $spec_abs"

current_branch="$(git -C "$worktree_root" branch --show-current)"
prefix="${SPEC_BRANCH_PREFIX:-}"
if [[ -z "$prefix" ]]; then
  [[ "$current_branch" == */* ]] || fail "Cannot infer SPEC_BRANCH_PREFIX from branch: $current_branch"
  prefix="${current_branch%%/*}"
fi

export SPEC_BRANCH_PREFIX="$prefix"
export CHROME_BIN="${CHROME_BIN:-/usr/bin/chromium}"
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD="${PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD:-1}"
export VITE_STORAGE_MODE="${VITE_STORAGE_MODE:-local}"

run_dispatch() {
  (
    cd "$worktree_root"
    bash "$dispatch_script" "$spec_abs" "$@"
  )
}

echo "[spec-launch] Spec: $spec_id"
echo "[spec-launch] Worktree: $worktree_root"
echo "[spec-launch] Branch prefix: $SPEC_BRANCH_PREFIX"

case "$mode" in
  pre)
    run_dispatch --phase pre
    ;;
  finalize)
    run_dispatch --phase finalize --no-pr
    ;;
  launch)
    command -v codex >/dev/null 2>&1 || fail "codex is not installed or not on PATH"
    run_dispatch --phase pre
    prompt="Read ./skills/spec-dispatch/SKILL.md, then execute ./$spec_rel from this worktree only. Read ./docs/modern-game-of-life-prd.md, ./docs/ARCHITECTURE.md, ./docs/game-of-life-style-guide.md, and any normative reference inputs named in the spec before editing. Treat the spec and those inputs as authoritative. Only edit owned_paths. Run all test_commands until green. Finish by running: SPEC_BRANCH_PREFIX=$SPEC_BRANCH_PREFIX bash skills/spec-dispatch/scripts/dispatch_spec.sh $spec_abs --phase finalize --no-pr. Report changed files, test results, and the PR summary path."
    cd "$worktree_root"
    exec codex --yolo "$prompt"
    ;;
esac
