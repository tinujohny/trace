import { buildGroundingPromptBlock } from "@/lib/grounding";
import { getMaxClaims } from "@/lib/llm/config";
import { openAiChatCompletion } from "@/lib/llm/openai-client";
import { parseLlmEvaluationJson } from "@/lib/llm/parse-evaluation";
import type { EvaluateResult } from "@/lib/evaluate-stub";

const EVALUATE_SYSTEM_PROMPT = `You are Trace, an evaluation engine for AI answers.
Given an assistant reply, extract atomic factual claims as verbatim substrings of the text.
For each claim output exactly five fields plus a recommended user action.

Rules:
- "text" MUST be copied exactly from the assistant message (character-for-character substring).
- Split into 3-8 proposition-level claims when possible.
- "confidence" is one of: low, medium, high.
- "recommendedAction" is one of: trust, verify, skip.
- "source" must cite model knowledge, reasoning steps, or say if no external source exists.
- Be honest in "uncertainty" about what could be wrong or unknown.
- Output valid JSON only, matching the schema given.`;

function buildEvaluateUserPrompt(
  content: string,
  maxClaims: number,
  sourceUrls: string[] = [],
): string {
  const grounding = buildGroundingPromptBlock(sourceUrls);
  return `${grounding}Assistant message to evaluate:

"""
${content}
"""

Return JSON:
{
  "claims": [
    {
      "text": "<verbatim substring>",
      "source": "<string>",
      "reasoning": "<string>",
      "assumptions": ["<string>"],
      "confidence": "low" | "medium" | "high",
      "uncertainty": "<string>",
      "recommendedAction": "trust" | "verify" | "skip"
    }
  ]
}

Maximum ${maxClaims} claims.`;
}

export async function evaluateWithLlm(
  messageId: string,
  content: string,
  model?: string,
  sourceUrls: string[] = [],
): Promise<EvaluateResult> {
  const trimmed = content.trim();
  if (!trimmed) {
    return {
      ok: false,
      error: "Message content is empty.",
      evaluation: { messageId, claims: [] },
    };
  }

  const maxClaims = getMaxClaims();

  const jsonText = await openAiChatCompletion(
    [
      { role: "system", content: EVALUATE_SYSTEM_PROMPT },
      { role: "user", content: buildEvaluateUserPrompt(trimmed, maxClaims, sourceUrls) },
    ],
    { jsonObject: true, maxTokens: 4096, model },
  );

  const evaluation = parseLlmEvaluationJson(messageId, trimmed, jsonText, maxClaims);

  return { ok: true, evaluation };
}
