# Deferred OpenCode MCP Lab

> Status: future lab material. None of the MCP servers below are installed, configured, authenticated, or tested by the current repository setup.

The dev container starts OpenCode as a deliberately limited AI chat harness. Its built-in tools are denied, project-level OpenCode configuration is ignored, and only OpenAI is enabled as a model provider. The managed policy reserves four MCP tool namespaces, but those rules grant no capability until you explicitly configure the corresponding MCP servers.

Before teaching this lab, recheck every package version, remote endpoint, OAuth field, and resulting tool name against current upstream documentation. The examples below were prepared on 2026-08-13 for OpenCode 1.18.18.

## How the exercises modify OpenCode

Add each MCP to the container user's global configuration at `~/.config/opencode/opencode.json`. Do not add it to the repository-level `opencode.json`; project config discovery is disabled in this lab.

Use these fixed server names because OpenCode prefixes MCP tools with the server name and the managed policy only recognizes `filesystem_*`, `github_*`, `slack_send_message`, and `playwright_*`.

After each edit, restart OpenCode and check the connection:

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

This activity uses the Model Context Protocol reference filesystem server. It deliberately exposes only `src/ui`; its server-side path restriction is the capability boundary.

Add this entry under a top-level `mcp` object in `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "filesystem": {
      "type": "local",
      "command": [
        "npx",
        "-y",
        "@modelcontextprotocol/server-filesystem@2026.7.10",
        "/workspaces/ffthh-game-of-life/src/ui"
      ],
      "enabled": true
    }
  }
}
```

Success prompt:

> Use the filesystem MCP to read `src/ui/src/App.jsx` and summarize the component's responsibilities.

Boundary prompt:

> Use the filesystem MCP to read `/workspaces/ffthh-game-of-life/terraform/main.tf`.

Expected result: the first request succeeds and the second is rejected because `terraform` is outside the allowed directory. Before using writes, work on a disposable branch and ask the MCP to make a small change under `src/ui`, then inspect the Git diff yourself.

Cleanup: remove the `filesystem` entry and restart OpenCode. The local server exits with its OpenCode session.

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
