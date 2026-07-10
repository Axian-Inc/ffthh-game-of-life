import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { afterEach, describe, expect, test } from "vitest";
import { loadConfig } from "../src/config.js";
import { RepoIndex } from "../src/repoIndex.js";
import { estimateTokens } from "../src/tokenBudget.js";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(packageRoot, "../..");

let client: Client | undefined;
let transport: StdioClientTransport | undefined;

afterEach(async () => {
  await client?.close();
  await transport?.close();
  client = undefined;
  transport = undefined;
});

describe("MCP token savings", () => {
  test("uses fewer tokens for a task brief than direct context reads", async () => {
    const task = "implement simulation no-action monthly turn resolution";
    const mcpText = await callTaskBrief(task);
    const directText = buildDirectBaseline();

    const mcpTokens = estimateTokens(mcpText);
    const directTokens = estimateTokens(directText);

    console.info(tokenReport(mcpTokens, directTokens));

    expect(mcpText).toContain("# Task Brief");
    expect(mcpText).toContain("docs/modern-game-of-life-prd.md");
    expect(mcpText).toContain("src/ui/src/simulation");
    expect(directTokens, tokenMessage(mcpTokens, directTokens)).toBeGreaterThan(mcpTokens);
    expect(mcpTokens, tokenMessage(mcpTokens, directTokens)).toBeLessThan(directTokens * 0.5);
  });
});

async function callTaskBrief(task: string): Promise<string> {
  client = new Client({ name: "token-saver-comparison-test-client", version: "0.1.0" });
  transport = new StdioClientTransport({
    command: process.execPath,
    args: ["./node_modules/tsx/dist/cli.mjs", "src/index.ts"],
    cwd: packageRoot,
    env: {
      TOKEN_SAVER_REPO_ROOT: repoRoot
    },
    stderr: "pipe"
  });

  await client.connect(transport);

  const result = await client.callTool({
    name: "task_brief",
    arguments: {
      task,
      maxTokens: 1600
    }
  });

  return result.content
    .map((item) => (item.type === "text" ? item.text : ""))
    .filter(Boolean)
    .join("\n");
}

function buildDirectBaseline(): string {
  const config = loadConfig(repoRoot);
  const repoIndex = new RepoIndex(repoRoot, config);
  const likelySourceFiles = [
    "docs/modern-game-of-life-prd.md",
    "docs/ARCHITECTURE.md",
    ...repoIndex.resolveTargets(["src/ui/src/simulation"])
  ];

  return likelySourceFiles
    .filter((filePath) => fs.existsSync(path.join(repoRoot, filePath)))
    .map((filePath) => `--- ${filePath} ---\n${repoIndex.readText(filePath)}`)
    .join("\n\n");
}

function tokenMessage(mcpTokens: number, directTokens: number): string {
  return `MCP tokens: ${mcpTokens}; direct baseline tokens: ${directTokens}`;
}

function tokenReport(mcpTokens: number, directTokens: number): string {
  const ratio = mcpTokens / directTokens;
  const savings = 100 - ratio * 100;

  return [
    "MCP token comparison:",
    `MCP task_brief tokens=${mcpTokens}`,
    `direct baseline tokens=${directTokens}`,
    `ratio=${ratio.toFixed(3)}`,
    `estimated savings=${savings.toFixed(1)}%`
  ].join(" ");
}
