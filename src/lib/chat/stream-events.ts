export type ChatStreamEvent =
  | { type: "token"; content: string }
  | { type: "done"; mode: "llm" | "stub" }
  | { type: "error"; message: string };

export function encodeStreamEvent(event: ChatStreamEvent): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(event)}\n`);
}
