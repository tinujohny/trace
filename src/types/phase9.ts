import type { Claim, ConfidenceLevel, RecommendedAction, SignalSet } from "@/types";

/** Reference URLs passed into evaluation to ground the source signal (Phase 9). */
export interface GroundingReference {
  url: string;
}

/** Human reviewer overrides for a claim’s signals (Phase 9). */
export interface ClaimOverride {
  claimId: string;
  signals?: Partial<SignalSet>;
  recommendedAction?: RecommendedAction;
  reviewerNote?: string;
  updatedAt: string;
}

export interface BatchEvaluateRequestBody {
  content: string;
  title?: string;
  model?: string;
  sourceUrls?: string[];
}

export interface BatchEvaluateResponseBody {
  reportId: string;
  title: string;
  messageId: string;
  claims: Claim[];
  pipeline: "llm" | "stub";
  sourceUrls?: string[];
  error?: string;
}

export type ClaimOverrideMap = Record<string, ClaimOverride>;

export const OVERRIDE_STORAGE_KEY = "trace-claim-overrides-v1";

export const GROUNDING_STORAGE_KEY = "trace-grounding-urls-v1";

export const CONFIDENCE_OPTIONS: ConfidenceLevel[] = ["low", "medium", "high"];

export const ACTION_OPTIONS: RecommendedAction[] = ["trust", "verify", "skip"];
