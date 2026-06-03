"use client";

import { TRACE_MODEL_OPTIONS, type TraceSettings } from "@/types/settings";

interface SettingsPanelProps {
  settings: TraceSettings;
  onChange: (patch: Partial<TraceSettings>) => void;
  assistantMode: "llm" | "stub";
  provider?: "openai" | "groq";
  availableModels?: string[];
  disabled?: boolean;
}

export function SettingsPanel({
  settings,
  onChange,
  assistantMode,
  provider = "openai",
  availableModels,
  disabled,
}: SettingsPanelProps) {
  const modelOptions =
    availableModels && availableModels.length > 0
      ? availableModels.map((id) => ({
          id,
          label: provider === "groq" ? id.replace(/-/g, " ") : TRACE_MODEL_OPTIONS.find((o) => o.id === id)?.label ?? id,
        }))
      : TRACE_MODEL_OPTIONS.map((o) => ({ id: o.id, label: o.label }));

  return (
    <div className="space-y-3 rounded-lg border border-trace-border px-3 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-trace-text-muted">
        Settings
      </p>

      <label className="block">
        <span className="text-xs text-trace-text-muted">Model</span>
        <select
          value={settings.model}
          onChange={(e) => onChange({ model: e.target.value })}
          disabled={disabled || assistantMode === "stub"}
          className="mt-1 w-full rounded-lg border border-trace-border bg-trace-composer px-2 py-2 text-sm text-trace-text focus:border-trace-accent focus:outline-none disabled:opacity-50"
        >
          {modelOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
        {assistantMode === "stub" ? (
          <span className="mt-1 block text-[10px] text-trace-text-muted">
            Add OPENAI_API_KEY (or Groq key) to .env.local, then restart{" "}
            <code className="text-trace-text">npm run dev</code>.
          </span>
        ) : (
          <span className="mt-1 block text-[10px] text-trace-trust">
            Live chat via {provider === "groq" ? "Groq" : "OpenAI"}.
          </span>
        )}
      </label>

      <label className="flex cursor-pointer items-center justify-between gap-3">
        <div>
          <span className="text-sm text-trace-text">Default calibration</span>
          <p className="text-xs text-trace-text-muted">On for new chats</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={settings.calibrationDefault}
          disabled={disabled}
          onClick={() => onChange({ calibrationDefault: !settings.calibrationDefault })}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
            settings.calibrationDefault ? "bg-trace-accent" : "bg-trace-send-disabled"
          } disabled:opacity-50`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
              settings.calibrationDefault ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </label>
    </div>
  );
}
