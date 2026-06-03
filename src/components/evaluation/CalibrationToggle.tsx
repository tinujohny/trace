"use client";

interface CalibrationToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function CalibrationToggle({ enabled, onChange }: CalibrationToggleProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-trace-border px-3 py-2.5">
      <div>
        <span className="text-sm text-trace-text">Calibration mode</span>
        <p className="text-xs text-trace-text-muted">Predict before signals show</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          enabled ? "bg-trace-accent" : "bg-trace-send-disabled"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}
