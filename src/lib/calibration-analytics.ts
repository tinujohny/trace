import type { CalibrationRecord, Claim } from "@/types";

export interface CalibrationAnalytics {
  totalPredictions: number;
  totalRevealed: number;
  totalAligned: number;
  alignmentRate: number | null;
}

export function computeCalibrationAnalytics(
  records: Record<string, CalibrationRecord>,
  evaluationsByMessageId: Record<string, Claim[]>,
): CalibrationAnalytics {
  const claimsById = new Map<string, Claim>();
  for (const claims of Object.values(evaluationsByMessageId)) {
    for (const claim of claims) claimsById.set(claim.id, claim);
  }

  let totalPredictions = 0;
  let totalRevealed = 0;
  let totalAligned = 0;

  for (const record of Object.values(records)) {
    if (!record.choice) continue;
    totalPredictions += 1;
    if (record.revealedAt) {
      totalRevealed += 1;
      const claim = claimsById.get(record.claimId);
      if (claim && record.choice === claim.recommendedAction) {
        totalAligned += 1;
      }
    }
  }

  return {
    totalPredictions,
    totalRevealed,
    totalAligned,
    alignmentRate:
      totalRevealed > 0 ? Math.round((totalAligned / totalRevealed) * 100) : null,
  };
}
