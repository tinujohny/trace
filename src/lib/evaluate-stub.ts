import { hydrateClaims } from "@/lib/claims";
import { spanOf } from "@/lib/spans";
import { getFixtureEvaluationForContent } from "@/fixtures/evaluation-catalog";
import type { Message, MessageEvaluation, RecommendedAction, SignalSet } from "@/types";

export type EvaluateResult =
  | { ok: true; evaluation: MessageEvaluation }
  | { ok: false; error: string; evaluation: MessageEvaluation };

const MAX_SENTENCE_CLAIMS = 8;

/**
 * Stub evaluate pipeline (Phase 5): fixture catalog → sentence split → empty.
 */
export function evaluateAssistantContent(
  messageId: string,
  content: string,
): EvaluateResult {
  const trimmed = content.trim();
  if (!trimmed) {
    return emptyResult(messageId, "Message content is empty.");
  }

  const fixtureEval = getFixtureEvaluationForContent(trimmed, messageId);
  if (fixtureEval) {
    return { ok: true, evaluation: fixtureEval };
  }

  try {
    const generated = generateSentenceEvaluation(messageId, trimmed);
    if (generated.claims.length > 0) {
      return { ok: true, evaluation: generated };
    }
    return emptyResult(messageId, "No claims could be extracted from this reply.");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Evaluation failed.";
    return emptyResult(messageId, message);
  }
}

function emptyResult(messageId: string, error: string): EvaluateResult {
  return {
    ok: false,
    error,
    evaluation: { messageId, claims: [] },
  };
}

/** Split into sentences and attach generic stub signals (unsupported / fallback replies). */
function generateSentenceEvaluation(messageId: string, content: string): MessageEvaluation {
  const sentences = splitSentences(content).slice(0, MAX_SENTENCE_CLAIMS);
  const message: Message = {
    id: messageId,
    role: "assistant",
    content,
    createdAt: new Date().toISOString(),
  };

  const drafts = sentences.map((sentence, index) => {
    const span = spanOf(content, sentence);
    const stub = genericStubSignals(index);
    return {
      id: `${messageId}-stub-${index}`,
      messageId,
      span,
      signals: stub.signals,
      recommendedAction: stub.recommendedAction,
    };
  });

  return {
    messageId,
    claims: hydrateClaims(message, drafts),
  };
}

function splitSentences(text: string): string[] {
  const parts = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  if (!parts) return [text];
  return parts.map((s) => s.trim()).filter((s) => s.length > 12);
}

function genericStubSignals(index: number): {
  signals: SignalSet;
  recommendedAction: RecommendedAction;
} {
  const confidence = (["low", "medium", "high"] as const)[index % 3];
  return {
    signals: {
      source: "Stub pipeline — no fixture match; generic placeholder.",
      reasoning: "Sentence-level split for demo when content is not in the fixture catalog.",
      assumptions: ["Claim boundaries are approximate.", "Signals are not fact-checked."],
      confidence,
      uncertainty: "Full Trace evaluation requires fixture-backed or LLM pipeline (Phase 6+).",
    },
    recommendedAction: confidence === "low" ? "verify" : index % 2 === 0 ? "trust" : "verify",
  };
}
