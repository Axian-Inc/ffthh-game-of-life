# OpenCode MCP Lab

OpenCode begins as a chat-only agent. In this lab, students ask **Codex** to improve
the checked-in OpenCode harness, then restart **OpenCode** and test each capability.
The activities are cumulative: every Codex prompt must preserve earlier settings.

## Before you start

Rebuild the dev container, open the repository root, connect OpenCode to OpenAI with
`/connect`, and verify the locked-down baseline:

```bash
opencode --version
bash .devcontainer/check-opencode-lockdown.sh
opencode mcp list
```

OpenCode must be version `1.17.5`, and no MCP servers should be configured. Run every
**Before** and **After** prompt in OpenCode. Run every **Codex prompt** in Codex, inspect
`git diff -- opencode.json`, and restart OpenCode after each configuration change.

Never paste IDs, secrets, tokens, or PEM contents into either agent or
`opencode.json`.

## Activity 1: read and write selected repository folders

**Why:** A filesystem MCP lets OpenCode work on application code and documentation
without exposing the repository root, Terraform, credentials, or Git metadata.

### Before

> Read `src/ui/src/App.jsx` with a tool and summarize it. Do not guess.

This should fail because OpenCode has no file tool.

### Codex prompt

> Update the root `opencode.json` to add an enabled local MCP server named `filesystem`. Run `npx -y @modelcontextprotocol/server-filesystem@2026.7.10` through `/workspaces/ffthh-game-of-life/.devcontainer/run-scoped-filesystem-mcp.js`. Allow only `/workspaces/ffthh-game-of-life/src` and `/workspaces/ffthh-game-of-life/docs`. Preserve every existing setting and show me the diff.

The checked-in wrapper prevents client-advertised MCP Roots from widening this
allowlist. Restart OpenCode and confirm `filesystem` is connected:

```bash
opencode mcp list
```

### After

> Use the filesystem MCP to read `src/ui/src/App.jsx`. Then create `src/mcp-lab-check.txt`, read it back, and delete it.

Reading and the temporary write should succeed. Confirm the boundary:

> Use the filesystem MCP to read `terraform/main.tf`.

The Terraform read must fail because it is outside `src` and `docs`.

## Activity 2: enable questions and task tracking

**Why:** `question` lets an agent resolve real ambiguity instead of guessing.
`todowrite` makes multi-step work and progress visible. These are native OpenCode
tools, not MCP servers.

### Before

> Use question to ask whether I want a concise or detailed plan, then use todowrite to create a two-step checklist. Do not imitate either tool in plain text.

This should fail because both tools are disabled.

### Codex prompt

> Update the root `opencode.json` and preserve every existing setting. For both the `build` and `plan` agents, add an ordered permission object with `"*": "deny"` first, then `"question": "allow"` and `"todowrite": "allow"`. Do not enable any other native tools. Show me the diff.

Order matters in OpenCode 1.17.5. Restart OpenCode and verify both agents report
`question: true` and `todowrite: true`, while native read, shell, and edit tools remain
`false`:

```bash
opencode debug agent build
opencode debug agent plan
```

### After

> Use question to ask whether I want a concise or detailed plan. Wait for my answer, then use todowrite to create a two-step checklist for preparing and reviewing it.

OpenCode should ask interactively and then display the checklist.

## Activity 3: read GitHub issues

**Why:** A read-only GitHub App gives the agent real issue and pull-request context
without permitting repository changes.

Install the pinned, checksum-verified official GitHub MCP server:

```bash
bash .devcontainer/install-github-mcp-server.sh
github-mcp-server --version
```

This downloads approximately 8 MB and does not require GitHub credentials. The
instructor then securely provides an App ID, Installation ID, and
`ffthh-open-code-read-only.pem`. In the terminal that will start OpenCode, run:

```bash
chmod 600 ffthh-open-code-read-only.pem
export GITHUB_APP_ID="<APP_ID>"
export GITHUB_APP_INSTALLATION_ID="<INSTALLATION_ID>"
```

### Before

> Use a GitHub tool to read issue `<ISSUE_NUMBER>` from `Axian-Inc/ffthh-game-of-life`. Do not use the public web.

This should fail because no GitHub MCP is connected.

### Codex prompt

> Update the root `opencode.json` and preserve every existing setting. Add an enabled local MCP server named `github` using `/usr/local/bin/github-mcp-server` with `stdio`, `--read-only`, and `--toolsets repos,issues,pull_requests`. Pass `GITHUB_APP_ID` and `GITHUB_APP_INSTALLATION_ID` from the environment, and set `GITHUB_APP_PRIVATE_KEY_PATH` to `/workspaces/ffthh-game-of-life/ffthh-open-code-read-only.pem`. Do not read or print the PEM. Show me the diff.

