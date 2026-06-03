/** Server-side LLM configuration from environment (never expose API keys to the client). */

export type LlmProvider = "openai" | "groq";

export const ALLOWED_OPENAI_MODELS = ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"] as const;
export const ALLOWED_GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
] as const;

export function getLlmProvider(): LlmProvider {
  const key = process.env.OPENAI_API_KEY?.trim() ?? "";
  if (key.startsWith("gsk_")) return "groq";
  return "openai";
}

export function isOpenAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function getOpenAiApiKey(): string {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) throw new Error("OPENAI_API_KEY is not set.");
  return key;
}

/** OpenAI-compatible API base (OpenAI or Groq). */
export function getLlmBaseUrl(): string {
  const explicit = process.env.OPENAI_BASE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  return getLlmProvider() === "groq"
    ? "https://api.groq.com/openai/v1"
    : "https://api.openai.com/v1";
}

export function getAvailableModels(): readonly string[] {
  return getLlmProvider() === "groq" ? ALLOWED_GROQ_MODELS : ALLOWED_OPENAI_MODELS;
}

export function getDefaultModel(): string {
  return getLlmProvider() === "groq" ? "llama-3.3-70b-versatile" : "gpt-4o-mini";
}

export function getOpenAiModel(): string {
  const envModel = process.env.OPENAI_MODEL?.trim();
  if (!envModel) return getDefaultModel();
  if (getLlmProvider() === "groq" && envModel.startsWith("gpt-")) {
    return getDefaultModel();
  }
  return envModel;
}

export function resolveModel(requested?: string): string {
  const allowed = getAvailableModels();
  if (requested && (allowed as readonly string[]).includes(requested)) {
    return requested;
  }
  const envModel = getOpenAiModel();
  if ((allowed as readonly string[]).includes(envModel)) return envModel;
  return getDefaultModel();
}

export function getEvaluateTimeoutMs(): number {
  const raw = process.env.TRACE_EVALUATE_TIMEOUT_MS;
  const n = raw ? Number.parseInt(raw, 10) : 45_000;
  return Number.isFinite(n) && n > 0 ? n : 45_000;
}

export function getMaxClaims(): number {
  const raw = process.env.TRACE_MAX_CLAIMS;
  const n = raw ? Number.parseInt(raw, 10) : 10;
  return Number.isFinite(n) && n > 0 ? Math.min(n, 15) : 10;
}

export function isStubOnlyMode(): boolean {
  return process.env.TRACE_EVALUATE_MODE === "stub";
}

export function getLlmModeLabel(): "llm" | "stub" {
  if (isStubOnlyMode() || !isOpenAiConfigured()) return "stub";
  return "llm";
}
