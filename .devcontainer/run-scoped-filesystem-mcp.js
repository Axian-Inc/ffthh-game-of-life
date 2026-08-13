#!/usr/bin/env node

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
    delete message.params.capabilities.roots;
  }

  if (message.method === "notifications/roots/list_changed") {
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
