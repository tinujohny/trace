import type { TextSpan } from "@/types";

/** Locate an exact substring in content; throws if missing or ambiguous. */
export function spanOf(content: string, substring: string): TextSpan {
  const start = content.indexOf(substring);
  if (start === -1) {
    throw new Error(`Fixture span: substring not found — "${substring.slice(0, 48)}…"`);
  }
  const end = start + substring.length;
  if (content.indexOf(substring, start + 1) !== -1) {
    throw new Error(`Fixture span: ambiguous substring — "${substring.slice(0, 48)}…"`);
  }
  return { start, end };
}
