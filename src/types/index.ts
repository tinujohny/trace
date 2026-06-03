/**
 * Trace data contracts — shared across all phases.
 * @see docs/PHASES.md
 */

export type MessageRole = "user" | "assistant";

export type ConfidenceLevel = "low" | "medium" | "high";

/** User prediction before evaluation is revealed (calibration mode). */
export type CalibrationChoice = "trust" | "verify" | "skip";

/** Trace-suggested action for calibration feedback (fixture / pipeline ground truth). */
export type RecommendedAction = CalibrationChoice;

/** Character offsets into assistant message `content` (UTF-16 code units). */
export interface TextSpan {
  start: number;
  end: number;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface SignalSet {
  source: string;
  reasoning: string;
  assumptions: string[];
  confidence: ConfidenceLevel;
  uncertainty: string;
}

export interface Claim {
  id: string;
  messageId: string;
  /** Exact substring of the parent message at `span`. */
  text: string;
  span: TextSpan;
  signals: SignalSet;
  recommendedAction: RecommendedAction;
  /** Reference URLs used when this claim was evaluated (Phase 9). */
  groundingUrls?: string[];
}

export interface MessageEvaluation {
  messageId: string;
  claims: Claim[];
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  evaluations: MessageEvaluation[];
  createdAt: string;
  updatedAt: string;
}

/** Per-claim calibration state (Phase 4+). */
export interface CalibrationRecord {
  claimId: string;
  choice: CalibrationChoice;
  revealedAt: string | null;
}

export interface CalibrationState {
  enabled: boolean;
  records: CalibrationRecord[];
}
