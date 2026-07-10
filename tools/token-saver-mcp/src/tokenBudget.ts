export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function fitToTokenBudget(text: string, maxTokens: number): string {
  if (estimateTokens(text) <= maxTokens) {
    return text;
  }

  const maxChars = Math.max(120, maxTokens * 4);
  const notice = "\n\n[Truncated to fit token budget. Request a larger maxTokens value for more detail.]";
  const bodyBudget = Math.max(80, maxChars - notice.length);
  const clipped = text.slice(0, bodyBudget);
  const lastLineBreak = clipped.lastIndexOf("\n");
  const safeClip = lastLineBreak > bodyBudget * 0.6 ? clipped.slice(0, lastLineBreak) : clipped;

  return `${safeClip}${notice}`;
}

export function section(title: string, body: string): string {
  const trimmed = body.trim();
  return trimmed ? `## ${title}\n${trimmed}` : "";
}
