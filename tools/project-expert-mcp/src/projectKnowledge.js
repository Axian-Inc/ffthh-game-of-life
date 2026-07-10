import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const REPO_ROOT = path.resolve(__dirname, "../../..");

const DEFAULT_MAX_CHARS = 14000;
const DEFAULT_SEARCH_LINES = 80;
const SEARCH_OUTPUT_LIMIT = 160000;

const STOP_WORDS = new Set([
  "about",
  "after",
  "also",
  "and",
  "are",
  "can",
  "code",
  "does",
  "file",
  "for",
  "from",
  "have",
  "how",
  "into",
  "latest",
  "local",
  "pattern",
  "patterns",
  "project",
  "server",
  "should",
  "that",
  "the",
  "this",
  "what",
  "when",
  "where",
  "which",
  "with",
]);

export const PROJECT_DOCS = [
  {
    id: "prd",
    name: "Product Requirements Document",
    path: "docs/modern-game-of-life-prd.md",
    description: "Product scope, gameplay requirements, current implementation status, and next product slice.",
  },
  {
    id: "architecture",
    name: "Architecture",
    path: "docs/ARCHITECTURE.md",
    description: "System shape, data flow, key files, current game shape, and next architecture target.",
  },
  {
    id: "style-guide",
    name: "Game of Life UI Style Guide",
    path: "docs/game-of-life-style-guide.md",
    description: "Desktop UI visual requirements, modal flow, welcome page, and player-turn screen rules.",
  },
  {
    id: "notes",
    name: "Notes",
    path: "NOTES.md",
    description: "Task-level history that explains what changed, why, where, and follow-ups.",
  },
  {
    id: "changelog",
    name: "Changelog",
    path: "CHANGELOG.md",
    description: "Short user-visible and operational change history.",
  },
  {
    id: "scripts",
    name: "Scripts README",
    path: "scripts/README.md",
    description: "Deployment and script usage prerequisites.",
  },
  {
    id: "agents",
    name: "Agent Instructions",
    path: "AGENTS.md",
    description: "Repository-specific agent rules and fast-context pointers.",
  },
];

