import {
  CONFIDENCE_LABELS,
  confidenceBarClass,
  confidenceLevelIndex,
  confidenceTextClass,
} from "@/lib/confidence";
import type { ConfidenceLevel } from "@/types";

interface ConfidenceMeterProps {
  level: ConfidenceLevel;
}

export function ConfidenceMeter({ level }: ConfidenceMeterProps) {
  const filled = confidenceLevelIndex[level];

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-trace-text-muted">Confidence</span>
        <span className={`text-xs font-semibold uppercase ${confidenceTextClass[level]}`}>
          {CONFIDENCE_LABELS[level]}
        </span>
      </div>
      <div className="mt-2 flex gap-1.5" role="meter" aria-valuenow={filled} aria-valuemin={1} aria-valuemax={3}>
        {([1, 2, 3] as const).map((step) => (
          <div
            key={step}
            className={`h-2 flex-1 rounded-full transition-colors ${
              step <= filled ? confidenceBarClass[level] : "bg-trace-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
