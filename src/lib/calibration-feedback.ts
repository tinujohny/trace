import type { CalibrationChoice, Claim } from "@/types";

export interface CalibrationFeedback {
  match: boolean;
  title: string;
  detail: string;
}

const CHOICE_LABELS: Record<CalibrationChoice, string> = {
  trust: "Trust",
  verify: "Verify",
  skip: "Skip",
};

export function getCalibrationFeedback(
  choice: CalibrationChoice,
  claim: Claim,
): CalibrationFeedback {
  const recommended = claim.recommendedAction;
  const match = choice === recommended;
  const choiceLabel = CHOICE_LABELS[choice];
  const recommendedLabel = CHOICE_LABELS[recommended];

  if (match) {
    return {
      match: true,
      title: "Aligned with Trace",
      detail: `You chose ${choiceLabel} — Trace agrees (${recommendedLabel}).`,
    };
  }

  let detail = `You chose ${choiceLabel} — Trace suggests ${recommendedLabel}.`;

  if (choice === "trust" && claim.signals.confidence === "low") {
    detail = `You chose Trust — Trace suggests ${recommendedLabel} (low confidence on this claim).`;
  } else if (choice === "verify" && recommended === "trust") {
    detail = `You chose Verify — Trace suggests ${recommendedLabel} (higher confidence).`;
  }

  return {
    match: false,
    title: "Differs from Trace",
    detail,
  };
}
