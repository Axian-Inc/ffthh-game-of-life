import path from "node:path";
import { TokenSaverConfig, clampTokenBudget } from "./config.js";
import { RepoIndex } from "./repoIndex.js";
import { fitToTokenBudget, section } from "./tokenBudget.js";
import { normalizeRelativePath } from "./paths.js";

const DOC_PATHS = [
  "AGENTS.md",
  "README.md",
  "docs/modern-game-of-life-prd.md",
  "docs/ARCHITECTURE.md",
  "docs/game-of-life-style-guide.md",
  "NOTES.md",
  "CHANGELOG.md",
  "scripts/README.md"
];

const AREA_TARGETS: Record<string, string[]> = {
  ui: ["src/ui/src/App.jsx", "src/ui/src/components", "src/ui/src/hooks", "src/ui/src/data"],
  simulation: ["src/ui/src/simulation", "docs/modern-game-of-life-prd.md", "docs/ARCHITECTURE.md"],
  api: ["src/api/index.js", "src/api/package.json", "terraform/main.tf"],
  terraform: ["terraform/main.tf", "terraform/outputs.tf", "terraform/variables.tf", "scripts/README.md"],
  deploy: ["scripts/check.sh", "scripts/deploy.sh", "scripts/README.md", "terraform"],
  tests: ["src/ui/src/components/__tests__", "src/ui/src/simulation/__tests__", "src/ui/src/services/__tests__", "src/ui/e2e"],
  docs: DOC_PATHS
};

type DigestOptions = {
  maxTokens?: number;
};

export class DigestService {
  constructor(
    private readonly repoIndex: RepoIndex,
    private readonly config: TokenSaverConfig
  ) {}

  repoContextSummary(topic?: string, options: DigestOptions = {}): string {
    const maxTokens = clampTokenBudget(options.maxTokens, this.config);
    const targetDocs = this.resolveTopicTargets(topic, DOC_PATHS);
    const docs = this.digestFiles(targetDocs, { mode: "docs", maxFiles: 10 });

    const topicLine = topic ? `Topic: ${topic}` : "Topic: general repository orientation";
    const output = [
      "# Repository Context Summary",
      topicLine,
      "",
      section("Current Shape", docs),
      section("High-Value Starting Points", this.highValueStartingPoints(topic)),
      section("Verification Commands", this.verificationCommands(topic))
    ]
      .filter(Boolean)
      .join("\n\n");

    return fitToTokenBudget(output, maxTokens);
  }

  docsDigest(docs?: string[], options: DigestOptions = {}): string {
    const maxTokens = clampTokenBudget(options.maxTokens, this.config);
    const targets = docs?.length ? docs : DOC_PATHS;
    const files = this.repoIndex.resolveTargets(targets);
    const output = [
      "# Documentation Digest",
      `Sources: ${files.length ? files.join(", ") : "none matched"}`,
      "",
      this.digestFiles(files.length ? files : targets, { mode: "docs", maxFiles: 12 })
    ].join("\n");

    return fitToTokenBudget(output, maxTokens);
  }

  codeAreaMap(area: string, options: DigestOptions = {}): string {
    const maxTokens = clampTokenBudget(options.maxTokens, this.config);
    const normalizedArea = area.trim().toLowerCase();
    const targets = AREA_TARGETS[normalizedArea] ?? this.config.topicAliases[normalizedArea] ?? [area];
    const files = this.repoIndex.resolveTargets(targets).slice(0, 80);

    const grouped = this.groupByDirectory(files);
    const digest = this.digestFiles(files.slice(0, 18), { mode: "code", maxFiles: 18 });

    const output = [
      `# Code Area Map: ${area}`,
      section("File Groups", grouped),
      section("Key Extracts", digest),
      section("Suggested Inspection Order", this.inspectionOrder(normalizedArea, files))
    ]
      .filter(Boolean)
      .join("\n\n");

    return fitToTokenBudget(output, maxTokens);
  }

