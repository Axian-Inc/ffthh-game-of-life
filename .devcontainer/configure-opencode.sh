#!/usr/bin/env bash
set -euo pipefail

if ! command -v node >/dev/null 2>&1; then
  echo "Missing required tool: node" >&2
  exit 1
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source_path="$script_dir/opencode-managed/opencode.json"
config_path="${1:-/etc/opencode/opencode.json}"

SOURCE_PATH="$source_path" node <<'NODE'
const fs = require("fs");
const sourcePath = process.env.SOURCE_PATH;

try {
  JSON.parse(fs.readFileSync(sourcePath, "utf8"));
} catch (error) {
  console.error(`Unable to parse managed OpenCode config at ${sourcePath}: ${error.message}`);
  process.exit(1);
}
NODE

if [[ "$config_path" == /etc/opencode/* ]]; then
  sudo install -d -o root -g root -m 0755 "$(dirname "$config_path")"
  sudo install -o root -g root -m 0644 "$source_path" "$config_path"
else
  install -D -m 0644 "$source_path" "$config_path"
fi

echo "OpenCode managed lockdown installed at $config_path."
