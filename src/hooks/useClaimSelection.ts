"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Claim } from "@/types";

interface UseClaimSelectionOptions {
  initialActiveClaimId?: string | null;
}

export function useClaimSelection(
  evaluationsByMessageId: Record<string, Claim[]>,
  { initialActiveClaimId = null }: UseClaimSelectionOptions = {},
) {
  const [activeClaimId, setActiveClaimId] = useState<string | null>(initialActiveClaimId);

  const activeClaim = useMemo((): Claim | null => {
    if (!activeClaimId) return null;
    for (const claims of Object.values(evaluationsByMessageId)) {
      const found = claims.find((c) => c.id === activeClaimId);
      if (found) return found;
    }
    return null;
  }, [activeClaimId, evaluationsByMessageId]);

  const activeMessageClaims = useMemo((): Claim[] => {
    if (!activeClaim) return [];
    return evaluationsByMessageId[activeClaim.messageId] ?? [];
  }, [activeClaim, evaluationsByMessageId]);

  const allClaims = useMemo(
    () => Object.values(evaluationsByMessageId).flat(),
    [evaluationsByMessageId],
  );

  const selectClaim = useCallback((claimId: string) => {
    setActiveClaimId(claimId);
  }, []);

  const clearSelection = useCallback(() => {
    setActiveClaimId(null);
  }, []);

  const resetSelection = useCallback(() => {
    setActiveClaimId(null);
  }, []);

  useEffect(() => {
    if (!activeClaimId) return;
    const stillExists = allClaims.some((c) => c.id === activeClaimId);
    if (!stillExists) setActiveClaimId(null);
  }, [activeClaimId, allClaims]);

  useEffect(() => {
    if (!activeClaimId) return;
    const el = document.getElementById(`claim-${activeClaimId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [activeClaimId]);

  return {
    activeClaimId,
    activeClaim,
    activeMessageClaims,
    allClaims,
    selectClaim,
    clearSelection,
    resetSelection,
  };
}