export const FUNCTIONAL_AREAS = [
  {
    id: "project-context",
    name: "Project Context and Handoff",
    summary:
      "Canonical product requirements, current implementation status, architecture target, design rules, task notes, and change history.",
    paths: [
      "docs/modern-game-of-life-prd.md",
      "docs/ARCHITECTURE.md",
      "docs/game-of-life-style-guide.md",
      "NOTES.md",
      "CHANGELOG.md",
      "AGENTS.md",
    ],
    patterns: [
      "Start with PRD section 11 before changing simulation or turn-flow behavior.",
      "Use NOTES.md for why a task changed and CHANGELOG.md for user-visible or operational deltas.",
    ],
  },
  {
    id: "ui-app-flow",
    name: "UI App Flow",
    summary:
      "Top-level React state, game creation, resume flow, modal routing, and transition into welcome/play screens.",
    paths: [
      "src/ui/src/App.jsx",
      "src/ui/src/hooks/useModalState.js",
      "src/ui/src/hooks/useGames.js",
      "src/ui/src/components/modals/ModalManager.jsx",
      "src/ui/src/components/pages/WelcomeToLifePage.jsx",
      "src/ui/src/components/pages/PlayGamePage.jsx",
    ],
    patterns: [
      "App-level state owns the current view, selected game, modal state, and persistence calls.",
      "New and resumed games enter the welcome page before the player-turn screen.",
      "ModalManager centralizes modal selection and keeps page components focused on rendering.",
    ],
  },
  {
    id: "new-game-wizard",
    name: "New Game Wizard",
    summary:
      "Six-step setup flow for game name, player identity, city, education track, career, and summary.",
    paths: [
      "src/ui/src/components/forms/NewGameWizard.jsx",
      "src/ui/src/components/forms/NewGameWizardStep1GameName.jsx",
      "src/ui/src/components/forms/NewGameWizardStep1Player.jsx",
      "src/ui/src/components/forms/NewGameWizardStep2City.jsx",
      "src/ui/src/components/forms/NewGameWizardStep3Track.jsx",
      "src/ui/src/components/forms/NewGameWizardStep4Job.jsx",
      "src/ui/src/components/forms/NewGameWizardStep6Summary.jsx",
      "src/ui/src/components/forms/PlayersSection.jsx",
      "src/ui/src/hooks/useCreateGameForm.js",
      "src/ui/src/data/wizardVisualCatalog.js",
      "src/ui/src/utils/gameValidation.js",
    ],
    patterns: [
      "Wizard state stays local until Start Game persists a new active game.",
      "Each step enforces its own required setup selection before enabling Next.",
      "Changing education clears incompatible career selection.",
    ],
  },
  {
    id: "play-turn",
    name: "Player Turn Experience",
    summary:
      "Welcome-to-play transition, active-player turn screen, move-history modal, and current pass/choose-action behavior.",
    paths: [
      "src/ui/src/components/pages/WelcomeToLifePage.jsx",
      "src/ui/src/components/pages/PlayGamePage.jsx",
      "src/ui/src/components/pages/play-game-page.css",
      "src/ui/src/components/modals/PlayerHistoryModal.jsx",
      "src/ui/src/data/playTurnPlaceholder.js",
      "src/ui/src/simulation",
    ],
    patterns: [
      "Turn number and active player are persisted game state.",
      "Choose Action and Pass currently record light move-history entries and advance seat order.",
      "Financial, job, health, location, and modifier values remain placeholders until the simulation foundation lands.",
    ],
  },
  {
    id: "persistence",
    name: "Game Persistence",
    summary:
      "Storage adapter used by the UI for localStorage and optional AWS API persistence.",
    paths: [
      "src/ui/src/services/gameStorage.js",
      "src/ui/src/hooks/useGames.js",
      "src/ui/src/services/__tests__/gameStorage.test.js",
      "src/api/index.js",
    ],
    patterns: [
      "UI code talks to createGameStorage() rather than directly coupling to localStorage or fetch.",
      "Local mode seeds default games and normalizes older saved game shapes.",
      "API mode calls /games and /games/{id} through the same UI-facing adapter contract.",
    ],
  },
  {
    id: "simulation",
    name: "Simulation Engine",
    summary:
      "Early deterministic simulation modules and tests for actions, players, turn presentation, and turn resolution.",
    paths: [
      "src/ui/src/simulation/definitions.js",
      "src/ui/src/simulation/actionCatalog.js",
      "src/ui/src/simulation/playerState.js",
      "src/ui/src/simulation/random.js",
      "src/ui/src/simulation/turnPresentation.js",
      "src/ui/src/simulation/turnResolver.js",
      "src/ui/src/simulation/__tests__",
    ],
    patterns: [
      "Randomness should be seed-based for deterministic replay in tests.",
      "The next PRD slice calls for canonical PlayerState initialization and a no-action monthly turn resolver.",
      "Turn logs should capture pre-turn snapshot, phase deltas, explanations, and post-turn snapshot.",
    ],
  },
  {
    id: "ui-foundation",
    name: "UI Foundation",
    summary:
      "Reusable UI components, layout components, global app styles, and the visual system.",
    paths: [
      "src/ui/src/components/ui",
      "src/ui/src/components/layout",
      "src/ui/src/App.css",
      "src/ui/src/index.css",
      "src/ui/src/assets",
      "docs/game-of-life-style-guide.md",
    ],
    patterns: [
      "Use the warm off-white canvas, white rounded surfaces, dark ink headings, and teal-blue-purple gradient family from the style guide.",
      "Keep desktop target fidelity to 1280x720 sample screens.",
      "Use existing button, input, avatar, page shell, and layout components before adding new primitives.",
    ],
  },
  {
    id: "game-list",
    name: "Home Game List",
    summary:
      "Home hero, game list section, game cards, status pills, skeleton/error states, and seeded games.",
    paths: [
      "src/ui/src/components/layout/GameListSection.jsx",
      "src/ui/src/components/games",
      "src/ui/src/data/seedGames.js",
      "src/ui/src/utils/formatRelativeTime.js",
    ],
    patterns: [
      "The single-card baseline keeps the first game card left-aligned with open whitespace.",
      "Cards show title, players, relative time, avatars, status, Resume, and delete action.",
    ],
  },
  {
    id: "testing",
    name: "Testing",
    summary:
      "Vitest unit/component tests, Testing Library helpers, Playwright visual/workflow coverage, and CI commands.",
    paths: [
      "src/ui/src/components/__tests__",
      "src/ui/src/services/__tests__",
      "src/ui/src/simulation/__tests__",
      "src/ui/src/test/testUtils.js",
      "src/ui/src/setupTests.js",
      "src/ui/e2e",
      "src/ui/playwright.config.js",
      "src/ui/vite.config.js",
    ],
    patterns: [
      "Use npm --prefix src/ui run test:ci for UI unit/component coverage.",
      "Use Playwright for visual or workflow coverage when browser fidelity matters.",
      "Keep tests focused on the behavioral surface changed by the task.",
    ],
  },
  {
    id: "api-infrastructure",
    name: "API, Deployment, and Infrastructure",
    summary:
      "AWS Lambda API, DynamoDB-backed persistence, Terraform resources, deploy/check scripts, and S3/CloudFront publishing.",
    paths: [
      "src/api/index.js",
      "src/api/package.json",
      "terraform",
      "scripts/deploy.sh",
      "scripts/check.sh",
      "scripts/README.md",
      "Makefile",
    ],
    patterns: [
      "Never run terraform apply in the implicit default workspace.",
      "Deployment is scripts/deploy.sh: preflight, Terraform, UI install/test/build, S3 sync, CloudFront invalidation.",
      "Resource identifiers should include the active Terraform workspace name through locals.",
    ],
  },
];