  taskBrief(task: string, options: DigestOptions = {}): string {
    const maxTokens = clampTokenBudget(options.maxTokens, this.config);
    const taskLower = task.toLowerCase();
    const topics = Object.keys({ ...AREA_TARGETS, ...this.config.topicAliases }).filter((topic) => taskLower.includes(topic));
    const targetLists = topics.length ? topics.flatMap((topic) => AREA_TARGETS[topic] ?? this.config.topicAliases[topic]) : this.config.priorityFiles;
    const files = this.repoIndex.resolveTargets(targetLists).slice(0, 30);

    const output = [
      "# Task Brief",
      `Task: ${task}`,
      "",
      section("Context To Load First", this.formatFileList(files.slice(0, 12))),
      section("Relevant Extracts", this.digestFiles(files.slice(0, 10), { mode: "mixed", maxFiles: 10 })),
      section("Repo Constraints", this.repoConstraints()),
      section("Expected Verification", this.verificationCommands(topics[0]))
    ]
      .filter(Boolean)
      .join("\n\n");

    return fitToTokenBudget(output, maxTokens);
  }

  compactFiles(paths: string[], purpose?: string, options: DigestOptions = {}): string {
    const maxTokens = clampTokenBudget(options.maxTokens, this.config);
    const files = this.repoIndex.resolveTargets(paths);
    const output = [
      "# Compact File Digest",
      purpose ? `Purpose: ${purpose}` : "",
      `Sources: ${files.length ? files.join(", ") : "none matched"}`,
      "",
      this.digestFiles(files, { mode: "mixed", maxFiles: 24 })
    ]
      .filter(Boolean)
      .join("\n");

    return fitToTokenBudget(output, maxTokens);
  }

  resourceDigest(resourceName: string): string {
    switch (resourceName) {
      case "overview":
        return this.repoContextSummary(undefined, { maxTokens: 1400 });
      case "prd-status":
        return this.docsDigest(["docs/modern-game-of-life-prd.md"], { maxTokens: 1600 });
      case "architecture":
        return this.docsDigest(["docs/ARCHITECTURE.md"], { maxTokens: 1000 });
      case "style-guide":
        return this.docsDigest(["docs/game-of-life-style-guide.md"], { maxTokens: 1000 });
      case "ops-and-deploy":
        return this.docsDigest(["README.md", "scripts/README.md", "scripts/check.sh", "scripts/deploy.sh"], { maxTokens: 1200 });
      default:
        throw new Error(`Unknown resource: ${resourceName}`);
    }
  }

  private resolveTopicTargets(topic: string | undefined, fallback: string[]): string[] {
    if (!topic) {
      return fallback;
    }

    const normalized = topic.trim().toLowerCase();
    return this.config.topicAliases[normalized] ?? AREA_TARGETS[normalized] ?? fallback;
  }

  private digestFiles(files: string[], options: { mode: "docs" | "code" | "mixed"; maxFiles: number }): string {
    const uniqueFiles = [...new Set(files.map(normalizeRelativePath))].slice(0, options.maxFiles);
    const chunks: string[] = [];

    for (const filePath of uniqueFiles) {
      try {
        const content = this.repoIndex.readText(filePath);
        const mode = options.mode === "mixed" ? (path.extname(filePath).toLowerCase() === ".md" ? "docs" : "code") : options.mode;
        chunks.push(mode === "docs" ? this.markdownDigest(filePath, content) : this.codeDigest(filePath, content));
      } catch (error) {
        chunks.push(`- ${filePath}: ${(error as Error).message}`);
      }
    }

    return chunks.join("\n\n");
  }

  private markdownDigest(filePath: string, content: string): string {
    const lines = content.split(/\r?\n/);
    const priority: string[] = [];
    const useful: string[] = [];
    const seen = new Set<string>();

    const addLine = (target: string[], index: number, trimmed: string) => {
      const formatted = `- ${filePath}:${index + 1} ${trimmed}`;
      if (!seen.has(formatted)) {
        seen.add(formatted);
        target.push(formatted);
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return;
      }

      if (this.isPriorityMarkdownLine(trimmed)) {
        addLine(priority, index, trimmed);
        return;
      }

      if (/^#{1,4}\s/.test(trimmed)) {
        addLine(useful, index, trimmed);
        return;
      }

      if (/^[-*]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
        if (this.isHighValueLine(trimmed)) {
          addLine(useful, index, trimmed);
        }
        return;
      }

      if (this.isHighValueLine(trimmed)) {
        addLine(useful, index, trimmed);
      }
    });

