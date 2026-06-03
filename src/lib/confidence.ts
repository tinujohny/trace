import type { ConfidenceLevel } from "@/types";

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const confidenceTextClass: Record<ConfidenceLevel, string> = {
  low: "text-trace-confidence-low",
  medium: "text-trace-confidence-medium",
  high: "text-trace-confidence-high",
};

export const confidenceBarClass: Record<ConfidenceLevel, string> = {
  low: "bg-trace-confidence-low",
  medium: "bg-trace-confidence-medium",
  high: "bg-trace-confidence-high",
};

export const confidenceLevelIndex: Record<ConfidenceLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
};