export const CODING_PATTERNS = [
  {
    id: "documentation-first-handoff",
    topic: "Project handoff",
    summary:
      "Before simulation or turn-flow work, read PRD section 11, ARCHITECTURE.md, the style guide, NOTES.md, and CHANGELOG.md.",
    sources: [
      "AGENTS.md",
      "docs/modern-game-of-life-prd.md",
      "docs/ARCHITECTURE.md",
      "docs/game-of-life-style-guide.md",
      "NOTES.md",
      "CHANGELOG.md",
    ],
  },
  {
    id: "storage-adapter",
    topic: "Persistence",
    summary:
      "The UI uses createGameStorage() as the persistence boundary. Local and API modes share the same adapter shape.",
    sources: ["src/ui/src/services/gameStorage.js", "src/ui/src/hooks/useGames.js", "docs/ARCHITECTURE.md"],
  },
  {
    id: "modal-owned-draft-state",
    topic: "New game setup",
    summary:
      "The setup modal owns draft game state locally. Closing the modal abandons the draft, and Start Game is the persistence point.",
    sources: [
      "src/ui/src/components/forms/NewGameWizard.jsx",
      "src/ui/src/hooks/useCreateGameForm.js",
      "docs/game-of-life-style-guide.md",
    ],
  },
  {
    id: "persisted-turn-progression",
    topic: "Turn flow",
    summary:
      "The active turn number, active player index, players, and moveHistory live on the persisted game object.",
    sources: ["src/ui/src/App.jsx", "src/ui/src/services/gameStorage.js", "docs/ARCHITECTURE.md"],
  },
  {
    id: "simulation-before-action-catalog",
    topic: "Simulation roadmap",
    summary:
      "The next product slice is canonical PlayerState initialization plus a deterministic no-action monthly turn resolver before a full action picker.",
    sources: ["docs/modern-game-of-life-prd.md", "docs/ARCHITECTURE.md"],
  },
  {
    id: "desktop-visual-fidelity",
    topic: "UI design",
    summary:
      "The UI target is a desktop browser at 1280x720. Match the sample-screen anatomy before broadening responsive behavior.",
    sources: ["docs/game-of-life-style-guide.md", "src/ui/e2e"],
  },
  {
    id: "focused-verification",
    topic: "Testing",
    summary:
      "Use Vitest/Testing Library for component and service behavior, and Playwright when visual fidelity or full workflow coverage is relevant.",
    sources: ["src/ui/package.json", "src/ui/src/components/__tests__", "src/ui/e2e", "docs/modern-game-of-life-prd.md"],
  },
  {
    id: "terraform-workspace-safety",
    topic: "Infrastructure",
    summary:
      "Terraform apply must not run in the default workspace. The check/deploy scripts enforce workspace and us-west-2 preconditions.",
    sources: ["AGENTS.md", "scripts/check.sh", "scripts/deploy.sh", "terraform/main.tf"],
  },
];

