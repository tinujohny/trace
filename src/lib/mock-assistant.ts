import { fetchLlmAssistantReply } from "@/lib/assistant-llm";
import { isOpenAiConfigured, isStubOnlyMode } from "@/lib/llm/config";
import {
  FIXTURE_SESSION_CAFFEINE,
  FIXTURE_SESSION_SOLAR,
} from "@/fixtures";
import { createId } from "@/lib/id";
import type { Message } from "@/types";

const MOCK_DELAY_MS = 900;

type ReplyRule = {
  test: (text: string) => boolean;
  content: string;
};

const REPLY_RULES: ReplyRule[] = [
  {
    test: (t) => /coffee|caffeine|espresso|drink/i.test(t),
    content: getAssistantContent(FIXTURE_SESSION_CAFFEINE),
  },
  {
    test: (t) => /solar|renewable|grid|energy|power/i.test(t),
    content: getAssistantContent(FIXTURE_SESSION_SOLAR),
  },
];

const FALLBACK_REPLIES = [
  "That's an interesting question. In this prototype, try topics like daily coffee habits or whether solar can power most grids — those load full mock answers.",
  "I'm running in mock mode. Ask about coffee or solar energy to see a richer assistant reply from the fixture set.",
];

let fallbackIndex = 0;

function getAssistantContent(session: { messages: Message[] }): string {
  const assistant = session.messages.find((m) => m.role === "assistant");
  if (!assistant) throw new Error("Fixture session missing assistant message");
  return assistant.content;
}

function pickFixtureContent(userText: string): string {
  const rule = REPLY_RULES.find((r) => r.test(userText));
  if (rule) return rule.content;
  const reply = FALLBACK_REPLIES[fallbackIndex % FALLBACK_REPLIES.length];
  fallbackIndex += 1;
  return reply;
}

async function fetchFixtureAssistantReply(userText: string): Promise<Message> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  return {
    id: createId("msg-a"),
    role: "assistant",
    content: pickFixtureContent(userText),
    createdAt: new Date().toISOString(),
  };
}

/**
 * Assistant reply: live OpenAI when configured (Phase 6), else fixture mock.
 */
export async function fetchAssistantReply(userText: string): Promise<Message> {
  const useLlm = !isStubOnlyMode() && isOpenAiConfigured();

  if (useLlm) {
    try {
      return await fetchLlmAssistantReply(userText);
    } catch {
      return fetchFixtureAssistantReply(userText);
    }
  }

  return fetchFixtureAssistantReply(userText);
}

/** @deprecated Use fetchAssistantReply */
export const fetchMockAssistantReply = fetchAssistantReply;

export function getMockDelayMs(): number {
  return MOCK_DELAY_MS;
}
