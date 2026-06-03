import type { Claim } from "@/types";

export type TextSegment = { type: "text"; text: string };
export type ClaimSegment = { type: "claim"; claim: Claim };
export type ContentSegment = TextSegment | ClaimSegment;

/** Split message content into plain text and claim spans (claims must not overlap). */
export function buildClaimSegments(content: string, claims: Claim[]): ContentSegment[] {
  if (claims.length === 0) {
    return [{ type: "text", text: content }];
  }

  const sorted = [...claims].sort((a, b) => a.span.start - b.span.start);
  const segments: ContentSegment[] = [];
  let cursor = 0;

  for (const claim of sorted) {
    if (claim.span.start < cursor) continue;
    if (claim.span.start > cursor) {
      segments.push({ type: "text", text: content.slice(cursor, claim.span.start) });
    }
    segments.push({ type: "claim", claim });
    cursor = claim.span.end;
  }

  if (cursor < content.length) {
    segments.push({ type: "text", text: content.slice(cursor) });
  }

  return segments;
}
