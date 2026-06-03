/** Generate a short unique id for messages and sessions. */
export function createId(prefix = "id"): string {
  return `${prefix}-${crypto.randomUUID()}`;
}
