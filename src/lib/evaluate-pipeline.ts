import { evaluateWithLlm } from "@/lib/evaluate-llm";
import { evaluateAssistantContent as evaluateWithStub } from "@/lib/evaluate-stub";
import { attachGroundingToClaims } from "@/lib/grounding";
import { getLlmModeLabel, isOpenAiConfigured, isStubOnlyMode } from "@/lib/llm/config";
import type { EvaluateResult } from "@/lib/evaluate-stub";

export type EvaluatePipelineMode = "llm" | "stub";

export function getEvaluatePipelineMode(): EvaluatePipelineMode {
  return getLlmModeLabel();
}

/**
 * Phase 6 pipeline: LLM evaluation when configured, else stub.
 * Retries once, then falls back to stub with an error note.
 */
function withGrounding(
  result: EvaluateResult,
  sourceUrls: string[],
): EvaluateResult {
  if (sourceUrls.length === 0 || result.evaluation.claims.length === 0) return result;
  return {
    ...result,
    evaluation: {
      ...result.evaluation,
      claims: attachGroundingToClaims(result.evaluation.claims, sourceUrls),
    },
  };
}

export async function evaluateAssistantContent(
  messageId: string,
  content: string,
  model?: string,
  sourceUrls: string[] = [],
): Promise<EvaluateResult & { pipeline: EvaluatePipelineMode }> {
  const useLlm = !isStubOnlyMode() && isOpenAiConfigured();

  if (!useLlm) {
    const result = withGrounding(evaluateWithStub(messageId, content), sourceUrls);
    return { ...result, pipeline: "stub" };
  }

  let lastError = "LLM evaluation failed.";

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = withGrounding(
        await evaluateWithLlm(messageId, content, model, sourceUrls),
        sourceUrls,
      );
      return { ...result, pipeline: "llm" };
    } catch (err) {
      lastError = err instanceof Error ? err.message : lastError;
    }
  }

  const stub = withGrounding(evaluateWithStub(messageId, content), sourceUrls);
  return {
    ...stub,
    ok: stub.ok,
    error: stub.ok
      ? `LLM unavailable (${lastError}); showing stub evaluation.`
      : lastError,
    pipeline: "stub",
  };
}
