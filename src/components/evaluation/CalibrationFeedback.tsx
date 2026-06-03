import { getCalibrationFeedback } from "@/lib/calibration-feedback";
import type { CalibrationChoice, Claim } from "@/types";

interface CalibrationFeedbackProps {
  choice: CalibrationChoice;
  claim: Claim;
}

export function CalibrationFeedback({ choice, claim }: CalibrationFeedbackProps) {
  const feedback = getCalibrationFeedback(choice, claim);

  return (
    <div
      className={`rounded-lg border px-3 py-3 ${
        feedback.match
          ? "border-trace-trust/40 bg-trace-trust-bg"
          : "border-trace-verify/40 bg-trace-verify-bg"
      }`}
    >
      <p
        className={`text-sm font-medium ${
          feedback.match ? "text-trace-trust" : "text-trace-verify"
        }`}
      >
        {feedback.title}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-trace-text">{feedback.detail}</p>
      <p className="mt-2 text-xs text-trace-text-muted">
        Trace recommends:{" "}
        <span className="font-medium capitalize text-trace-text">{claim.recommendedAction}</span>
      </p>
    </div>
  );
}
