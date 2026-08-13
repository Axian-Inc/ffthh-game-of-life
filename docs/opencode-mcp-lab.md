# OpenCode MCP Lab

OpenCode starts with chat only. In this lab, you will add four narrowly scoped Model Context Protocol (MCP) servers, test each new capability, and then combine them in one workflow.

## Before you start

Rebuild the dev container, open the repository root, and connect OpenCode to OpenAI with `/connect`.

Use the two agents for different jobs:

- Run each **Before**, **After**, and **Boundary** prompt manually in OpenCode.
- Paste each **Codex prompt** into Codex. Codex will update the root `opencode.json` while preserving earlier activities.

After Codex changes the configuration, inspect it and restart OpenCode:

```bash
git diff -- opencode.json
opencode mcp list
```

The activities are cumulative. Do not remove an MCP entry after completing an activity. Never paste credentials or PEM contents into either agent or `opencode.json`.

## Activity 1: give OpenCode scoped filesystem access

You will expose only `src/ui` so OpenCode can work on the UI without reading the rest of the repository.

### Before

Ask OpenCode:

> Read `src/ui/src/App.jsx` with a tool and summarize its responsibilities. Do not guess.

The request should fail because OpenCode has no file tool.

### Configure with Codex

Paste into Codex:

> Update the root `opencode.json` to add a local MCP server named `filesystem`. Run `npx -y @modelcontextprotocol/server-filesystem@2026.7.10` and allow only `/workspaces/ffthh-game-of-life/src/ui`. Enable the server and preserve every existing setting. Show me the diff when done.

Restart OpenCode.

### After

> Use the filesystem MCP to read `src/ui/src/App.jsx` and summarize its responsibilities.

### Boundary

> Use the filesystem MCP to read `/workspaces/ffthh-game-of-life/terraform/main.tf`.

Reading `App.jsx` should succeed. Reading `terraform/main.tf` should be rejected because it is outside the allowed directory.

## Activity 2: read GitHub through a read-only app

You will connect an instructor-provided GitHub App. Its installation and the MCP server are both read-only, so OpenCode can inspect repository work without changing it.

Copy the supplied `ffthh-open-code-read-only.pem` into the repository root. This PEM is the GitHub App's private key; it is ignored by Git. Restrict its permissions and export the IDs supplied by the instructor in the terminal that will start OpenCode:

```bash
chmod 600 ffthh-open-code-read-only.pem
export GITHUB_APP_ID="<APP_ID>"
export GITHUB_APP_INSTALLATION_ID="<INSTALLATION_ID>"
```

### Before

> Use a GitHub tool to list the open issues in `Axian-Inc/ffthh-game-of-life`. Do not use the public web.

The request should fail because no GitHub MCP is connected.

### Configure with Codex

> Update the root `opencode.json` and preserve the filesystem MCP. Add an enabled local MCP server named `github` using the preinstalled `/usr/local/bin/github-mcp-server`. Run it with `stdio`, `--read-only`, and `--toolsets repos,issues,pull_requests`. Pass `GITHUB_APP_ID` and `GITHUB_APP_INSTALLATION_ID` from the current environment, and set `GITHUB_APP_PRIVATE_KEY_PATH` to `/workspaces/ffthh-game-of-life/ffthh-open-code-read-only.pem`. Do not read or print the PEM. Show me the diff when done.

Restart OpenCode from the terminal where the two ID variables are exported.

### After

> Use the GitHub MCP to list the open issues and pull requests in `Axian-Inc/ffthh-game-of-life`.

### Boundary

> Use the GitHub MCP to create an issue titled `MCP write test` in `Axian-Inc/ffthh-game-of-life`.

Reads should succeed. Issue creation should be unavailable because the server runs in read-only mode.

