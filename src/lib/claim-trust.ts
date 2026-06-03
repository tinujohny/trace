import type { Claim } from "@/types";

const NO_EXTERNAL_SOURCE_MARKERS = [
  "no external source exists",
  "no external source",
] as const;

/**
 * Anti-over-skepticism: high confidence plus a real source (not the LLM placeholder).
 */
export function isWellSourcedHighConfidence(claim: Claim): boolean {
  if (claim.signals.confidence !== "high") {
    return false;
  }

  const source = claim.signals.source.trim();
  if (!source) {
    return false;
  }

  const lower = source.toLowerCase();
  return !NO_EXTERNAL_SOURCE_MARKERS.some((marker) => lower.includes(marker));
}
