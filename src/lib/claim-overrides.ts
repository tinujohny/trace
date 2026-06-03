import type { Claim, RecommendedAction, SignalSet } from "@/types";
import type { ClaimOverride, ClaimOverrideMap } from "@/types/phase9";
import { OVERRIDE_STORAGE_KEY } from "@/types/phase9";

export function loadClaimOverrides(): ClaimOverrideMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(OVERRIDE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ClaimOverrideMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveClaimOverrides(map: ClaimOverrideMap): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(OVERRIDE_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // quota
  }
}

export function applyClaimOverride(claim: Claim, override?: ClaimOverride): Claim {
  if (!override) return claim;

  const signals: SignalSet = {
    ...claim.signals,
    ...(override.signals ?? {}),
    assumptions: override.signals?.assumptions ?? claim.signals.assumptions,
  };

  return {
    ...claim,
    signals,
    recommendedAction: override.recommendedAction ?? claim.recommendedAction,
  };
}

export function applyOverridesToClaims(
  claims: Claim[],
  overrides: ClaimOverrideMap,
): Claim[] {
  return claims.map((c) => applyClaimOverride(c, overrides[c.id]));
}

export function applyOverridesToEvaluationMap(
  map: Record<string, Claim[]>,
  overrides: ClaimOverrideMap,
): Record<string, Claim[]> {
  const next: Record<string, Claim[]> = {};
  for (const [messageId, claims] of Object.entries(map)) {
    next[messageId] = applyOverridesToClaims(claims, overrides);
  }
  return next;
}

export function createOverridePatch(
  claim: Claim,
  patch: {
    signals?: Partial<SignalSet>;
    recommendedAction?: RecommendedAction;
    reviewerNote?: string;
  },
): ClaimOverride {
  return {
    claimId: claim.id,
    signals: patch.signals,
    recommendedAction: patch.recommendedAction,
    reviewerNote: patch.reviewerNote,
    updatedAt: new Date().toISOString(),
  };
}
