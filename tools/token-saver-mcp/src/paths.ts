import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function defaultRepoRoot(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, "../../..");
}

export function normalizeRelativePath(input: string): string {
  return input.replaceAll("\\", "/").replace(/^\.\/+/, "");
}

export function resolveInsideRepo(repoRoot: string, requestedPath: string): string {
  const normalized = normalizeRelativePath(requestedPath);
  const resolved = path.resolve(repoRoot, normalized);
  const relative = path.relative(repoRoot, resolved);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Path escapes repository root: ${requestedPath}`);
  }

  return resolved;
}

export function pathExists(repoRoot: string, requestedPath: string): boolean {
  return fs.existsSync(resolveInsideRepo(repoRoot, requestedPath));
}

export function isTextLike(relativePath: string): boolean {
  const ext = path.extname(relativePath).toLowerCase();
  const basename = path.basename(relativePath).toLowerCase();

  if (["package-lock.json"].includes(basename)) {
    return false;
  }

  return [
    "",
    ".css",
    ".html",
    ".js",
    ".jsx",
    ".json",
    ".md",
    ".mjs",
    ".sh",
    ".tf",
    ".ts",
    ".tsx",
    ".txt",
    ".yml",
    ".yaml"
  ].includes(ext);
}
