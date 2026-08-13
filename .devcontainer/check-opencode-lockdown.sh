#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
managed_dir="$script_dir/opencode-managed"
managed_config="$managed_dir/opencode.json"

for setting in OPENCODE_DISABLE_LSP_DOWNLOAD OPENCODE_PURE; do
  if ! grep -Eq "\"$setting\"[[:space:]]*:[[:space:]]*\"true\"" "$script_dir/devcontainer.json"; then
    echo "Missing required dev-container setting: $setting=true" >&2
    exit 1
  fi
done

if ! grep -Eq '"OPENCODE_DISABLE_PROJECT_CONFIG"[[:space:]]*:[[:space:]]*"false"' "$script_dir/devcontainer.json"; then
  echo "Project-level OpenCode configuration must be enabled for the MCP lab." >&2
  exit 1
fi

MANAGED_CONFIG="$managed_config" node <<'NODE'
const fs = require("fs");
const config = JSON.parse(fs.readFileSync(process.env.MANAGED_CONFIG, "utf8"));
const expectedPermissions = {
  "*": "deny",
  "lsp": "deny",
  "filesystem_*": "allow",
  "github_*": "allow",
  "slack_send_message": "allow",
  "playwright_*": "allow",
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(JSON.stringify(config.enabled_providers) === JSON.stringify(["openai"]), "OpenAI must be the only provider");
assert(config.provider?.openai?.options?.baseURL === "https://api.openai.com/v1", "OpenAI must use the canonical API endpoint");
assert(config.lsp === false, "OpenCode LSP must be disabled");
assert(JSON.stringify(config.permission) === JSON.stringify(expectedPermissions), "Managed permissions do not match the lockdown policy");
assert(JSON.stringify(config.agent?.build?.permission) === JSON.stringify(expectedPermissions), "Build-agent permissions do not match the lockdown policy");
assert(JSON.stringify(config.agent?.plan?.permission) === JSON.stringify(expectedPermissions), "Plan-agent permissions do not match the lockdown policy");
assert(Array.isArray(config.plugin) && config.plugin.length === 0, "Plugins must be disabled");
assert(config.share === "disabled", "Session sharing must be disabled");
assert(config.autoupdate === false, "OpenCode autoupdate must be disabled");
assert(config.mcp === undefined, "The baseline must not configure MCP servers");
NODE

echo "OK: managed OpenCode config has the expected static lockdown."

if ! command -v opencode >/dev/null 2>&1; then
  echo "SKIP: opencode is not installed; resolved-config checks require the rebuilt dev container."
  exit 0
fi

expected_opencode_version="1.17.5"
installed_opencode_version="$(opencode --version)"
if [[ "$installed_opencode_version" != "$expected_opencode_version" ]]; then
  echo "Unsafe OpenCode version for the scoped filesystem lab: expected $expected_opencode_version, found $installed_opencode_version. Rebuild the dev container." >&2
  exit 1
fi

echo "OK: OpenCode $installed_opencode_version does not advertise the repository through MCP Roots."

test_config_home="$(mktemp -d)"
test_project="$(mktemp -d)"
trap 'rm -rf "$test_config_home" "$test_project"' EXIT

(
  cd "$test_project"
  OPENCODE_TEST_MANAGED_CONFIG_DIR="$managed_dir" \
  OPENCODE_DISABLE_PROJECT_CONFIG="false" \
  OPENCODE_PURE="true" \
  OPENCODE_CONFIG_CONTENT='{"enabled_providers":["anthropic"],"provider":{"openai":{"options":{"baseURL":"https://example.invalid/v1"}}},"lsp":true,"permission":"allow","plugin":["example-plugin"],"share":"auto","autoupdate":true}' \
  XDG_CONFIG_HOME="$test_config_home" \
  opencode debug config
) | node "$script_dir/check-opencode-resolved.js"

echo "OK: managed OpenCode settings override conflicting inline configuration."

TEST_PROJECT="$test_project" node <<'NODE'
const fs = require("fs");
const path = require("path");
const project = process.env.TEST_PROJECT;

fs.writeFileSync(
  path.join(project, "opencode.json"),
  JSON.stringify({
    enabled_providers: ["anthropic"],
    provider: { openai: { options: { baseURL: "https://example.invalid/v1" } } },
    lsp: true,
    permission: "allow",
    plugin: ["example-plugin"],
    share: "auto",
    autoupdate: true,
    agent: { build: { permission: { "*": "allow" } } },
    mcp: {
      unexpected: {
        type: "local",
        command: ["node", "unexpected-mcp.js"],
      },
    },
  }),
);
NODE

(
  cd "$test_project"
  OPENCODE_TEST_MANAGED_CONFIG_DIR="$managed_dir" \
  OPENCODE_DISABLE_PROJECT_CONFIG="false" \
  OPENCODE_PURE="true" \
  XDG_CONFIG_HOME="$test_config_home" \
  opencode debug config
) | EXPECTED_MCP_NAME="unexpected" node "$script_dir/check-opencode-resolved.js"

echo "OK: project MCP configuration is discovered while managed restrictions remain enforced."
