import { DEFAULT_TRACE_SETTINGS, type TraceSettings } from "@/types/settings";

const STORAGE_KEY = "trace-settings-v1";

export function loadSettings(): TraceSettings {
  if (typeof window === "undefined") return DEFAULT_TRACE_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TRACE_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<TraceSettings>;
    return {
      model: typeof parsed.model === "string" ? parsed.model : DEFAULT_TRACE_SETTINGS.model,
      calibrationDefault:
        typeof parsed.calibrationDefault === "boolean"
          ? parsed.calibrationDefault
          : DEFAULT_TRACE_SETTINGS.calibrationDefault,
    };
  } catch {
    return DEFAULT_TRACE_SETTINGS;
  }
}

export function persistSettings(settings: TraceSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}
