"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CalibrationChoice, CalibrationRecord, Claim } from "@/types";

export interface MessageCalibrationSummary {
  messageId: string;
  total: number;
  predicted: number;
  revealed: number;
  aligned: number;
}

interface UseCalibrationOptions {
  defaultEnabled?: boolean;
  initialRecords?: Record<string, CalibrationRecord>;
  initialEnabled?: boolean;
}

export function useCalibration({
  defaultEnabled = false,
  initialRecords = {},
  initialEnabled,
}: UseCalibrationOptions = {}) {
  const [enabled, setEnabled] = useState(initialEnabled ?? defaultEnabled);
  const [records, setRecords] = useState<Record<string, CalibrationRecord>>(initialRecords);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (hydrated) return;
    setEnabled(initialEnabled ?? defaultEnabled);
    setRecords(initialRecords);
    setHydrated(true);
  }, [defaultEnabled, initialEnabled, initialRecords, hydrated]);

  const predict = useCallback((claimId: string, choice: CalibrationChoice) => {
    setRecords((prev) => ({
      ...prev,
      [claimId]: { claimId, choice, revealedAt: null },
    }));
  }, []);

  const reveal = useCallback((claimId: string) => {
    setRecords((prev) => {
      const record = prev[claimId];
      if (!record?.choice) return prev;
      return {
        ...prev,
        [claimId]: { ...record, revealedAt: new Date().toISOString() },
      };
    });
  }, []);

  const revealAllForClaims = useCallback((claims: Claim[]) => {
    const now = new Date().toISOString();
    setRecords((prev) => {
      const next = { ...prev };
      for (const claim of claims) {
        const record = next[claim.id];
        if (record?.choice && !record.revealedAt) {
          next[claim.id] = { ...record, revealedAt: now };
        }
      }
      return next;
    });
  }, []);

  const getRecord = useCallback(
    (claimId: string): CalibrationRecord | undefined => records[claimId],
    [records],
  );

  const isRevealed = useCallback(
    (claimId: string) => Boolean(records[claimId]?.revealedAt),
    [records],
  );

  const resetCalibration = useCallback(() => {
    setRecords({});
  }, []);

  const getMessageSummary = useCallback(
    (claims: Claim[]): MessageCalibrationSummary | null => {
      if (claims.length === 0) return null;
      const messageId = claims[0].messageId;
      let predicted = 0;
      let revealed = 0;
      let aligned = 0;

      for (const claim of claims) {
        const record = records[claim.id];
        if (record?.choice) predicted += 1;
        if (record?.revealedAt) {
          revealed += 1;
          if (record.choice === claim.recommendedAction) aligned += 1;
        }
      }

      return { messageId, total: claims.length, predicted, revealed, aligned };
    },
    [records],
  );

  const allRevealedForClaims = useCallback(
    (claims: Claim[]) => claims.length > 0 && claims.every((c) => isRevealed(c.id)),
    [isRevealed],
  );

  const canRevealAll = useCallback(
    (claims: Claim[]) =>
      claims.length > 0 &&
      claims.every((c) => records[c.id]?.choice) &&
      claims.some((c) => !records[c.id]?.revealedAt),
    [records],
  );

  return useMemo(
    () => ({
      enabled,
      setEnabled,
      records,
      predict,
      reveal,
      revealAllForClaims,
      getRecord,
      isRevealed,
      resetCalibration,
      getMessageSummary,
      allRevealedForClaims,
      canRevealAll,
    }),
    [
      enabled,
      records,
      predict,
      reveal,
      revealAllForClaims,
      getRecord,
      isRevealed,
      resetCalibration,
      getMessageSummary,
      allRevealedForClaims,
      canRevealAll,
    ],
  );
}
