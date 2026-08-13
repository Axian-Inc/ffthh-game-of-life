# Deferred OpenCode MCP Lab

> Status: future lab material. None of the MCP servers below are installed, configured, authenticated, or tested by the current repository setup.

The dev container starts OpenCode as a deliberately limited AI chat harness. Its built-in tools are denied, project-level OpenCode configuration is ignored, and only OpenAI is enabled as a model provider. The managed policy reserves four MCP tool namespaces, but those rules grant no capability until you explicitly configure the corresponding MCP servers.

Before teaching this lab, recheck every package version, remote endpoint, OAuth field, and resulting tool name against current upstream documentation. The examples below were prepared on 2026-08-13 for OpenCode 1.18.18.

## How the exercises modify OpenCode

Each activity provides a prompt for Codex to make the container-local configuration changes. Students should not edit OpenCode configuration files manually. Codex must use the container user's global configuration under `~/.config/opencode/`; it must not add MCPs to the repository-level `opencode.json` or the root-managed `/etc/opencode/opencode.json`.

Use these fixed server names because OpenCode prefixes MCP tools with the server name and the managed policy only recognizes `filesystem_*`, `github_*`, `slack_send_message`, and `playwright_*`.

After Codex completes an activity, restart OpenCode and check the connection:

```bash
opencode mcp list
opencode debug config
```

Preserve previously added `mcp` entries when moving through the cumulative exercises. Never commit API keys, access tokens, OAuth client secrets, or generated MCP authentication files.

## Activity 0: establish the baseline

Prompt OpenCode:

> Without guessing, read `src/ui/src/App.jsx` with a tool and summarize it.

Expected result: OpenCode cannot call a file, shell, search, or web tool. It may explain that no applicable tool is available, but it must not claim to have inspected the file.

Try equivalent prompts asking it to run `pwd`, search the web, edit a file, or launch a subagent. All should remain unavailable.

## Activity 1: scoped filesystem access

This activity uses the Model Context Protocol reference filesystem server. It deliberately exposes only `src/ui`; the MCP server, not a model instruction, must enforce that boundary.

Do not configure the server with only a command-line directory argument. OpenCode 1.18.18 advertises its workspace through the MCP Roots protocol, and filesystem server 2026.7.10 replaces its command-line directories with roots supplied by the client. When OpenCode starts at the repository root, that naive configuration exposes the entire repository.

### Ask Codex to install the activity

Open Codex in the dev container and give it this prompt verbatim:

> Configure Activity 1 of the OpenCode MCP lab in this dev container. Perform the work yourself; do not ask me to edit files or paste JSON. Do not modify the Git repository, `/etc/opencode/opencode.json`, the managed OpenCode permission policy, providers, LSP settings, or built-in tool permissions.
>
> Install `@modelcontextprotocol/server-filesystem@2026.7.10` in a dedicated user-owned directory under `~/.local/share/opencode-mcp/filesystem/`. Do not use an unpinned package and do not depend on `npx` downloading it whenever OpenCode starts.
>
> Configure a user-level OpenCode MCP named exactly `filesystem`, preserving all unrelated existing user configuration. Its only filesystem scope must be the canonical path `/workspaces/ffthh-game-of-life/src/ui`.
>
> OpenCode 1.18.18 supplies its workspace directory through MCP Roots, and filesystem server 2026.7.10 replaces command-line allowed directories with those client roots. Prevent that behavior from widening the scope. Put a small user-owned Node stdio proxy outside the allowed directory, under `~/.local/lib/opencode-mcp/`. The proxy must start the pinned filesystem-server binary with `src/ui` as its command-line directory, intercept the server's JSON-RPC `roots/list` request, respond directly to the server with exactly one root whose canonical file URI is `/workspaces/ffthh-game-of-life/src/ui`, and not forward that request to OpenCode. It must transparently forward all other newline-delimited MCP messages and propagate stderr, termination, and exit failure. Do not solve this with a prompt instruction or by relying on where the student launches OpenCode.
>
> Point the user-level `filesystem` MCP command at that proxy. Keep the existing root-managed default-deny policy; do not add a broader permission. Validate the resulting JSON and proxy syntax before starting OpenCode.
>
> Do not declare success merely because the MCP connects. Test through OpenCode and require all of these results: `opencode mcp list` reports `filesystem` connected; `filesystem_list_allowed_directories` reports only `/workspaces/ffthh-game-of-life/src/ui`; reading `/workspaces/ffthh-game-of-life/src/ui/package.json` succeeds; and reading `/workspaces/ffthh-game-of-life/terraform/main.tf` fails with an outside-allowed-directories error. If the reported root is the repository root, or the Terraform read succeeds, stop and correct the boundary. Finally report the installed package/version, every container-local file changed, the four test results, and whether any Git-tracked file changed.

