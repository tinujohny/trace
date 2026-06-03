import { hydrateClaims } from "@/lib/claims";
import { spanOf } from "@/lib/spans";
import type {
  CalibrationChoice,
  Claim,
  ConfidenceLevel,
  Message,
  MessageEvaluation,
  RecommendedAction,
} from "@/types";

interface LlmClaimRaw {
  text?: string;
  source?: string;
  reasoning?: string;
  assumptions?: string[];
  confidence?: string;
  uncertainty?: string;
  recommendedAction?: string;
}

interface LlmEvaluationRaw {
  claims?: LlmClaimRaw[];
}

const CONFIDENCE_LEVELS: ConfidenceLevel[] = ["low", "medium", "high"];
const ACTIONS: RecommendedAction[] = ["trust", "verify", "skip"];

export function parseLlmEvaluationJson(
  messageId: string,
  assistantContent: string,
  jsonText: string,
  maxClaims: number,
): MessageEvaluation {
  let parsed: LlmEvaluationRaw;
  try {
    parsed = JSON.parse(jsonText) as LlmEvaluationRaw;
  } catch {
    throw new Error("LLM returned invalid JSON.");
  }

  if (!Array.isArray(parsed.claims)) {
    throw new Error("LLM JSON missing claims array.");
  }

  const message: Message = {
    id: messageId,
    role: "assistant",
    content: assistantContent,
    createdAt: new Date().toISOString(),
  };

  const drafts: Omit<Claim, "text">[] = [];

  for (const raw of parsed.claims.slice(0, maxClaims)) {
    const text = raw.text?.trim();
    if (!text) continue;

    let span;
    try {
      span = spanOf(assistantContent, text);
    } catch {
      const fuzzy = findFuzzySpan(assistantContent, text);
      if (!fuzzy) continue;
      span = fuzzy;
    }

    drafts.push({
      id: `${messageId}-llm-${drafts.length}`,
      messageId,
      span,
      signals: {
        source: raw.source?.trim() || "Not specified by model.",
        reasoning: raw.reasoning?.trim() || "Not specified by model.",
        assumptions: Array.isArray(raw.assumptions)
          ? raw.assumptions.filter((a) => typeof a === "string" && a.trim()).map((a) => a.trim())
          : [],
        confidence: parseConfidence(raw.confidence),
        uncertainty: raw.uncertainty?.trim() || "Not specified by model.",
      },
      recommendedAction: parseAction(raw.recommendedAction),
    });
  }

  if (drafts.length === 0) {
    throw new Error("No claims could be aligned to the assistant text.");
  }

  return { messageId, claims: hydrateClaims(message, drafts) };
}

function parseConfidence(value: string | undefined): ConfidenceLevel {
  const v = value?.toLowerCase().trim();
  if (CONFIDENCE_LEVELS.includes(v as ConfidenceLevel)) return v as ConfidenceLevel;
  return "medium";
}

function parseAction(value: string | undefined): RecommendedAction {
  const v = value?.toLowerCase().trim();
  if (ACTIONS.includes(v as CalibrationChoice)) return v as RecommendedAction;
  return "verify";
}

/** Try to locate claim text when the model paraphrased slightly. */
function findFuzzySpan(content: string, claimText: string): { start: number; end: number } | null {
  const words = claimText.split(/\s+/).filter((w) => w.length > 3);
  if (words.length < 2) return null;

  const first = words[0];
  const last = words[words.length - 1];
  const start = content.indexOf(first);
  if (start === -1) return null;

  const endSearch = content.indexOf(last, start);
  if (endSearch === -1) return null;

  const end = endSearch + last.length;
  const slice = content.slice(start, end);
  if (slice.length < 12) return null;
  return { start, end };
}
