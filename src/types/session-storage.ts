import type { CalibrationRecord, Claim, Message } from "@/types";

/** Full Trace session persisted to localStorage (Phase 8). */
export interface PersistedTraceSession {
  version: 2;
  messages: Message[];
  evaluationsByMessageId: Record<string, Claim[]>;
  evaluationErrorsByMessageId: Record<string, string>;
  calibrationEnabled: boolean;
  calibrationRecords: Record<string, CalibrationRecord>;
  activeClaimId: string | null;
  updatedAt: string;
}

export const EMPTY_SESSION: PersistedTraceSession = {
  version: 2,
  messages: [],
  evaluationsByMessageId: {},
  evaluationErrorsByMessageId: {},
  calibrationEnabled: false,
  calibrationRecords: {},
  activeClaimId: null,
  updatedAt: new Date().toISOString(),
};
