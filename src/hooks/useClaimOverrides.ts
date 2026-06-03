"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createOverridePatch,
  loadClaimOverrides,
  saveClaimOverrides,
} from "@/lib/claim-overrides";
import type { Claim, RecommendedAction, SignalSet } from "@/types";
import type { ClaimOverrideMap } from "@/types/phase9";

export function useClaimOverrides() {
  const [overrides, setOverrides] = useState<ClaimOverrideMap>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setOverrides(loadClaimOverrides());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveClaimOverrides(overrides);
  }, [overrides, loaded]);

  const getOverride = useCallback(
    (claimId: string) => overrides[claimId],
    [overrides],
  );

  const hasOverride = useCallback(
    (claimId: string) => Boolean(overrides[claimId]),
    [overrides],
  );

  const saveOverride = useCallback(
    (
      claim: Claim,
      patch: {
        signals?: Partial<SignalSet>;
        recommendedAction?: RecommendedAction;
        reviewerNote?: string;
      },
    ) => {
      setOverrides((prev) => ({
        ...prev,
        [claim.id]: createOverridePatch(claim, patch),
      }));
    },
    [],
  );

  const clearOverride = useCallback((claimId: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[claimId];
      return next;
    });
  }, []);

  const clearAll = useCallback(() => setOverrides({}), []);

  return {
    overrides,
    loaded,
    getOverride,
    hasOverride,
    saveOverride,
    clearOverride,
    clearAll,
  };
}