export function hasRipgrep() {
  return spawnSync("rg", ["--version"], { encoding: "utf8" }).status === 0;
}

export function listDocs() {
  return PROJECT_DOCS.map((doc) => ({ ...doc }));
}

export function listFunctionalAreas({ query } = {}) {
  const terms = tokenize(query || "");
  const areas = terms.length
    ? FUNCTIONAL_AREAS.filter((area) => scoreText(searchableAreaText(area), terms) > 0)
    : FUNCTIONAL_AREAS;

  return formatFunctionalAreas(areas);
}

export function locateFunctionalArea({ path: inputPath, query } = {}) {
  if (!inputPath && !query) {
    return "Provide either a project-relative file path or a functional-area query.";
  }

  if (inputPath) {
    const repoPath = normalizeRepoPath(inputPath);
    const matches = FUNCTIONAL_AREAS.filter((area) =>
      area.paths.some((areaPath) => pathMatches(repoPath, areaPath)),
    );

    if (matches.length === 0) {
      return [
        `No explicit functional area matched ${repoPath}.`,
        "",
        "Use search_project for code references, or update FUNCTIONAL_AREAS in tools/project-expert-mcp/src/projectKnowledge.js if this path should be mapped.",
      ].join("\n");
    }

    return [
      `Functional area for ${repoPath}:`,
      "",
      ...matches.map(formatAreaBlock),
    ].join("\n");
  }

  return listFunctionalAreas({ query });
}

export function getCodingPatterns({ topic } = {}) {
  const terms = tokenize(topic || "");
  const patterns = terms.length
    ? CODING_PATTERNS.filter((pattern) => scoreText(searchablePatternText(pattern), terms) > 0)
    : CODING_PATTERNS;

  if (patterns.length === 0) {
    return `No curated coding pattern matched "${topic}". Try functional_areas or search_project for source-level evidence.`;
  }

  return [
    "Current curated project patterns:",
    "",
    ...patterns.map((pattern) =>
      [
        `## ${pattern.topic}: ${pattern.id}`,
        pattern.summary,
        `Sources: ${pattern.sources.join(", ")}`,
      ].join("\n"),
    ),
  ].join("\n\n");
}

export async function readProjectDoc({ docId, maxChars = DEFAULT_MAX_CHARS } = {}) {
  const doc = PROJECT_DOCS.find((candidate) => candidate.id === docId);
  if (!doc) {
    return `Unknown docId "${docId}". Available docIds: ${PROJECT_DOCS.map((candidate) => candidate.id).join(", ")}`;
  }

  const text = await readProjectFile(doc.path, maxChars);
  return [`# ${doc.name}`, `Path: ${doc.path}`, "", text].join("\n");
}

