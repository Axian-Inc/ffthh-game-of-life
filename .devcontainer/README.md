# Dev-container AI harness

The dev container installs Codex and a pinned OpenCode release. OpenCode starts as
a chat-only teaching harness: its managed configuration denies built-in tools and
allows students to add only the reviewed MCP namespaces during the lab in
[`docs/opencode-mcp-lab.md`](../docs/opencode-mcp-lab.md).

## Scoped filesystem boundary

The optional filesystem MCP is intentionally limited to the directories passed to
the server on its command line. The lab currently passes `src` and `docs`, allowing
students to work on application code and documentation without exposing repository
root files, Terraform configuration, credentials, or Git metadata.

Some MCP clients advertise their project directory through the MCP Roots capability.
The filesystem server can treat those client-advertised roots as authoritative and
replace its command-line allowlist. If OpenCode advertises the repository root, that
behavior widens access from `src` and `docs` to the entire repository.

[`run-scoped-filesystem-mcp.js`](run-scoped-filesystem-mcp.js) sits between OpenCode
and the filesystem server to prevent that widening. It removes the Roots capability
from the client's `initialize` request and drops later `roots/list_changed`
notifications. The filesystem server therefore continues using the roots supplied
in its command arguments.

The wrapper does not select allowed directories or enforce a separate filesystem
sandbox. Its caller must pass the exact allowed roots to the child server. The
filesystem server remains responsible for enforcing those roots.

The boundary has three related controls:

- `run-scoped-filesystem-mcp.js` prevents dynamic MCP Roots from replacing the
  command-line allowlist.
- `install-ai-clis.sh` pins the OpenCode version until newer client and server
  behavior has been reviewed.
- `opencode-managed/opencode.json` denies native filesystem tools so the scoped MCP
  remains the file-access path used by the lab.

## Verification and upgrades

Run the adversarial protocol check after changing the wrapper, OpenCode version,
filesystem server version, or MCP configuration:

```bash
node .devcontainer/check-scoped-filesystem-mcp.js
```

The check advertises client Roots, confirms that only `src` and `docs` are allowed,
and verifies that `terraform/main.tf` is rejected. The lab also contains manual
before, after, and boundary checks for the complete student workflow.

Before upgrading OpenCode or removing the wrapper:

1. Test the proposed OpenCode and filesystem server versions together.
2. Confirm the server still lists only the command-line roots after the client
   advertises the repository root.
3. Confirm files under `src` and `docs` are accessible.
4. Confirm repository root files and `terraform/main.tf` are rejected.
5. Update the version pin, regression check, and lab instructions together.

Remove the wrapper only when the client can disable MCP Roots for this server or the
filesystem server reliably keeps its static command-line roots authoritative.
