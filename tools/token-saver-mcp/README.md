# Token Saver MCP

Local read-only MCP server that returns compact, source-linked context for this repository. It is intended for Codex sessions where the agent needs fast orientation without loading full docs or broad file trees into context.

## Install

```sh
npm --prefix tools/token-saver-mcp install
npm --prefix tools/token-saver-mcp run build
```

## Run

```sh
TOKEN_SAVER_REPO_ROOT=/home/tgriffin/project npm --prefix tools/token-saver-mcp start
```

## Codex MCP Configuration

Use stdio and point `TOKEN_SAVER_REPO_ROOT` at this repository:

```json
{
  "mcpServers": {
    "token-saver": {
      "command": "node",
      "args": ["/home/tgriffin/project/tools/token-saver-mcp/dist/index.js"],
      "env": {
        "TOKEN_SAVER_REPO_ROOT": "/home/tgriffin/project"
      }
    }
  }
}
```

## Tools

- `repo_context_summary`: compact repo orientation, current state, starting points, and verification commands.
- `docs_digest`: source-linked digest for selected docs.
- `code_area_map`: area-to-file map for `ui`, `simulation`, `api`, `terraform`, `deploy`, `tests`, or `docs`.
- `task_brief`: focused implementation brief for a user task.
- `compact_files`: extractive digest for specific repo-relative files or directories.

## Resources

- `repo://overview`
- `repo://prd-status`
- `repo://architecture`
- `repo://style-guide`
- `repo://ops-and-deploy`

## Verification

```sh
npm --prefix tools/token-saver-mcp run test
npm --prefix tools/token-saver-mcp run build
```
