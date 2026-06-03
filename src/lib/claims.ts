import type { Claim, Message } from "@/types";

/** Extract claim text from message content using span offsets. */
export function sliceClaimText(content: string, span: { start: number; end: number }): string {
  return content.slice(span.start, span.end);
}

/** Attach derived `text` fields from parent message spans. */
export function hydrateClaims(message: Message, claims: Omit<Claim, "text">[]): Claim[] {
  return claims.map((partial) => {
    const text = sliceClaimText(message.content, partial.span);
    if (text.length === 0) {
      throw new Error(
        `Claim ${partial.id}: empty span [${partial.span.start}, ${partial.span.end})`,
      );
    }
    return { ...partial, text };
  });
}
