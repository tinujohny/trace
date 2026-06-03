import { chunkTextForStream, pickFixtureReply } from "@/lib/chat/fixture-reply";
import { encodeStreamEvent } from "@/lib/chat/stream-events";
import { isOpenAiConfigured, isStubOnlyMode } from "@/lib/llm/config";
import { streamOpenAiChat } from "@/lib/llm/stream-openai";
import type { ChatMessage } from "@/lib/llm/openai-client";

const ASSISTANT_SYSTEM = `You are a helpful assistant in the Trace prototype.
Answer clearly in 2-5 sentences unless the user asks for more detail.
Use accurate, measured language. Do not invent citations.`;

interface ChatRequestBody {
  messages: ChatMessage[];
  model?: string;
  stream?: boolean;
}

function toApiMessages(messages: ChatMessage[]): ChatMessage[] {
  return [
    { role: "system", content: ASSISTANT_SYSTEM },
    ...messages.filter((m) => m.role === "user" || m.role === "assistant"),
  ];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  let body: ChatRequestBody;

  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { messages, model, stream = true } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages array is required." }, { status: 400 });
  }

  const useLlm = !isStubOnlyMode() && isOpenAiConfigured();

  if (!stream) {
    const content = useLlm
      ? await streamToString(toApiMessages(messages), model)
      : pickFixtureReply(messages);
    return Response.json({ content, mode: useLlm ? "llm" : "stub" });
  }

  const readable = new ReadableStream({
    async start(controller) {
      const send = (event: Parameters<typeof encodeStreamEvent>[0]) => {
        controller.enqueue(encodeStreamEvent(event));
      };

      try {
        if (useLlm) {
          await streamOpenAiChat(toApiMessages(messages), (token) => {
            send({ type: "token", content: token });
          }, model);
          send({ type: "done", mode: "llm" });
        } else {
          const content = pickFixtureReply(messages);
          for (const chunk of chunkTextForStream(content)) {
            send({ type: "token", content: chunk });
            await sleep(18);
          }
          send({ type: "done", mode: "stub" });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Chat stream failed.";
        send({
          type: "error",
          message: `${message} (using demo reply below — check API key and model in .env.local)`,
        });
        try {
          const fallback = pickFixtureReply(messages);
          for (const chunk of chunkTextForStream(fallback)) {
            send({ type: "token", content: chunk });
            await sleep(12);
          }
          send({ type: "done", mode: "stub" });
        } catch {
          // stream already closed via error event
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
    },
  });
}

async function streamToString(messages: ChatMessage[], model?: string): Promise<string> {
  let content = "";
  await streamOpenAiChat(messages, (token) => {
    content += token;
  }, model);
  return content;
}
