import type { CalibrationAnalytics } from "@/lib/calibration-analytics";

interface CalibrationStatsProps {
  stats: CalibrationAnalytics;
}

export function CalibrationStats({ stats }: CalibrationStatsProps) {
  if (stats.totalPredictions === 0) return null;

  return (
    <div className="rounded-lg border border-trace-border bg-trace-composer/40 px-3 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-trace-text-muted">
        Calibration stats (local)
      </p>
      <ul className="mt-2 space-y-1 text-xs text-trace-text-muted">
        <li>Predictions: {stats.totalPredictions}</li>
        <li>Revealed: {stats.totalRevealed}</li>
        {stats.alignmentRate !== null && (
          <li className="text-trace-trust">Aligned with Trace: {stats.alignmentRate}%</li>
        )}
      </ul>
    </div>
  );
}
