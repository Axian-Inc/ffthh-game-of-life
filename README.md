# Modern Game of Life

Modern Game of Life is a web implementation of a Game of Life-inspired educational experience. The repository contains a React/Vite UI, an AWS-backed game storage API, and Terraform infrastructure for deployment.

## Prerequisites

1. Node.js and npm
2. Terraform `~> 1.10`
3. AWS CLI configured for the target AWS account in `us-west-2`

## Optional dev container

The repository includes a VS Code dev container with Terraform, AWS CLI, Node.js, Chromium, Codex CLI, and OpenCode preinstalled for a consistent local environment. Codex CLI and a pinned OpenCode release are installed from npm during container creation and reuse a persistent npm cache across rebuilds.

OpenCode is intentionally a chat-only harness in the container:

- A root-owned `/etc/opencode/opencode.json` allows only the OpenAI provider.
- Built-in tools, plugins, sharing, project config discovery, and OpenCode LSP support are disabled.
- No MCP server is installed or configured by default.

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

Keep API keys out of the repository. The [official OpenAI documentation](https://developers.openai.com/api/reference/overview#authentication) recommends loading API keys from an environment variable or a server-side secret manager. Deferred MCP lab activities are documented in `docs/opencode-mcp-lab.md`; they are guidance only and have not been enabled or tested in the baseline harness.

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
- Deferred OpenCode MCP lab: `docs/opencode-mcp-lab.md`
- Script usage: `scripts/README.md`
