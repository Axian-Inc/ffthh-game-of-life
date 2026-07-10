import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { afterEach, describe, expect, test } from "vitest";

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

describe("MCP stdio server", () => {
  test("lists tools, calls a tool, and reads a resource", async () => {
    client = new Client({ name: "token-saver-test-client", version: "0.1.0" });
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

    const tools = await client.listTools();
    expect(tools.tools.map((tool) => tool.name)).toEqual(
      expect.arrayContaining(["repo_context_summary", "docs_digest", "code_area_map", "task_brief", "compact_files"])
    );

    const result = await client.callTool({
      name: "repo_context_summary",
      arguments: {
        topic: "deploy",
        maxTokens: 800
      }
    });
    expect(result.content[0]).toMatchObject({ type: "text" });
    expect(result.content[0]?.type === "text" ? result.content[0].text : "").toContain("Terraform");

    const resource = await client.readResource({ uri: "repo://architecture" });
    expect(resource.contents[0]).toMatchObject({ uri: "repo://architecture", mimeType: "text/markdown" });
    expect("text" in resource.contents[0] ? resource.contents[0].text : "").toContain("Architecture");
  });
});
