import {
  getEvaluateTimeoutMs,
  getLlmBaseUrl,
  getOpenAiApiKey,
  resolveModel,
} from "@/lib/llm/config";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAiChatResponse {
  choices?: Array<{
    message?: { content?: string };
  }>;
  error?: { message?: string };
}

export async function openAiChatCompletion(
  messages: ChatMessage[],
  options?: { jsonObject?: boolean; maxTokens?: number; model?: string },
): Promise<string> {
  const apiKey = getOpenAiApiKey();
  const timeoutMs = getEvaluateTimeoutMs();

  const body: Record<string, unknown> = {
    model: resolveModel(options?.model),
    messages,
    temperature: 0.2,
    max_tokens: options?.maxTokens ?? 4096,
  };

  if (options?.jsonObject) {
    body.response_format = { type: "json_object" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${getLlmBaseUrl()}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const data = (await res.json()) as OpenAiChatResponse;

    if (!res.ok) {
      throw new Error(data.error?.message ?? `OpenAI request failed (${res.status}).`);
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("OpenAI returned an empty response.");
    return content;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`OpenAI request timed out after ${timeoutMs}ms.`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