Restart OpenCode from the terminal containing the exported IDs.

### After

> Use the GitHub MCP to read issue `<ISSUE_NUMBER>` from `Axian-Inc/ffthh-game-of-life` and summarize its acceptance criteria.

The read should succeed. Creating or editing an issue must remain unavailable.

## Activity 4: inspect the rendered UI

**Why:** Playwright lets the model see and test the application it is building instead
of reasoning only from source code.

Start the UI in a separate terminal and leave it running through Activity 6:

```bash
npm --prefix src/ui ci
npm --prefix src/ui run dev
```

### Before

> Open `http://127.0.0.1:5173` with a browser tool and describe the page.

This should fail because no browser tool is connected.

### Codex prompt

> Update the root `opencode.json` and preserve every existing setting. Add an enabled local MCP server named `playwright` running `npx -y @playwright/mcp@0.0.79`. Use headless, isolated Chromium at `/usr/bin/chromium`, block service workers, and allow only `http://127.0.0.1:5173;http://localhost:5173`. Show me the diff.

Restart OpenCode, but leave Vite running.

### After

> Use Playwright to open `http://127.0.0.1:5173`, inspect the page, and describe the visible game screen.

The local page should be visible. Navigation to `https://example.com` should be
blocked by the origin allowlist.

## Activity 5: notify a Slack channel

**Why:** The official remote Slack MCP lets the agent report completion to one training
channel without reading workspace conversations.

Export the instructor-provided OAuth values in the terminal that will start OpenCode:

```bash
export SLACK_MCP_CLIENT_ID="<CLIENT_ID>"
export SLACK_MCP_CLIENT_SECRET="<CLIENT_SECRET>"
```

### Before

> Post `OpenCode MCP lab connection test` to `<TRAINING_CHANNEL>` in Slack.

This should fail because Slack is not connected.

### Codex prompt

> Update the root `opencode.json` and preserve every existing setting. Add an enabled remote MCP server named `slack` at `https://mcp.slack.com/mcp`. Configure OAuth from `SLACK_MCP_CLIENT_ID` and `SLACK_MCP_CLIENT_SECRET`, request only `chat:write`, and use callback port `19876`. Show me the diff.

Authenticate and restart OpenCode from the same terminal:

```bash
opencode mcp auth slack
opencode mcp list
```

### After

> Post `OpenCode MCP lab: Slack connected` to `<TRAINING_CHANNEL>`.

Posting should succeed. Reading channel history must remain unavailable.

## Activity 6: deliver one issue end to end

**Why:** This combines bounded context, planning, implementation, visual verification,
and communication into one agent workflow.

### Before

Confirm that all four MCP servers are connected and Vite is still running:

```bash
opencode mcp list
```

### Run in OpenCode

> Complete issue `<ISSUE_NUMBER>` from `Axian-Inc/ffthh-game-of-life`.
>
> 1. Read the issue with GitHub and restate its requirements and acceptance criteria.
> 2. Use question for any requirement that materially affects the implementation and is not answered by the issue or repository.
> 3. Use todowrite to track planning, implementation, and verification.
> 4. Implement the issue using only the filesystem MCP. Keep all changes under `src/ui` and do not change dependencies.
> 5. Use Playwright at `http://127.0.0.1:5173` to verify every acceptance criterion. Fix failures and test again.
> 6. Only after all criteria pass, post to `<TRAINING_CHANNEL>`: `Completed issue #<ISSUE_NUMBER>: <summary>. Verified locally at http://127.0.0.1:5173.`
>
> Do not post success if issue retrieval, implementation, or verification fails. Finish with changed files and verification results.

### After

> Use Playwright to independently verify each acceptance criterion from issue `<ISSUE_NUMBER>`. Report pass or fail without changing files or posting to Slack.

Inspect the source diff and confirm the Slack message was posted only after success:

```bash
git diff -- src/ui
```

## Clean up credentials

After Activity 6, stop OpenCode, remove the instructor PEM, and clear credential
variables from the shell:

```bash
rm -f ffthh-open-code-read-only.pem
unset GITHUB_APP_ID GITHUB_APP_INSTALLATION_ID
unset SLACK_MCP_CLIENT_ID SLACK_MCP_CLIENT_SECRET
```
