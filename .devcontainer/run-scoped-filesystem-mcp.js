#!/usr/bin/env node

/**
 * Preserve the command-line allowlist for the optional filesystem MCP.
 *
 * Client-advertised MCP Roots can replace that allowlist and expose the repository
 * root. This protocol guard prevents both initial and later Roots negotiation; the
 * child filesystem server still enforces the directories passed in serverArgs.
 * See .devcontainer/README.md and check-scoped-filesystem-mcp.js.
 */

const { spawn } = require("child_process");
const readline = require("readline");

const serverArgs = process.argv.slice(2);
if (serverArgs.length === 0) {
  console.error("Usage: run-scoped-filesystem-mcp.js <server-command> [args...]");
  process.exit(2);
}

const child = spawn(serverArgs[0], serverArgs.slice(1), {
  stdio: ["pipe", "pipe", "inherit"],
});

child.on("error", (error) => {
  console.error(`Unable to start scoped filesystem MCP server: ${error.message}`);
  process.exit(1);
});

const clientLines = readline.createInterface({ input: process.stdin });
clientLines.on("line", (line) => {
  let message;
  try {
    message = JSON.parse(line);
  } catch {
    child.stdin.write(`${line}\n`);
    return;
  }

  if (message.method === "initialize" && message.params?.capabilities?.roots) {
    // Prevent the initial client Roots capability from replacing static roots.
    delete message.params.capabilities.roots;
  }

  if (message.method === "notifications/roots/list_changed") {
    // Prevent later client root changes from widening the static allowlist.
    return;
  }

  child.stdin.write(`${JSON.stringify(message)}\n`);
});

process.stdin.on("end", () => child.stdin.end());
child.stdout.pipe(process.stdout);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exitCode = code ?? 1;
  }
});
