# Modern Game of Life

Modern Game of Life is a web implementation of a Game of Life-inspired educational experience. The repository contains a React/Vite UI, an AWS-backed game storage API, and Terraform infrastructure for deployment.

## Prerequisites

1. Node.js and npm
2. Terraform `~> 1.10`
3. AWS CLI configured for the target AWS account in `us-west-2`

## Optional dev container

The repository includes a VS Code dev container with Terraform, AWS CLI, Node.js, Chromium, Codex CLI, OpenCode, and the official GitHub MCP Server preinstalled for a consistent local environment. Codex CLI and a pinned OpenCode release are installed from npm during container creation and reuse a persistent npm cache across rebuilds. The GitHub MCP Server is pinned and checksum-verified during installation.

OpenCode is intentionally a chat-only harness in the container:

- A root-owned `/etc/opencode/opencode.json` allows only the OpenAI provider.
- Built-in tools, plugins, sharing, and OpenCode LSP support are disabled.
- Project configuration is enabled for the MCP lab, but root-managed policy restricts tools to the reviewed MCP namespaces.
- No MCP server is configured or connected by default.

Rebuild the container after changing its configuration. In the rebuilt container, authenticate OpenAI with `/connect`, then verify the lockdown with:

```bash
.devcontainer/check-opencode-lockdown.sh
opencode debug config
opencode mcp list
```

If `opencode` is not found after pulling these files into an existing container, rebuild the dev container or install it into the current container with:

```bash
bash .devcontainer/install-ai-clis.sh
```

Keep API keys and private keys out of version control. The [official OpenAI documentation](https://developers.openai.com/api/reference/overview#authentication) recommends loading API keys from an environment variable or a server-side secret manager. The hands-on MCP activities are documented in `docs/opencode-mcp-lab.md`; the servers remain unconfigured until a student completes them.

## First-time setup

1. Configure AWS credentials with `aws configure`.
2. Initialize Terraform:
   `terraform -chdir=terraform init -reconfigure`
3. Select or create a non-default Terraform workspace:
   `terraform -chdir=terraform workspace new <name>`
   or
   `terraform -chdir=terraform workspace select <name>`

Do not run Terraform in the `default` workspace.

## Common commands

1. Install UI dependencies:
   `npm --prefix src/ui ci`
2. Run UI unit tests:
   `npm --prefix src/ui run test:ci`
3. Run UI end-to-end tests:
   `npm --prefix src/ui run test:e2e:ci`
4. Run deployment preflight checks:
   `scripts/check.sh`
5. Deploy the application:
   `scripts/deploy.sh`

## Documentation

- Product requirements: `docs/modern-game-of-life-prd.md`
- Architecture: `docs/ARCHITECTURE.md`
- UI style guide: `docs/game-of-life-style-guide.md`
- OpenCode MCP lab: `docs/opencode-mcp-lab.md`
- Script usage: `scripts/README.md`