Reference: [GitHub MCP Server—GitHub App authentication](https://github.com/github/github-mcp-server/blob/main/docs/github-app-auth.md)

## Activity 3: inspect the UI with Playwright

You will give OpenCode a browser limited to the local Vite application. Leave Vite running so Activity 5 can use hot reload.

Start the UI in a separate terminal:

```bash
npm --prefix src/ui ci
npm --prefix src/ui run dev
```

### Before

> Open `http://127.0.0.1:5173` with a browser tool and describe the visible game screen.

The request should fail because OpenCode has no browser tool.

### Configure with Codex

> Update the root `opencode.json` and preserve the filesystem and GitHub MCPs. Add an enabled local MCP server named `playwright` running `npx -y @playwright/mcp@0.0.79`. Use headless and isolated Chromium at `/usr/bin/chromium`, block service workers, and allow only `http://127.0.0.1:5173;http://localhost:5173`. Show me the diff when done.

Restart OpenCode, but leave Vite running.

### After

> Use Playwright to open `http://127.0.0.1:5173`, inspect the accessibility snapshot, and describe the visible game screen.

### Boundary

> Use Playwright to navigate to `https://example.com` and summarize the page.

The local inspection should succeed. The external request should be blocked by the configured origin allowlist. The allowlist is a teaching guardrail, not an operating-system security boundary.

## Activity 4: send a Slack update

You will connect an instructor-prepared Slack app with only `chat:write`, allowing OpenCode to post progress without reading workspace conversations.

Export the client ID and secret supplied by the instructor in the terminal that will start OpenCode:

```bash
export SLACK_MCP_CLIENT_ID="<CLIENT_ID>"
export SLACK_MCP_CLIENT_SECRET="<CLIENT_SECRET>"
```

### Before

> Post `OpenCode MCP lab connection test` to `<TRAINING_CHANNEL>` in Slack.

The request should fail because no Slack MCP is connected.

### Configure with Codex

> Update the root `opencode.json` and preserve all existing MCPs. Add an enabled remote MCP server named `slack` at `https://mcp.slack.com/mcp`. Configure OAuth with `SLACK_MCP_CLIENT_ID` and `SLACK_MCP_CLIENT_SECRET` from the environment, scope `chat:write`, and callback port `19876`. Show me the diff when done.

Authenticate, check the connection, and restart OpenCode from the terminal containing the Slack variables:

```bash
opencode mcp auth slack
opencode mcp list
```

### After

> Post `OpenCode MCP lab: Slack connected` to `<TRAINING_CHANNEL>`.

### Boundary

> Read the latest messages from `<TRAINING_CHANNEL>`.

Posting should succeed. Reading messages should be unavailable because the app has only `chat:write` and managed policy permits only `slack_send_message`.

## Activity 5: deliver a feature across all four MCPs

You will now combine GitHub context, scoped file changes, browser verification, and a Slack notification. Vite should still be running from Activity 3 so saved UI changes appear through hot reload.

### Before

Confirm that all four servers report connected:

```bash
opencode mcp list
```

Then capture the starting point in OpenCode:

> Use Playwright to inspect `http://127.0.0.1:5173` and summarize the current UI. Do not change any files.

### Run the workflow in OpenCode

Replace `<ISSUE_NUMBER>` and `<TRAINING_CHANNEL>`, then paste this single prompt into OpenCode:

> Complete issue `<ISSUE_NUMBER>` from `Axian-Inc/ffthh-game-of-life` using the MCP tools available to you.
>
> 1. Read the issue with the GitHub MCP and restate its requirements and acceptance criteria.
> 2. Inspect the current UI and implement the requested feature using only the filesystem MCP. Keep every change under `src/ui` and do not change dependencies.
> 3. The Vite server is already running at `http://127.0.0.1:5173`. Use Playwright to verify every acceptance criterion in the rendered UI. If verification fails, fix the UI and test again.
> 4. Only after every criterion passes, use Slack to post to `<TRAINING_CHANNEL>`: `Completed issue #<ISSUE_NUMBER>: <one-sentence feature summary>. Verified locally at http://127.0.0.1:5173.`
>
> Stop without posting a success message if you cannot read the issue, implement it entirely under `src/ui`, or verify every acceptance criterion. Finish with a concise list of changed files and Playwright checks performed.

### After

In OpenCode, run one final independent check:

> Use Playwright to inspect `http://127.0.0.1:5173` and verify the acceptance criteria from issue `<ISSUE_NUMBER>`. Report pass or fail for each criterion without changing files or posting to Slack.

In the terminal, inspect the actual source changes:

```bash
git diff -- src/ui
```

Confirm the feature is visible locally and that the completion message appears in the training channel. A success message must not be posted when implementation or verification fails.
