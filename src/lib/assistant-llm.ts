import { createId } from "@/lib/id";
import { openAiChatCompletion } from "@/lib/llm/openai-client";
import type { Message } from "@/types";

const ASSISTANT_SYSTEM = `You are a helpful assistant in the Trace prototype.
Answer clearly in 2-5 sentences unless the user asks for more detail.
Use accurate, measured language. Do not invent citations.`;

export async function fetchLlmAssistantReply(userText: string): Promise<Message> {
  const content = await openAiChatCompletion(
    [
      { role: "system", content: ASSISTANT_SYSTEM },
      { role: "user", content: userText },
    ],
    { maxTokens: 1024 },
  );

  return {
    id: createId("msg-a"),
    role: "assistant",
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };
}
