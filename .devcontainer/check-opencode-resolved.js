const fs = require("fs");

const config = JSON.parse(fs.readFileSync(0, "utf8"));
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

assert(JSON.stringify(config.enabled_providers) === JSON.stringify(["openai"]), "Managed provider allowlist was overridden");
assert(config.provider?.openai?.options?.baseURL === "https://api.openai.com/v1", "Managed OpenAI endpoint was overridden");
assert(config.lsp === false, "Managed LSP setting was overridden");
assert(JSON.stringify(config.permission) === JSON.stringify(expectedPermissions), "Managed permissions were overridden");
assert(JSON.stringify(config.agent?.build?.permission) === JSON.stringify(expectedPermissions), "Managed build-agent permissions were overridden");
assert(JSON.stringify(config.agent?.plan?.permission) === JSON.stringify(expectedPermissions), "Managed plan-agent permissions were overridden");
assert(Array.isArray(config.plugin) && config.plugin.length === 0, "Managed plugin lockdown was overridden");
assert(config.share === "disabled", "Managed sharing lockdown was overridden");
assert(config.autoupdate === false, "Managed autoupdate setting was overridden");
const expectedMcpName = process.env.EXPECTED_MCP_NAME;
if (expectedMcpName) {
  assert(config.mcp?.[expectedMcpName], `Expected project MCP server was not resolved: ${expectedMcpName}`);
} else {
  assert(config.mcp === undefined || Object.keys(config.mcp).length === 0, "Baseline unexpectedly resolved an MCP server");
}