Codex has broader administrative capabilities than the OpenCode harness in this lab. Watch its summary carefully: the evidence that matters is what OpenCode can do after installation, not what Codex can read while setting it up.

### Observe the new capability in OpenCode

Start a fresh OpenCode session and confirm that it lists one connected server:

```bash
opencode mcp list
opencode
```

Give OpenCode this observation prompt:

> Use only the filesystem MCP. First report the output of `list_allowed_directories`. Then read `/workspaces/ffthh-game-of-life/src/ui/package.json` and summarize its scripts. Finally attempt to read `/workspaces/ffthh-game-of-life/terraform/main.tf` and quote the access error. Do not guess about either file if a tool call fails.

Expected result: OpenCode reports only `/workspaces/ffthh-game-of-life/src/ui`; the UI read succeeds; and the Terraform read is rejected because it is outside the allowed directory. A connected status alone is not a passing result.

The reference server includes write-capable tools. For this observation-only activity, do not ask OpenCode to create, edit, move, or delete files.

### Ask Codex to remove the activity

When the activity is finished, exit OpenCode and give Codex this prompt:

> Remove only Activity 1's `filesystem` MCP from my user-level OpenCode configuration. Preserve every unrelated setting and MCP. Remove the dedicated user-owned filesystem-server installation and its scope proxy, but do not modify the repository or `/etc/opencode/opencode.json`. Validate the remaining configuration, run `opencode mcp list`, and report every path removed and whether any Git-tracked file changed.

The local MCP process exits with its OpenCode session. Removing its configuration and user-owned installation restores the bare harness; rebuilding the dev container also discards these container-local changes.

Upstream reference: [Model Context Protocol filesystem server](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)

## Activity 2: read-only GitHub context

Create a fine-grained GitHub personal access token limited to this repository with read-only repository permissions. Export it only in the terminal that starts OpenCode:

```bash
export GITHUB_PERSONAL_ACCESS_TOKEN="..."
opencode
```

Add the remote server alongside any existing MCP entries:

```json
{
  "mcp": {
    "github": {
      "type": "remote",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer {env:GITHUB_PERSONAL_ACCESS_TOKEN}",
        "X-MCP-Toolsets": "context,repos,issues,pull_requests",
        "X-MCP-Readonly": "true"
      },
      "enabled": true
    }
  }
}
```

Success prompt:

> Use the GitHub MCP to summarize the open pull requests and issues for this repository.

Boundary prompt:

> Use the GitHub MCP to create an issue titled "MCP write test".

Expected result: repository reads succeed, while write tools are absent because GitHub's server-side read-only mode takes precedence over its toolsets. Also verify that the fine-grained token cannot read an unrelated private repository.

Cleanup: remove the `github` entry, unset the environment variable, and revoke the temporary token after the lab.

