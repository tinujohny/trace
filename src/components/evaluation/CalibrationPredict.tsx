"use client";

import type { CalibrationChoice } from "@/types";

const CHOICES: { value: CalibrationChoice; label: string; description: string }[] = [
  { value: "trust", label: "Trust", description: "Accept without checking" },
  { value: "verify", label: "Verify", description: "Check sources or facts" },
  { value: "skip", label: "Skip", description: "Not relevant or unsure" },
];

const choiceButtonClass: Record<CalibrationChoice, string> = {
  trust: "border-trace-trust/50 hover:bg-trace-trust-bg text-trace-trust",
  verify: "border-trace-verify/50 hover:bg-trace-verify-bg text-trace-verify",
  skip: "border-trace-skip/50 hover:bg-trace-skip-bg text-trace-skip",
};

interface CalibrationPredictProps {
  onPredict: (choice: CalibrationChoice) => void;
  selectedChoice?: CalibrationChoice | null;
}

export function CalibrationPredict({ onPredict, selectedChoice }: CalibrationPredictProps) {
  return (
    <div className="space-y-3" role="group" aria-label="Predict your action for this claim">
      <p className="text-sm text-trace-text" id="calibration-predict-prompt">
        What would you do with this claim?
      </p>
      <div className="flex flex-col gap-2" aria-labelledby="calibration-predict-prompt">
        {CHOICES.map(({ value, label, description }) => {
          const selected = selectedChoice === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onPredict(value)}
              aria-pressed={selected}
              className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${choiceButtonClass[value]} ${
                selected ? "ring-1 ring-current" : ""
              }`}
            >
              <span className="text-sm font-medium">{label}</span>
              <span className="mt-0.5 block text-xs opacity-80">{description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
