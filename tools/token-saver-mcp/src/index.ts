#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createTokenSaverServer } from "./server.js";
import { defaultRepoRoot } from "./paths.js";

async function main(): Promise<void> {
  const repoRoot = process.env.TOKEN_SAVER_REPO_ROOT ?? defaultRepoRoot();
  const server = createTokenSaverServer(repoRoot);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