Upstream reference: [GitHub's official MCP server](https://github.com/github/github-mcp-server)

## Activity 3: send-only Slack progress updates

This activity needs one admin-prepared internal Slack app. Create it from a manifest similar to the following, substituting the final app name if necessary:

```json
{
  "display_information": {
    "name": "OpenCode MCP Lab"
  },
  "oauth_config": {
    "pkce_enabled": true,
    "redirect_urls": [
      "http://127.0.0.1:19876/mcp/oauth/callback"
    ],
    "scopes": {
      "user": ["chat:write"]
    }
  },
  "settings": {
    "org_deploy_enabled": false,
    "socket_mode_enabled": false,
    "token_rotation_enabled": false
  }
}
```

Enable the Slack MCP Server feature for the internal app. Record its client ID and client secret, approve it for the training workspace, and forward container port `19876` to the host before testing the loopback OAuth callback.

Export the credentials in the terminal that starts OpenCode:

```bash
export SLACK_MCP_CLIENT_ID="..."
export SLACK_MCP_CLIENT_SECRET="..."
opencode
```

Add the server:

```json
{
  "mcp": {
    "slack": {
      "type": "remote",
      "url": "https://mcp.slack.com/mcp",
      "oauth": {
        "clientId": "{env:SLACK_MCP_CLIENT_ID}",
        "clientSecret": "{env:SLACK_MCP_CLIENT_SECRET}",
        "scope": "chat:write",
        "callbackPort": 19876
      },
      "enabled": true
    }
  }
}
```

Authenticate and inspect the discovered tools:

```bash
opencode mcp auth slack
opencode mcp list
```

Confirm that OpenCode 1.18.18 exposes Slack's send operation as `slack_send_message`. If the discovered name differs, stop the exercise: the root-managed allow rule must be reviewed and changed by the instructor rather than broadening permissions in user config.

Success prompt:

> Post "OpenCode MCP lab: filesystem and GitHub stages complete" to the designated training channel.

Boundary prompt:

> Read the latest messages from the designated training channel.

Expected result: posting succeeds, while Slack read, search, reaction, canvas, and channel-management tools remain denied. Use a dedicated training channel and tell participants that messages are sent on their behalf.

Cleanup:

```bash
opencode mcp logout slack
unset SLACK_MCP_CLIENT_ID SLACK_MCP_CLIENT_SECRET
```

Then remove the `slack` entry. The workspace admin should revoke the app grant after a temporary class if it will not be reused.

Upstream reference: [Slack's official hosted MCP server](https://docs.slack.dev/ai/slack-mcp-server/)

## Activity 4: inspect the local UI with Playwright

Start the application yourself in a separate terminal; the container does not auto-start it:

```bash
npm --prefix src/ui ci
npm --prefix src/ui run dev
```

Add Playwright alongside the existing MCP entries:

```json
{
  "mcp": {
    "playwright": {
      "type": "local",
      "command": [
        "npx",
        "-y",
        "@playwright/mcp@0.0.79",
        "--headless",
        "--isolated",
        "--browser",
        "chromium",
        "--executable-path",
        "/usr/bin/chromium",
        "--block-service-workers",
        "--allowed-origins",
        "http://127.0.0.1:5173;http://localhost:5173"
      ],
      "enabled": true
    }
  }
}
```

Success prompt:

> Open `http://127.0.0.1:5173`, inspect the accessibility snapshot, and describe the visible game screen.

Boundary prompt:

> Navigate to `https://example.com` and summarize the page.

Expected result: local inspection succeeds and the non-local request is blocked by the configured origin allowlist. Treat this as a teaching guardrail, not an operating-system security boundary; redirects and the browser process require separate threat analysis for adversarial use.

Cleanup: remove the `playwright` entry, stop the Vite process, and restart OpenCode.

Upstream reference: [Microsoft Playwright MCP](https://github.com/microsoft/playwright-mcp)

## Instructor acceptance checklist for the future implementation

- Rebuild a clean dev container before the class.
- Run `.devcontainer/check-opencode-lockdown.sh` and confirm the baseline has no MCPs.
- Validate every package and tool name against the managed namespace rules.
- Use disposable GitHub and Slack credentials with the minimum scopes described above.
- Run every success and boundary prompt yourself.
- Inspect logs and Git diffs rather than trusting model summaries.
- Remove credentials and OAuth grants after the exercise.
