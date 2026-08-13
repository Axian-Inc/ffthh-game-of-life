#!/usr/bin/env node

const assert = require("assert");
const path = require("path");
const { spawn } = require("child_process");
const readline = require("readline");

const repoRoot = path.resolve(__dirname, "..");
const guard = path.join(__dirname, "run-scoped-filesystem-mcp.js");
const child = spawn(process.execPath, [
  guard,
  "npx",
  "-y",
  "@modelcontextprotocol/server-filesystem@2026.7.10",
  path.join(repoRoot, "src"),
  path.join(repoRoot, "docs"),
], { stdio: ["pipe", "pipe", "inherit"] });

let nextId = 1;
const pending = new Map();
const lines = readline.createInterface({ input: child.stdout });

lines.on("line", (line) => {
  const message = JSON.parse(line);
  if (message.id !== undefined && pending.has(message.id)) {
    pending.get(message.id)(message);
    pending.delete(message.id);
  }
});

function request(method, params) {
  const id = nextId++;
  child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`Timed out waiting for ${method}`));
    }, 15000);
    pending.set(id, (message) => {
      clearTimeout(timeout);
      resolve(message);
    });
  });
}

(async () => {
  const initialized = await request("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: { roots: { listChanged: true } },
    clientInfo: { name: "scope-boundary-test", version: "1.0.0" },
  });
  assert.ifError(initialized.error);
  child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })}\n`);

  const allowed = await request("tools/call", {
    name: "list_allowed_directories",
    arguments: {},
  });
  const allowedText = allowed.result.content.map((item) => item.text ?? "").join("\n");
  assert.match(allowedText, new RegExp(`${path.join(repoRoot, "src")}\\n${path.join(repoRoot, "docs")}`));
  assert.doesNotMatch(allowedText, new RegExp(`${repoRoot}$`, "m"));

  const denied = await request("tools/call", {
    name: "read_text_file",
    arguments: { path: path.join(repoRoot, "terraform", "main.tf") },
  });
  assert.strictEqual(denied.result.isError, true);
  assert.match(denied.result.content[0].text, /outside allowed directories/i);

  console.log("OK: MCP Roots cannot replace the scoped filesystem allowlist.");
  child.stdin.end();
})().catch((error) => {
  console.error(error.stack || error.message);
  child.kill();
  process.exitCode = 1;
});
