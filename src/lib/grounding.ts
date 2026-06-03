import type { Claim } from "@/types";

const URL_PATTERN = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;

/** Parse newline- or comma-separated URLs; dedupe and validate http(s). */
export function parseSourceUrls(input: string): string[] {
  const parts = input
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const urls: string[] = [];

  for (const part of parts) {
    const match = part.match(URL_PATTERN);
    const candidate = match?.[0] ?? part;
    try {
      const url = new URL(candidate);
      if (url.protocol !== "http:" && url.protocol !== "https:") continue;
      const normalized = url.href;
      if (!seen.has(normalized)) {
        seen.add(normalized);
        urls.push(normalized);
      }
    } catch {
      // skip invalid
    }
  }

  return urls;
}

export function buildGroundingPromptBlock(urls: string[]): string {
  if (urls.length === 0) return "";
  const list = urls.map((u, i) => `${i + 1}. ${u}`).join("\n");
  return `Reference URLs provided by the user (use these to inform each claim's "source" field; cite which URL applies when relevant):
${list}

`;
}

/** Append grounding note to source when URLs were supplied. */
export function enrichSourceWithGrounding(source: string, urls: string[]): string {
  if (urls.length === 0) return source;
  const refs = urls.map((u) => `• ${u}`).join("\n");
  return `${source.trim()}\n\nGrounded references:\n${refs}`;
}

/** Normalize API body `sourceUrls` (string or string[]). */
export function normalizeSourceUrls(raw: unknown): string[] {
  if (typeof raw === "string") return parseSourceUrls(raw);
  if (!Array.isArray(raw)) return [];
  const urls: string[] = [];
  for (const item of raw) {
    if (typeof item === "string") urls.push(...parseSourceUrls(item));
  }
  return [...new Set(urls)];
}

export function attachGroundingToClaims(claims: Claim[], urls: string[]): Claim[] {
  if (urls.length === 0) return claims;
  return claims.map((claim) => ({
    ...claim,
    groundingUrls: urls,
    signals: {
      ...claim.signals,
      source: enrichSourceWithGrounding(claim.signals.source, urls),
    },
  }));
}
