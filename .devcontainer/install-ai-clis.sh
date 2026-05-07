#!/usr/bin/env bash
set -euo pipefail

required_tools=(node npm)
for tool in "${required_tools[@]}"; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "Missing required tool: $tool" >&2
    exit 1
  fi
done

installed_version() {
  local package_name="$1"

  if ! npm list -g "$package_name" --depth=0 --json 2>/dev/null \
    | PACKAGE_NAME="$package_name" node -e '
const fs = require("fs");
const input = fs.readFileSync(0, "utf8");
const packageName = process.env.PACKAGE_NAME;

try {
  const parsed = JSON.parse(input);
  const version = parsed.dependencies?.[packageName]?.version;
  if (version) {
    process.stdout.write(version);
  }
} catch {
  process.exit(0);
}
'; then
    true
  fi
}

packages=("@openai/codex" "opencode-ai")
install_specs=()

for package_name in "${packages[@]}"; do
  latest_version="$(npm view "$package_name" version)"
  current_version="$(installed_version "$package_name")"

  if [[ "$current_version" == "$latest_version" ]]; then
    echo "$package_name is current ($current_version)."
    continue
  fi

  if [[ -z "$current_version" ]]; then
    echo "$package_name is not installed. Will install $latest_version."
  else
    echo "$package_name is $current_version. Will update to $latest_version."
  fi

  install_specs+=("$package_name@$latest_version")
done

if (( ${#install_specs[@]} > 0 )); then
  npm install -g --no-audit --no-fund --prefer-offline "${install_specs[@]}"
fi

codex --version
opencode --version
