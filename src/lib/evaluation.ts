import type { Claim } from "@/types";

/** Merge a message evaluation into the evaluations map. */
export function applyEvaluation(
  map: Record<string, Claim[]>,
  messageId: string,
  claims: Claim[],
): Record<string, Claim[]> {
  if (claims.length === 0) {
    const next = { ...map };
    delete next[messageId];
    return next;
  }
  return { ...map, [messageId]: claims };
}
