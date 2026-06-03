import {
  getEvaluateTimeoutMs,
  getLlmBaseUrl,
  getOpenAiApiKey,
  resolveModel,
} from "@/lib/llm/config";
import type { ChatMessage } from "@/lib/llm/openai-client";

export async function streamOpenAiChat(
  messages: ChatMessage[],
  onToken: (token: string) => void,
  model?: string,
): Promise<void> {
  const apiKey = getOpenAiApiKey();
  const timeoutMs = getEvaluateTimeoutMs();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${getLlmBaseUrl()}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: resolveModel(model),
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 1024,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = (await res.json()) as { error?: { message?: string } };
      throw new Error(err.error?.message ?? `OpenAI request failed (${res.status}).`);
    }

    if (!res.body) throw new Error("OpenAI returned an empty stream.");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") continue;

        try {
          const parsed = JSON.parse(payload) as {
            choices?: Array<{ delta?: { content?: string } }>;
          };
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) onToken(delta);
        } catch {
          // skip malformed SSE chunks
        }
      }
    }
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`OpenAI stream timed out after ${timeoutMs}ms.`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
