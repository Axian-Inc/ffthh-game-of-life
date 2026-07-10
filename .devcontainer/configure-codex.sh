#!/usr/bin/env bash
set -euo pipefail

if ! command -v codex >/dev/null 2>&1; then
  echo "Missing required tool: codex" >&2
  exit 1
fi

server_name="ffthh-project-expert"
server_path="/workspaces/ffthh-game-of-life/tools/project-expert-mcp/bin/project-expert-mcp.js"

# Re-register the entry so a stale command from an earlier container is corrected.
codex mcp remove "$server_name" >/dev/null 2>&1 || true
codex mcp add "$server_name" -- node "$server_path"

echo "Codex project expert MCP configured."
