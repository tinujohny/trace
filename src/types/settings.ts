export interface TraceSettings {
  /** OpenAI model id for assistant + evaluate when LLM mode is active. */
  model: string;
  /** Start new chats with calibration mode enabled. */
  calibrationDefault: boolean;
}

export const DEFAULT_TRACE_SETTINGS: TraceSettings = {
  model: "gpt-4o-mini",
  calibrationDefault: false,
};

export const TRACE_MODEL_OPTIONS = [
  { id: "gpt-4o-mini", label: "GPT-4o mini" },
  { id: "gpt-4o", label: "GPT-4o" },
  { id: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
] as const;