export async function getProjectOverview({ maxChars = DEFAULT_MAX_CHARS } = {}) {
  const [prd, architecture, styleGuide] = await Promise.all([
    readProjectFile("docs/modern-game-of-life-prd.md", maxChars),
    readProjectFile("docs/ARCHITECTURE.md", Math.floor(maxChars / 2)),
    readProjectFile("docs/game-of-life-style-guide.md", Math.floor(maxChars / 2)),
  ]);

  const prdSection11 = extractSection(prd, /^## 11\. /m, /^## 12\. /m) || prd;
  const nextArchitectureTarget =
    extractSection(architecture, /^## Next Architecture Target/m, /^## Environments/m) || architecture;
  const playerTurnRules =
    extractSection(styleGuide, /^## 6\. Player Turn/m, /^## 7\. Interaction rules/m) || styleGuide;

  return clip(
    [
      "# Modern Game of Life Project Overview",
      "",
      "## System",
      "- Static React + Vite UI in src/ui.",
      "- Optional AWS persistence API in src/api.",
      "- Terraform provisions S3, CloudFront, DynamoDB, Lambda, and API Gateway.",
      "- UI can run fully locally through localStorage or against the deployed API.",
      "",
      "## Current Implementation and Next Slice",
      prdSection11,
      "",
      "## Next Architecture Target",
      nextArchitectureTarget,
      "",
      "## Player-Turn Design Contract",
      playerTurnRules,
      "",
      "## Functional Areas",
      formatFunctionalAreas(FUNCTIONAL_AREAS),
    ].join("\n"),
    maxChars,
  );
}

export async function answerProjectQuestion({ question, maxResults = 40 } = {}) {
  if (!question || !question.trim()) {
    return "Provide a non-empty project question.";
  }

  const terms = tokenize(question);
  const relevantAreas = FUNCTIONAL_AREAS
    .map((area) => ({ area, score: scoreText(searchableAreaText(area), terms) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ area }) => area);

  const relevantPatterns = CODING_PATTERNS
    .map((pattern) => ({ pattern, score: scoreText(searchablePatternText(pattern), terms) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ pattern }) => pattern);

  const searchQuery = terms.length ? terms.slice(0, 8).map(escapeRegExp).join("|") : question.trim();
  const evidence = await searchProject({
    query: searchQuery,
    globs: ["docs/**", "src/**", "scripts/**", "terraform/**", "*.md"],
    contextLines: 1,
    maxResults,
    caseSensitive: false,
  });

  return [
    `# Project Expert Context`,
    "",
    `Question: ${question.trim()}`,
    "",
    "This server is intentionally source-grounded. Treat the following as curated context for the local agent to answer from, with citations back to files.",
    "",
    "## Most Relevant Functional Areas",
    relevantAreas.length
      ? relevantAreas.map(formatAreaBlock).join("\n\n")
      : "No curated area matched strongly. Use the source evidence below.",
    "",
    "## Relevant Current Patterns",
    relevantPatterns.length
      ? relevantPatterns
          .map((pattern) => `- ${pattern.topic}: ${pattern.summary} Sources: ${pattern.sources.join(", ")}`)
          .join("\n")
      : "No curated pattern matched strongly.",
    "",
    "## Source Evidence",
    evidence,
    "",
    "## Useful Follow-up Tool Calls",
    "- search_project with a narrower query or glob.",
    "- locate_functional_area with a specific project-relative path.",
    "- read_project_doc with docId architecture, prd, or style-guide.",
  ].join("\n");
}

export async function searchProject({
  query,
  globs = [],
  contextLines = 2,
  maxResults = DEFAULT_SEARCH_LINES,
  caseSensitive = false,
} = {}) {
  if (!query || !query.trim()) {
    return "Provide a non-empty search query.";
  }

  const args = [
    "--line-number",
    "--column",
    "--hidden",
    "--color",
    "never",
    "--glob",
    "!.git/**",
    "--glob",
    "!node_modules/**",
    "--glob",
    "!dist/**",
    "--glob",
    "!build/**",
    "--glob",
    "!.terraform/**",
    "--glob",
    "!worktrees/**",
  ];

  if (!caseSensitive) {
    args.push("--ignore-case");
  }

  const safeContextLines = clampInteger(contextLines, 0, 10, 2);
  if (safeContextLines > 0) {
    args.push("--context", String(safeContextLines));
  }

  for (const glob of normalizeGlobs(globs)) {
    args.push("--glob", glob);
  }

  args.push("--", query.trim());

  const result = await runCommand("rg", args, { cwd: REPO_ROOT });
  if (result.code === 1) {
    return [`No matches for ${JSON.stringify(query.trim())}.`, "", `Command: ${formatCommand("rg", args)}`].join("\n");
  }

  if (result.code !== 0) {
    return [
      "Search failed.",
      `Command: ${formatCommand("rg", args)}`,
      result.stderr.trim() ? `Error: ${result.stderr.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  const lines = result.stdout.split(/\r?\n/).filter(Boolean);
  const safeMaxResults = clampInteger(maxResults, 1, 250, DEFAULT_SEARCH_LINES);
  const visibleLines = lines.slice(0, safeMaxResults);
  const truncated = lines.length > visibleLines.length || result.truncated;

  return [
    `Command: ${formatCommand("rg", args)}`,
    `Matches returned: ${visibleLines.length}${truncated ? " (truncated)" : ""}`,
    "",
    "```text",
    visibleLines.join("\n"),
    "```",
  ].join("\n");
}

export async function resourceList() {
  return [
    {
      uri: "project://overview",
      name: "Modern Game of Life Project Overview",
      description: "System overview, implementation status, next slice, and key functional areas.",
      mimeType: "text/markdown",
    },
    {
      uri: "project://functional-areas",
      name: "Functional Area Map",
      description: "Repo paths grouped by functional area.",
      mimeType: "text/markdown",
    },
    {
      uri: "project://coding-patterns",
      name: "Coding Patterns",
      description: "Curated architecture, design, testing, and infrastructure patterns.",
      mimeType: "text/markdown",
    },
    ...PROJECT_DOCS.map((doc) => ({
      uri: `project://docs/${doc.id}`,
      name: doc.name,
      description: doc.description,
      mimeType: "text/markdown",
    })),
  ];
}

export async function resourceRead(uri) {
  if (uri === "project://overview") {
    return getProjectOverview({});
  }

  if (uri === "project://functional-areas") {
    return listFunctionalAreas();
  }

  if (uri === "project://coding-patterns") {
    return getCodingPatterns();
  }

  const docPrefix = "project://docs/";
  if (uri.startsWith(docPrefix)) {
    return readProjectDoc({ docId: uri.slice(docPrefix.length) });
  }

  return `Unknown resource URI: ${uri}`;
}

export async function readProjectFile(repoPath, maxChars = DEFAULT_MAX_CHARS) {
  const absolutePath = toAbsoluteProjectPath(repoPath);
  const fileStat = await stat(absolutePath);
  if (!fileStat.isFile()) {
    throw new Error(`Path is not a file: ${normalizeRepoPath(absolutePath)}`);
  }

  const text = await readFile(absolutePath, "utf8");
  return clip(text, maxChars);
}

function toAbsoluteProjectPath(inputPath) {
  const normalizedInput = String(inputPath || "").trim();
  if (!normalizedInput) {
    throw new Error("Expected a project-relative path.");
  }

  const absolutePath = path.isAbsolute(normalizedInput)
    ? path.normalize(normalizedInput)
    : path.resolve(REPO_ROOT, normalizedInput);

  const relative = path.relative(REPO_ROOT, absolutePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Path escapes repository root: ${inputPath}`);
  }

  if (!existsSync(absolutePath)) {
    throw new Error(`Path does not exist: ${inputPath}`);
  }

  return absolutePath;
}

function normalizeRepoPath(inputPath) {
  const normalizedInput = String(inputPath || "").trim();
  if (!normalizedInput) {
    return "";
  }

  const absolutePath = path.isAbsolute(normalizedInput)
    ? path.normalize(normalizedInput)
    : path.resolve(REPO_ROOT, normalizedInput);

  const relative = path.relative(REPO_ROOT, absolutePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return normalizedInput.replaceAll("\\", "/");
  }

  return relative.replaceAll("\\", "/");
}

function pathMatches(repoPath, areaPath) {
  const normalizedAreaPath = areaPath.replaceAll("\\", "/").replace(/\/+$/, "");
  const normalizedRepoPath = repoPath.replaceAll("\\", "/");

  return (
    normalizedRepoPath === normalizedAreaPath ||
    normalizedRepoPath.startsWith(`${normalizedAreaPath}/`) ||
    normalizedAreaPath.startsWith(`${normalizedRepoPath}/`)
  );
}

function formatFunctionalAreas(areas) {
  if (!areas.length) {
    return "No functional areas matched.";
  }

  return areas.map(formatAreaBlock).join("\n\n");
}

function formatAreaBlock(area) {
  return [
    `## ${area.name} (${area.id})`,
    area.summary,
    "",
    "Paths:",
    ...area.paths.map((areaPath) => `- ${areaPath}`),
    "",
    "Patterns:",
    ...area.patterns.map((pattern) => `- ${pattern}`),
  ].join("\n");
}

function searchableAreaText(area) {
  return [area.id, area.name, area.summary, ...area.paths, ...area.patterns].join(" ");
}

function searchablePatternText(pattern) {
  return [pattern.id, pattern.topic, pattern.summary, ...pattern.sources].join(" ");
}

function tokenize(input) {
  return String(input || "")
    .toLowerCase()
    .match(/[a-z0-9][a-z0-9_-]{2,}/g)
    ?.filter((term) => !STOP_WORDS.has(term))
    .slice(0, 20) || [];
}

function scoreText(text, terms) {
  const haystack = String(text || "").toLowerCase();
  return terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
}

function extractSection(text, startPattern, endPattern) {
  const startMatch = startPattern.exec(text);
  if (!startMatch) {
    return "";
  }

  const startIndex = startMatch.index;
  const remainder = text.slice(startIndex + startMatch[0].length);
  const endMatch = endPattern.exec(remainder);
  const endIndex = endMatch ? startIndex + startMatch[0].length + endMatch.index : text.length;

  return text.slice(startIndex, endIndex).trim();
}

function clip(text, maxChars = DEFAULT_MAX_CHARS) {
  const safeMaxChars = clampInteger(maxChars, 1000, 100000, DEFAULT_MAX_CHARS);
  if (text.length <= safeMaxChars) {
    return text;
  }

  return `${text.slice(0, safeMaxChars)}\n\n[Truncated at ${safeMaxChars} characters.]`;
}

function normalizeGlobs(globs) {
  if (!Array.isArray(globs)) {
    return [];
  }

  return globs
    .map((glob) => String(glob || "").trim())
    .filter(Boolean)
    .filter((glob) => !glob.includes("\0"))
    .slice(0, 12);
}

function clampInteger(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isInteger(number)) {
    return fallback;
  }

  return Math.max(min, Math.min(max, number));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatCommand(command, args) {
  return [command, ...args].map(shellQuote).join(" ");
}

function shellQuote(value) {
  if (/^[a-zA-Z0-9_./:=@%+-]+$/.test(value)) {
    return value;
  }

  return `'${value.replaceAll("'", "'\\''")}'`;
}

function runCommand(command, args, { cwd, timeoutMs = 10000 } = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let truncated = false;

    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      stderr += `\nCommand timed out after ${timeoutMs}ms.`;
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      if (stdout.length >= SEARCH_OUTPUT_LIMIT) {
        truncated = true;
        return;
      }

      stdout += chunk.toString("utf8");
      if (stdout.length > SEARCH_OUTPUT_LIMIT) {
        stdout = stdout.slice(0, SEARCH_OUTPUT_LIMIT);
        truncated = true;
        child.kill("SIGTERM");
      }
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });

    child.on("error", (error) => {
      clearTimeout(timeout);
      resolve({
        code: 127,
        stdout,
        stderr: `${stderr}\n${error.message}`,
        truncated,
      });
    });

    child.on("close", (code) => {
      clearTimeout(timeout);
      resolve({
        code,
        stdout,
        stderr,
        truncated,
      });
    });
  });
}