    return [`### ${filePath}`, ...priority.slice(0, 18), ...useful.slice(0, 28)].join("\n");
  }

  private codeDigest(filePath: string, content: string): string {
    const lines = content.split(/\r?\n/);
    const useful: string[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return;
      }

      if (
        /^(export\s+)?(async\s+)?function\s+\w+/.test(trimmed) ||
        /^export\s+(const|class|type)\s+\w+/.test(trimmed) ||
        /^class\s+\w+/.test(trimmed) ||
        /^import\s/.test(trimmed) ||
        /^\s*test\(["'`]/.test(line) ||
        /^\s*it\(["'`]/.test(line) ||
        /^\s*describe\(["'`]/.test(line) ||
        /^resource\s+".+"/.test(trimmed) ||
        /^output\s+".+"/.test(trimmed) ||
        /^app\.(get|post|put|delete)\(/.test(trimmed)
      ) {
        useful.push(`- ${filePath}:${index + 1} ${trimmed}`);
      }
    });

    if (!useful.length) {
      useful.push(`- ${filePath}:1 ${lines[0]?.trim() ?? "(empty file)"}`);
    }

    return [`### ${filePath}`, ...useful.slice(0, 24)].join("\n");
  }

  private isHighValueLine(line: string): boolean {
    return /implemented|current|next|limitation|goal|scope|verify|deploy|test|architecture|data flow|key files|workspace|terraform|must|should|api|persist|turn|simulation/i.test(
      line
    );
  }

  private isPriorityMarkdownLine(line: string): boolean {
    return /^#{2,4}\s+11\b/.test(line) || /^#{2,4}\s+Delivery Planning\b/i.test(line) || /^11\.\d+/.test(line);
  }

  private groupByDirectory(files: string[]): string {
    if (!files.length) {
      return "No matching files found.";
    }

    const groups = new Map<string, string[]>();
    for (const filePath of files) {
      const directory = path.dirname(filePath);
      const existing = groups.get(directory) ?? [];
      existing.push(path.basename(filePath));
      groups.set(directory, existing);
    }

    return [...groups.entries()]
      .slice(0, 16)
      .map(([directory, names]) => `- ${directory}: ${names.slice(0, 8).join(", ")}${names.length > 8 ? `, +${names.length - 8} more` : ""}`)
      .join("\n");
  }

  private inspectionOrder(area: string, files: string[]): string {
    if (!files.length) {
      return "No files matched; try a broader area such as ui, simulation, api, terraform, deploy, tests, or docs.";
    }

    const preferred = files.filter((filePath) => {
      if (area === "simulation") return /simulation|modern-game-of-life-prd|ARCHITECTURE/.test(filePath);
      if (area === "ui") return /App\.jsx|components\/pages|components\/modals|hooks/.test(filePath);
      if (area === "deploy" || area === "terraform") return /scripts|terraform/.test(filePath);
      if (area === "api") return /src\/api|terraform/.test(filePath);
      if (area === "tests") return /__tests__|e2e/.test(filePath);
      return true;
    });

    return this.formatFileList((preferred.length ? preferred : files).slice(0, 10));
  }

  private highValueStartingPoints(topic?: string): string {
    const targets = this.resolveTopicTargets(topic, this.config.priorityFiles);
    const files = this.repoIndex.resolveTargets(targets).slice(0, 12);
    return this.formatFileList(files);
  }

  private formatFileList(files: string[]): string {
    return files.length ? files.map((filePath) => `- ${filePath}`).join("\n") : "No matching files found.";
  }

  private repoConstraints(): string {
    return [
      "- Terraform apply must never run from the default workspace.",
      "- Prefer `scripts/deploy.sh` for deployment.",
      "- UI verification defaults to `npm --prefix src/ui run test:ci` and `npm --prefix src/ui run build`.",
      "- Current product handoff starts in `docs/modern-game-of-life-prd.md` section 11."
    ].join("\n");
  }

  private verificationCommands(topic?: string): string {
    const normalized = topic?.toLowerCase() ?? "";
    if (["deploy", "terraform", "api"].includes(normalized)) {
      return ["- `scripts/check.sh`", "- `scripts/deploy.sh` only after confirming Terraform workspace is not `default`"].join("\n");
    }

    return ["- `npm --prefix src/ui run test:ci`", "- `npm --prefix src/ui run build`"].join("\n");
  }
}

export { DOC_PATHS, AREA_TARGETS };
