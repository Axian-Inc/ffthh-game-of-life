import fs from "node:fs";
import path from "node:path";

export type TokenSaverConfig = {
  defaultMaxTokens: number;
  maxTokens: number;
  priorityFiles: string[];
  topicAliases: Record<string, string[]>;
  exclude: string[];
};

export const DEFAULT_CONFIG: TokenSaverConfig = {
  defaultMaxTokens: 1200,
  maxTokens: 8000,
  priorityFiles: [
    "AGENTS.md",
    "README.md",
    "docs/modern-game-of-life-prd.md",
    "docs/ARCHITECTURE.md",
    "docs/game-of-life-style-guide.md",
    "NOTES.md",
    "CHANGELOG.md",
    "scripts/README.md"
  ],
  topicAliases: {},
  exclude: ["node_modules", "dist", "coverage", ".terraform", ".git", "package-lock.json"]
};

export function loadConfig(repoRoot: string): TokenSaverConfig {
  const candidates = [
    path.join(repoRoot, "tools/token-saver-mcp/token-saver.config.json"),
    path.join(repoRoot, "token-saver.config.json")
  ];

  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) {
      continue;
    }

    const parsed = JSON.parse(fs.readFileSync(candidate, "utf8")) as Partial<TokenSaverConfig>;
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      priorityFiles: parsed.priorityFiles ?? DEFAULT_CONFIG.priorityFiles,
      topicAliases: parsed.topicAliases ?? DEFAULT_CONFIG.topicAliases,
      exclude: parsed.exclude ?? DEFAULT_CONFIG.exclude
    };
  }

  return DEFAULT_CONFIG;
}

export function clampTokenBudget(requested: number | undefined, config: TokenSaverConfig): number {
  if (!requested || !Number.isFinite(requested)) {
    return config.defaultMaxTokens;
  }

  return Math.max(200, Math.min(config.maxTokens, Math.floor(requested)));
}
