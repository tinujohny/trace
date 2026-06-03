import type { Message } from "@/types";

export type ChatStreamMode = "llm" | "stub";

export interface StreamChatResult {
  mode: ChatStreamMode;
  error?: string;
}

export async function streamChatReply(
  messages: Message[],
  model: string,
  onToken: (token: string) => void,
): Promise<StreamChatResult> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      model,
      stream: true,
    }),
  });

  if (!res.ok || !res.body) {
    return { mode: "stub", error: `Chat request failed (${res.status}).` };
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let mode: ChatStreamMode = "stub";
  let error: string | undefined;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const event = JSON.parse(line) as {
          type: string;
          content?: string;
          mode?: ChatStreamMode;
          message?: string;
        };

        if (event.type === "token" && event.content) onToken(event.content);
        if (event.type === "done" && event.mode) mode = event.mode;
        if (event.type === "error") error = event.message ?? "Chat stream error.";
      } catch {
        // skip malformed lines
      }
    }
  }

  return { mode, error };
}
