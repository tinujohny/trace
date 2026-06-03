"use client";

import Link from "next/link";
import { CalibrationToggle } from "@/components/evaluation/CalibrationToggle";
import { GroundingPanel } from "@/components/grounding/GroundingPanel";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { PlusIcon, TraceLogo } from "@/components/icons/ChatIcons";
import { CalibrationStats } from "@/components/session/CalibrationStats";
import { SessionExport } from "@/components/session/SessionExport";
import type { CalibrationAnalytics } from "@/lib/calibration-analytics";
import type { ExportSessionInput } from "@/lib/export-session";
import type { TraceSettings } from "@/types/settings";

interface ChatSidebarProps {
  onNewChat: () => void;
  disabled?: boolean;
  calibrationEnabled: boolean;
  onCalibrationChange: (enabled: boolean) => void;
  settings: TraceSettings;
  onSettingsChange: (patch: Partial<TraceSettings>) => void;
  assistantMode?: "llm" | "stub";
  evaluateMode?: "llm" | "stub";
  llmProvider?: "openai" | "groq";
  availableModels?: string[];
  exportSession?: ExportSessionInput;
  calibrationStats?: CalibrationAnalytics;
  groundingInput?: string;
  onGroundingChange?: (value: string) => void;
  groundingUrlCount?: number;
  className?: string;
}

export function ChatSidebar({
  onNewChat,
  disabled,
  calibrationEnabled,
  onCalibrationChange,
  settings,
  onSettingsChange,
  assistantMode = "stub",
  evaluateMode = "stub",
  llmProvider = "openai",
  availableModels = [],
  exportSession,
  calibrationStats,
  groundingInput = "",
  onGroundingChange,
  groundingUrlCount = 0,
  className = "",
}: ChatSidebarProps) {
  return (
    <aside
      className={`flex h-full w-[var(--trace-sidebar-width)] shrink-0 flex-col bg-trace-sidebar ${className}`}
      aria-label="Chat sidebar"
    >
      <div className="flex items-center gap-2 px-3 py-3">
        <TraceLogo className="text-trace-text" />
        <span className="text-sm font-semibold text-trace-text">Trace</span>
      </div>

      <div className="space-y-2 overflow-y-auto px-2">
        <button
          type="button"
          onClick={onNewChat}
          disabled={disabled}
          className="flex w-full items-center gap-3 rounded-lg border border-trace-border px-3 py-2.5 text-sm text-trace-text transition-colors hover:bg-trace-surface-raised disabled:opacity-50"
        >
          <PlusIcon className="shrink-0" />
          New chat
        </button>

        <Link
          href="/batch"
          className="block rounded-lg border border-trace-border px-3 py-2.5 text-sm text-trace-text transition-colors hover:bg-trace-surface-raised"
        >
          Batch evaluation →
        </Link>

        {onGroundingChange && (
          <GroundingPanel
            value={groundingInput}
            onChange={onGroundingChange}
            urlCount={groundingUrlCount}
            disabled={disabled}
          />
        )}

        <CalibrationToggle enabled={calibrationEnabled} onChange={onCalibrationChange} />

        <SettingsPanel
          settings={settings}
          onChange={onSettingsChange}
          assistantMode={assistantMode}
          provider={llmProvider}
          availableModels={availableModels}
          disabled={disabled}
        />

        {exportSession && <SessionExport session={exportSession} disabled={disabled} />}

        {calibrationStats && <CalibrationStats stats={calibrationStats} />}
      </div>

      <div className="mt-auto border-t border-trace-border p-3">
        <p className="text-xs text-trace-text-muted">
          Assistant: <span className="text-trace-text">{assistantMode}</span>
          {" · "}
          Evaluate: <span className="text-trace-text">{evaluateMode}</span>
        </p>
        <p className="mt-1 text-[10px] leading-relaxed text-trace-text-muted/80">
          Phase 9 — grounding, review, batch, API
        </p>
        <a
          href="/api/v1/trace"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block text-[10px] text-trace-trust hover:underline"
        >
          API manifest
        </a>
      </div>
    </aside>
  );
}
