import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadConfig } from "./config.js";
import { DigestService } from "./digests.js";
import { RepoIndex } from "./repoIndex.js";

const optionalBudgetSchema = {
  maxTokens: z.number().int().min(200).max(8000).optional().describe("Approximate maximum tokens to return. Defaults to the server config.")
};

export function createTokenSaverServer(repoRoot: string): McpServer {
  const config = loadConfig(repoRoot);
  const repoIndex = new RepoIndex(repoRoot, config);
  const digests = new DigestService(repoIndex, config);

  const server = new McpServer({
    name: "token-saver-mcp",
    version: "0.1.0"
  });

  server.registerTool(
    "repo_context_summary",
    {
      title: "Repository Context Summary",
      description: "Return a compact source-linked overview of this repository, current implementation state, key files, and verification commands.",
      inputSchema: {
        topic: z.string().optional().describe("Optional topic such as ui, simulation, api, terraform, deploy, tests, docs, or prd."),
        ...optionalBudgetSchema
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false
      }
    },
    ({ topic, maxTokens }) => textResult(digests.repoContextSummary(topic, { maxTokens }))
  );

  server.registerTool(
    "docs_digest",
    {
      title: "Documentation Digest",
      description: "Summarize selected repository docs with path and line citations. Use before loading full markdown files.",
      inputSchema: {
        docs: z.array(z.string()).optional().describe("Optional doc paths or directories. Defaults to core repository docs."),
        ...optionalBudgetSchema
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false
      }
    },
    ({ docs, maxTokens }) => textResult(digests.docsDigest(docs, { maxTokens }))
  );

  server.registerTool(
    "code_area_map",
    {
      title: "Code Area Map",
      description: "Map an area of the codebase to relevant files, key extracts, and a low-token inspection order.",
      inputSchema: {
        area: z.string().describe("Area to map, for example ui, simulation, api, terraform, deploy, tests, or docs."),
        ...optionalBudgetSchema
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false
      }
    },
    ({ area, maxTokens }) => textResult(digests.codeAreaMap(area, { maxTokens }))
  );

  server.registerTool(
    "task_brief",
    {
      title: "Task Brief",
      description: "Create a compact implementation brief for a task, including first files to inspect, relevant extracts, constraints, and expected verification.",
      inputSchema: {
        task: z.string().describe("The user's task or intended change."),
        ...optionalBudgetSchema
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false
      }
    },
    ({ task, maxTokens }) => textResult(digests.taskBrief(task, { maxTokens }))
  );

  server.registerTool(
    "compact_files",
    {
      title: "Compact Files",
      description: "Return extractive summaries for specific files or directories without dumping full contents.",
      inputSchema: {
        paths: z.array(z.string()).min(1).describe("Repo-relative files or directories to summarize."),
        purpose: z.string().optional().describe("Optional reason for reading these files, used only as context in the response."),
        ...optionalBudgetSchema
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false
      }
    },
    ({ paths, purpose, maxTokens }) => textResult(digests.compactFiles(paths, purpose, { maxTokens }))
  );

  registerTextResource(server, "repo-overview", "repo://overview", "Overall repository summary.", () => digests.resourceDigest("overview"));
  registerTextResource(server, "repo-prd-status", "repo://prd-status", "Current PRD implementation status and next slice.", () =>
    digests.resourceDigest("prd-status")
  );
  registerTextResource(server, "repo-architecture", "repo://architecture", "Architecture digest.", () => digests.resourceDigest("architecture"));
  registerTextResource(server, "repo-style-guide", "repo://style-guide", "UI style guide digest.", () => digests.resourceDigest("style-guide"));
  registerTextResource(server, "repo-ops-and-deploy", "repo://ops-and-deploy", "Operational and deployment guidance.", () =>
    digests.resourceDigest("ops-and-deploy")
  );

  return server;
}

function textResult(text: string) {
  return {
    content: [
      {
        type: "text" as const,
        text
      }
    ]
  };
}

function registerTextResource(server: McpServer, name: string, uri: string, description: string, read: () => string): void {
  server.registerResource(
    name,
    uri,
    {
      title: name,
      description,
      mimeType: "text/markdown"
    },
    () => ({
      contents: [
        {
          uri,
          mimeType: "text/markdown",
          text: read()
        }
      ]
    })
  );
}
