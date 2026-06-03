import { loadPersistedMessages } from "@/lib/persistence";
import type { PersistedTraceSession } from "@/types/session-storage";
import { EMPTY_SESSION } from "@/types/session-storage";

const SESSION_KEY = "trace-session-v2";

export function loadSession(): PersistedTraceSession {
  if (typeof window === "undefined") return EMPTY_SESSION;

  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedTraceSession;
      if (parsed?.version === 2 && Array.isArray(parsed.messages)) {
        return {
          ...EMPTY_SESSION,
          ...parsed,
          version: 2,
          messages: parsed.messages.filter(isValidMessage),
        };
      }
    }
  } catch {
    // fall through to migration
  }

  return migrateFromLegacyMessages();
}

function migrateFromLegacyMessages(): PersistedTraceSession {
  const legacy = loadPersistedMessages();
  if (!legacy?.length) return EMPTY_SESSION;

  return {
    ...EMPTY_SESSION,
    messages: legacy,
    updatedAt: new Date().toISOString(),
  };
}

function isValidMessage(m: unknown): boolean {
  if (!m || typeof m !== "object") return false;
  const msg = m as { id?: string; role?: string; content?: string };
  return (
    typeof msg.id === "string" &&
    (msg.role === "user" || msg.role === "assistant") &&
    typeof msg.content === "string"
  );
}

export function saveSession(session: PersistedTraceSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ ...session, version: 2, updatedAt: new Date().toISOString() }),
    );
  } catch {
    // quota / private mode
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}
