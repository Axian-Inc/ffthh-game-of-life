import {
  answerProjectQuestion,
  getCodingPatterns,
  getProjectOverview,
  listDocs,
  listFunctionalAreas,
  locateFunctionalArea,
  readProjectDoc,
  resourceList,
  resourceRead,
  searchProject,
} from "./projectKnowledge.js";

const SERVER_INFO = {
  name: "ffthh-project-expert",
  version: "0.1.0",
};

export const TOOL_DEFINITIONS = [
  {
    name: "project_overview",
    description:
      "Return the current Modern Game of Life architecture, implementation status, next product slice, player-turn design contract, and functional-area map.",
    inputSchema: {
      type: "object",
      properties: {
        maxChars: {
          type: "integer",
          minimum: 1000,
          maximum: 100000,
          description: "Maximum response characters.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "answer_project_question",
    description:
      "Gather source-grounded context for a specific project question, including matching functional areas, patterns, and rg evidence.",
    inputSchema: {
      type: "object",
      properties: {
        question: {
          type: "string",
          description: "Project question to answer from repository docs and source files.",
        },
        maxResults: {
          type: "integer",
          minimum: 1,
          maximum: 250,
          description: "Maximum rg result lines to return.",
        },
      },
      required: ["question"],
      additionalProperties: false,
    },
  },
  {
    name: "search_project",
    description:
      "Search the repository with ripgrep. Defaults exclude .git, node_modules, dist, build, .terraform, and local worktrees.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Literal or regular-expression query passed to rg.",
        },
        globs: {
          type: "array",
          items: { type: "string" },
          description: "Optional rg glob filters, for example src/ui/src/**/*.jsx.",
        },
        contextLines: {
          type: "integer",
          minimum: 0,
          maximum: 10,
          description: "Number of surrounding lines per match.",
        },
        maxResults: {
          type: "integer",
          minimum: 1,
          maximum: 250,
          description: "Maximum result lines to return.",
        },
        caseSensitive: {
          type: "boolean",
          description: "Use case-sensitive search when true.",
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "functional_areas",
    description:
      "List known functional areas and the files/directories that own each area. Optionally filter by topic.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Optional topic filter such as storage, wizard, simulation, terraform, or testing.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "locate_functional_area",
    description:
      "Given a project-relative path, return its functional area. Given a query, return matching functional areas.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Project-relative file or directory path.",
        },
        query: {
          type: "string",
          description: "Functional-area topic query.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "coding_patterns",
    description:
      "Return curated architecture, design, testing, persistence, simulation, and infrastructure patterns with source files.",
    inputSchema: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description: "Optional topic filter.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "read_project_doc",
    description: "Read one canonical project document by id.",
    inputSchema: {
      type: "object",
      properties: {
        docId: {
          type: "string",
          enum: listDocs().map((doc) => doc.id),
          description: "Document id.",
        },
        maxChars: {
          type: "integer",
          minimum: 1000,
          maximum: 100000,
          description: "Maximum response characters.",
        },
      },
      required: ["docId"],
      additionalProperties: false,
    },
  },
];

export async function callTool(name, args = {}) {
  switch (name) {
    case "project_overview":
      return getProjectOverview(args);
    case "answer_project_question":
      return answerProjectQuestion(args);
    case "search_project":
      return searchProject(args);
    case "functional_areas":
      return listFunctionalAreas(args);
    case "locate_functional_area":
      return locateFunctionalArea(args);
    case "coding_patterns":
      return getCodingPatterns(args);
    case "read_project_doc":
      return readProjectDoc(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

let inputBuffer = "";

process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  inputBuffer += chunk;

  let newlineIndex = inputBuffer.indexOf("\n");
  while (newlineIndex !== -1) {
    const line = inputBuffer.slice(0, newlineIndex).trim();
    inputBuffer = inputBuffer.slice(newlineIndex + 1);

    if (line) {
      handleMessageLine(line);
    }

    newlineIndex = inputBuffer.indexOf("\n");
  }
});

process.stdin.on("end", () => {
  const line = inputBuffer.trim();
  if (line) {
    handleMessageLine(line);
  }
});

async function handleMessageLine(line) {
  let message;
  try {
    message = JSON.parse(line);
  } catch (error) {
    sendError(null, -32700, `Parse error: ${error.message}`);
    return;
  }

  if (!message || typeof message !== "object") {
    sendError(null, -32600, "Invalid request.");
    return;
  }

  if (!("id" in message)) {
    await handleNotification(message);
    return;
  }

  try {
    const result = await handleRequest(message);
    sendResult(message.id, result);
  } catch (error) {
    sendError(message.id, -32000, error.message);
  }
}

async function handleNotification(_message) {
  // MCP initialized/cancelled notifications do not require a response.
}

async function handleRequest(message) {
  switch (message.method) {
    case "initialize":
      return {
        protocolVersion: message.params?.protocolVersion || "2024-11-05",
        capabilities: {
          tools: {},
          resources: {},
        },
        serverInfo: SERVER_INFO,
      };
    case "ping":
      return {};
    case "tools/list":
      return { tools: TOOL_DEFINITIONS };
    case "tools/call": {
      const toolName = message.params?.name;
      const toolArgs = message.params?.arguments || {};
      const text = await callTool(toolName, toolArgs);
      return {
        content: [
          {
            type: "text",
            text,
          },
        ],
      };
    }
    case "resources/list": {
      return { resources: await resourceList() };
    }
    case "resources/read": {
      const uri = message.params?.uri;
      const text = await resourceRead(uri);
      return {
        contents: [
          {
            uri,
            mimeType: "text/markdown",
            text,
          },
        ],
      };
    }
    default:
      throw new Error(`Unsupported method: ${message.method}`);
  }
}

function sendResult(id, result) {
  writeJson({
    jsonrpc: "2.0",
    id,
    result,
  });
}

function sendError(id, code, message) {
  writeJson({
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message,
    },
  });
}

function writeJson(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}
