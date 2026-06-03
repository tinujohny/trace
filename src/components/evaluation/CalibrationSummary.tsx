import type { MessageCalibrationSummary } from "@/hooks/useCalibration";

interface CalibrationSummaryProps {
  summary: MessageCalibrationSummary;
  onRevealAll?: () => void;
  canRevealAll?: boolean;
}

export function CalibrationSummary({
  summary,
  onRevealAll,
  canRevealAll,
}: CalibrationSummaryProps) {
  const { total, predicted, revealed, aligned } = summary;
  const complete = revealed === total && total > 0;

  return (
    <div className="rounded-lg border border-trace-border bg-trace-composer px-3 py-3">
      <p className="text-xs font-medium text-trace-text">Answer calibration</p>
      <ul className="mt-2 space-y-1 text-xs text-trace-text-muted">
        <li>
          Predicted: {predicted}/{total}
        </li>
        <li>
          Revealed: {revealed}/{total}
        </li>
        {complete && (
          <li className="text-trace-trust">
            Aligned with Trace: {aligned}/{total}
          </li>
        )}
      </ul>
      {canRevealAll && onRevealAll && (
        <button
          type="button"
          onClick={onRevealAll}
          className="mt-3 w-full rounded-lg border border-trace-border bg-trace-sidebar px-3 py-2 text-xs font-medium text-trace-text hover:bg-trace-surface-raised"
        >
          Reveal all evaluations
        </button>
      )}
    </div>
  );
}
