import {
  FIXTURE_SESSION_CAFFEINE,
  FIXTURE_SESSION_SOLAR,
} from "@/fixtures";
import type { Message } from "@/types";

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
  "That's an interesting question. In this prototype, try topics like daily coffee habits or whether solar can power most grids — those load full mock answers with claim evaluation.",
  "I'm running in stub mode. Ask about coffee or solar energy to see a richer assistant reply, or add OPENAI_API_KEY for live chat.",
];

let fallbackIndex = 0;

function getAssistantContent(session: { messages: Message[] }): string {
  const assistant = session.messages.find((m) => m.role === "assistant");
  if (!assistant) throw new Error("Fixture session missing assistant message");
  return assistant.content;
}

/** Pick stub assistant text from the latest user message in the thread. */
export function pickFixtureReply(messages: { role: string; content: string }[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const userText = lastUser?.content ?? "";
  const rule = REPLY_RULES.find((r) => r.test(userText));
  if (rule) return rule.content;
  const reply = FALLBACK_REPLIES[fallbackIndex % FALLBACK_REPLIES.length];
  fallbackIndex += 1;
  return reply;
}

/** Split text into stream chunks (words + trailing space). */
export function chunkTextForStream(text: string): string[] {
  const parts = text.match(/\S+\s*/g);
  return parts ?? [text];
}
