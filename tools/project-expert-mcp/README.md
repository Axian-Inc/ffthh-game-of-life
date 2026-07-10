# Project Expert MCP Server

This is a local, read-only MCP server for the Modern Game of Life repository. It gives an MCP-capable local agent a project-expert surface for architecture, design decisions, functional-area ownership, coding patterns, and native file search.

The server is intentionally dependency-free. It uses Node.js built-ins and `rg` for source search.

## Run

From the repository root:

```bash
npm --prefix tools/project-expert-mcp test
npm --prefix tools/project-expert-mcp start
```

Most MCP clients start stdio servers themselves. Configure the client with:

```json
{
  "mcpServers": {
    "ffthh-project-expert": {
      "command": "node",
      "args": [
        "/workspaces/ffthh-game-of-life/tools/project-expert-mcp/bin/project-expert-mcp.js"
      ]
    }
  }
}
```

The dev container registers this server automatically for both Codex and
OpenCode during `postCreateCommand`. Each client starts the stdio process when
it opens a session; no separate background service is required.

If your agent accepts a package-style command, this also works from the repo root:

```bash
node tools/project-expert-mcp/bin/project-expert-mcp.js
```

## Tools

- `project_overview`: Returns system shape, current implementation status, next PRD slice, player-turn design contract, and the functional-area map.
- `answer_project_question`: Gathers matching functional areas, curated patterns, and `rg` evidence for a specific project question.
- `search_project`: Runs native `rg` search with optional globs and context lines. It excludes `.git`, `node_modules`, `dist`, `build`, `.terraform`, and local `worktrees` by default.
- `functional_areas`: Lists repo paths grouped by functional area.
- `locate_functional_area`: Maps a project-relative file path to its owning functional area, or searches areas by topic.
- `coding_patterns`: Returns curated architecture, design, persistence, testing, simulation, and infrastructure patterns.
- `read_project_doc`: Reads canonical project docs by id: `prd`, `architecture`, `style-guide`, `notes`, `changelog`, `scripts`, or `agents`.

## Resources

- `project://overview`
- `project://functional-areas`
- `project://coding-patterns`
- `project://docs/prd`
- `project://docs/architecture`
- `project://docs/style-guide`
- `project://docs/notes`
- `project://docs/changelog`
- `project://docs/scripts`
- `project://docs/agents`

## Updating the Expert

Keep the expert current by editing `src/projectKnowledge.js` when the repo shape changes:

- Add or revise `FUNCTIONAL_AREAS` when new folders or ownership boundaries appear.
- Add or revise `CODING_PATTERNS` when an architectural or design decision becomes a stable convention.
- Add project documents to `PROJECT_DOCS` when they become canonical references.

Prefer putting long-lived decisions in `docs/ARCHITECTURE.md`, PRD section 11, or `NOTES.md`, then linking those files from the MCP taxonomy. That keeps the MCP server grounded in the same docs future contributors already read.

## Design Notes

The server does not write files, deploy infrastructure, or call external services. It is a context server, not an autonomous project agent. The local agent should use this server to gather source-backed context, then make code changes through its normal tools.
