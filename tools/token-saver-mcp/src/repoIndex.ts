import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { TokenSaverConfig } from "./config.js";
import { isTextLike, normalizeRelativePath, resolveInsideRepo } from "./paths.js";

export type IndexedFile = {
  path: string;
  absolutePath: string;
  size: number;
  mtimeMs: number;
  hash: string;
};

type CacheEntry = IndexedFile & {
  content?: string;
};

export class RepoIndex {
  private filesCache: IndexedFile[] | null = null;
  private contentCache = new Map<string, CacheEntry>();

  constructor(
    public readonly repoRoot: string,
    private readonly config: TokenSaverConfig
  ) {}

  listFiles(): IndexedFile[] {
    if (this.filesCache) {
      return this.filesCache;
    }

    const discovered = this.listTrackedFiles()
      .filter((filePath) => this.shouldInclude(filePath))
      .map((filePath) => this.toIndexedFile(filePath))
      .filter((file): file is IndexedFile => Boolean(file));

    this.filesCache = discovered;
    return discovered;
  }

  readText(relativePath: string): string {
    const normalized = normalizeRelativePath(relativePath);
    if (!this.shouldInclude(normalized)) {
      throw new Error(`Path is excluded or not text-like: ${relativePath}`);
    }

    const absolutePath = resolveInsideRepo(this.repoRoot, normalized);
    const stat = fs.statSync(absolutePath);
    if (stat.isDirectory()) {
      throw new Error(`Path is a directory, not a file: ${relativePath}`);
    }

    const cached = this.contentCache.get(normalized);
    if (cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size && cached.content !== undefined) {
      return cached.content;
    }

    const content = fs.readFileSync(absolutePath, "utf8");
    const hash = crypto.createHash("sha1").update(content).digest("hex");
    this.contentCache.set(normalized, {
      path: normalized,
      absolutePath,
      size: stat.size,
      mtimeMs: stat.mtimeMs,
      hash,
      content
    });

    return content;
  }

  resolveTargets(targets: string[]): string[] {
    const files = this.listFiles().map((file) => file.path);
    const expanded = new Set<string>();

    for (const target of targets) {
      const normalized = normalizeRelativePath(target);
      const absolute = resolveInsideRepo(this.repoRoot, normalized);
      if (fs.existsSync(absolute) && fs.statSync(absolute).isFile() && this.shouldInclude(normalized)) {
        expanded.add(normalized);
        continue;
      }

      const prefix = normalized.endsWith("/") ? normalized : `${normalized}/`;
      for (const filePath of files) {
        if (filePath.startsWith(prefix)) {
          expanded.add(filePath);
        }
      }
    }

    return [...expanded].sort();
  }

  private listTrackedFiles(): string[] {
    try {
      const output = execFileSync("git", ["-C", this.repoRoot, "ls-files"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"]
      });
      return output.split("\n").filter(Boolean).map(normalizeRelativePath);
    } catch {
      return this.walk(this.repoRoot);
    }
  }

  private walk(directory: string): string[] {
    const results: string[] = [];
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      const relative = normalizeRelativePath(path.relative(this.repoRoot, absolute));
      if (!this.shouldInclude(relative)) {
        continue;
      }
      if (entry.isDirectory()) {
        results.push(...this.walk(absolute));
      } else {
        results.push(relative);
      }
    }
    return results;
  }

  private shouldInclude(relativePath: string): boolean {
    const normalized = normalizeRelativePath(relativePath);
    const parts = normalized.split("/");
    if (this.config.exclude.some((excluded) => normalized === excluded || parts.includes(excluded) || normalized.startsWith(`${excluded}/`))) {
      return false;
    }
    return isTextLike(normalized);
  }

  private toIndexedFile(relativePath: string): IndexedFile | null {
    const absolutePath = resolveInsideRepo(this.repoRoot, relativePath);
    if (!fs.existsSync(absolutePath)) {
      return null;
    }

    const stat = fs.statSync(absolutePath);
    if (!stat.isFile()) {
      return null;
    }

    const cacheKey = normalizeRelativePath(relativePath);
    const cached = this.contentCache.get(cacheKey);
    if (cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) {
      return {
        path: cacheKey,
        absolutePath,
        size: stat.size,
        mtimeMs: stat.mtimeMs,
        hash: cached.hash
      };
    }

    const hash = crypto.createHash("sha1").update(`${cacheKey}:${stat.size}:${stat.mtimeMs}`).digest("hex");
    return {
      path: cacheKey,
      absolutePath,
      size: stat.size,
      mtimeMs: stat.mtimeMs,
      hash
    };
  }
}
