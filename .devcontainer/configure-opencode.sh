#!/usr/bin/env bash
set -euo pipefail

if ! command -v node >/dev/null 2>&1; then
  echo "Missing required tool: node" >&2
  exit 1
fi

config_path="${1:-${XDG_CONFIG_HOME:-${HOME:-/home/vscode}/.config}/opencode/opencode.json}"
mkdir -p "$(dirname "$config_path")"

CONFIG_PATH="$config_path" node <<'NODE'
const fs = require("fs");
const configPath = process.env.CONFIG_PATH;

let config = {};
if (fs.existsSync(configPath)) {
  const contents = fs.readFileSync(configPath, "utf8").trim();
  if (contents) {
    try {
      config = JSON.parse(contents);
    } catch (error) {
      console.error(`Unable to parse existing OpenCode config at ${configPath}: ${error.message}`);
      process.exit(1);
    }
  }
}

if (!config || typeof config !== "object" || Array.isArray(config)) {
  config = {};
}

const permissions =
  config.permission && typeof config.permission === "object" && !Array.isArray(config.permission)
    ? config.permission
    : {};
const mcp =
  config.mcp && typeof config.mcp === "object" && !Array.isArray(config.mcp)
    ? config.mcp
    : {};

config.$schema ??= "https://opencode.ai/config.json";
config.permission = {
  ...permissions,
  websearch: "allow",
};
config.mcp = {
  ...mcp,
  "ffthh-project-expert": {
    type: "local",
    command: [
      "node",
      "/workspaces/ffthh-game-of-life/tools/project-expert-mcp/bin/project-expert-mcp.js",
    ],
    enabled: true,
  },
};

fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
console.log(`OpenCode websearch and project expert MCP configured in ${configPath}.`);
NODE
