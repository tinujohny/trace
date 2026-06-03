import type { MessageEvaluation } from "@/types";

export interface EvaluateRequestBody {
  messageId: string;
  content: string;
  model?: string;
  /** Reference URLs to ground the source signal (Phase 9). */
  sourceUrls?: string[];
}

export interface EvaluateResponseBody {
  messageId: string;
  claims: MessageEvaluation["claims"];
  pipeline?: "llm" | "stub";
  error?: string;
}

export async function fetchEvaluation(
  messageId: string,
  content: string,
  model?: string,
  sourceUrls?: string[],
): Promise<EvaluateResponseBody> {
  const res = await fetch("/api/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messageId,
      content,
      model,
      sourceUrls,
    } satisfies EvaluateRequestBody),
  });

  if (!res.ok) {
    return {
      messageId,
      claims: [],
      error: `Evaluation request failed (${res.status}).`,
    };
  }

  return (await res.json()) as EvaluateResponseBody;
}
