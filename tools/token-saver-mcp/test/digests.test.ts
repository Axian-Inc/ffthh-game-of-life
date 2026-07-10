import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { loadConfig } from "../src/config.js";
import { DigestService } from "../src/digests.js";
import { resolveInsideRepo } from "../src/paths.js";
import { RepoIndex } from "../src/repoIndex.js";
import { estimateTokens, fitToTokenBudget } from "../src/tokenBudget.js";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(packageRoot, "../..");

function createDigestService(): DigestService {
  const config = loadConfig(repoRoot);
  return new DigestService(new RepoIndex(repoRoot, config), config);
}

describe("token budgeting", () => {
  test("estimates and trims output to the requested budget", () => {
    const trimmed = fitToTokenBudget("a".repeat(2000), 100);

    expect(estimateTokens(trimmed)).toBeLessThanOrEqual(125);
    expect(trimmed).toContain("Truncated to fit token budget");
  });
});

describe("path safety", () => {
  test("rejects paths outside the repository root", () => {
    expect(() => resolveInsideRepo(repoRoot, "../outside.md")).toThrow(/escapes repository root/);
  });
});

describe("digest service", () => {
  test("creates a source-linked repository context summary", () => {
    const digest = createDigestService().repoContextSummary("simulation", { maxTokens: 1400 });

    expect(digest).toContain("# Repository Context Summary");
    expect(digest).toContain("docs/modern-game-of-life-prd.md");
    expect(digest).toContain("src/ui/src/simulation");
  });

  test("creates a docs digest for PRD status", () => {
    const digest = createDigestService().docsDigest(["docs/modern-game-of-life-prd.md"], { maxTokens: 1200 });

    expect(digest).toContain("# Documentation Digest");
    expect(digest).toContain("11.1 Implemented");
    expect(digest).toContain("11.3 Next implementation slice");
  });

  test("maps code areas to files and inspection order", () => {
    const digest = createDigestService().codeAreaMap("api", { maxTokens: 1000 });

    expect(digest).toContain("# Code Area Map: api");
    expect(digest).toContain("src/api/index.js");
    expect(digest).toContain("terraform/main.tf");
  });

  test("compacts specific files without dumping entire contents", () => {
    const digest = createDigestService().compactFiles(["src/ui/src/simulation"], "understand simulation modules", { maxTokens: 1400 });

    expect(digest).toContain("# Compact File Digest");
    expect(digest).toContain("src/ui/src/simulation");
    expect(estimateTokens(digest)).toBeLessThanOrEqual(1450);
  });
});
