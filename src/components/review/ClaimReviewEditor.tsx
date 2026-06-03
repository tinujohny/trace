"use client";

import { useEffect, useState } from "react";
import type { Claim, ConfidenceLevel, RecommendedAction } from "@/types";
import type { ClaimOverride } from "@/types/phase9";
import { ACTION_OPTIONS, CONFIDENCE_OPTIONS } from "@/types/phase9";

interface ClaimReviewEditorProps {
  claim: Claim;
  override?: ClaimOverride;
  onSave: (patch: {
    signals?: Partial<Claim["signals"]>;
    recommendedAction?: RecommendedAction;
    reviewerNote?: string;
  }) => void;
  onClear: () => void;
}

export function ClaimReviewEditor({ claim, override, onSave, onClear }: ClaimReviewEditorProps) {
  const [source, setSource] = useState(claim.signals.source);
  const [reasoning, setReasoning] = useState(claim.signals.reasoning);
  const [uncertainty, setUncertainty] = useState(claim.signals.uncertainty);
  const [confidence, setConfidence] = useState<ConfidenceLevel>(claim.signals.confidence);
  const [action, setAction] = useState<RecommendedAction>(claim.recommendedAction);
  const [note, setNote] = useState(override?.reviewerNote ?? "");

  useEffect(() => {
    const base = override
      ? {
          source: override.signals?.source ?? claim.signals.source,
          reasoning: override.signals?.reasoning ?? claim.signals.reasoning,
          uncertainty: override.signals?.uncertainty ?? claim.signals.uncertainty,
          confidence: override.signals?.confidence ?? claim.signals.confidence,
          action: override.recommendedAction ?? claim.recommendedAction,
        }
      : {
          source: claim.signals.source,
          reasoning: claim.signals.reasoning,
          uncertainty: claim.signals.uncertainty,
          confidence: claim.signals.confidence,
          action: claim.recommendedAction,
        };
    setSource(base.source);
    setReasoning(base.reasoning);
    setUncertainty(base.uncertainty);
    setConfidence(base.confidence);
    setAction(base.action);
    setNote(override?.reviewerNote ?? "");
  }, [claim.id, claim, override]);

  return (
    <div className="space-y-3 rounded-lg border border-trace-verify/30 bg-trace-verify-bg/20 px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-trace-verify">
          Human review
        </p>
        {override && (
          <span className="rounded-full bg-trace-verify/20 px-2 py-0.5 text-[10px] text-trace-verify">
            Overridden
          </span>
        )}
      </div>

      <label className="block text-[10px] text-trace-text-muted">
        Source
        <textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          rows={2}
          className="mt-1 w-full resize-none rounded border border-trace-border bg-trace-composer px-2 py-1.5 text-xs text-trace-text"
        />
      </label>

      <label className="block text-[10px] text-trace-text-muted">
        Reasoning
        <textarea
          value={reasoning}
          onChange={(e) => setReasoning(e.target.value)}
          rows={2}
          className="mt-1 w-full resize-none rounded border border-trace-border bg-trace-composer px-2 py-1.5 text-xs text-trace-text"
        />
      </label>

      <label className="block text-[10px] text-trace-text-muted">
        Uncertainty
        <textarea
          value={uncertainty}
          onChange={(e) => setUncertainty(e.target.value)}
          rows={2}
          className="mt-1 w-full resize-none rounded border border-trace-border bg-trace-composer px-2 py-1.5 text-xs text-trace-text"
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="block text-[10px] text-trace-text-muted">
          Confidence
          <select
            value={confidence}
            onChange={(e) => setConfidence(e.target.value as ConfidenceLevel)}
            className="mt-1 w-full rounded border border-trace-border bg-trace-composer px-2 py-1.5 text-xs text-trace-text"
          >
            {CONFIDENCE_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[10px] text-trace-text-muted">
          Recommended
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as RecommendedAction)}
            className="mt-1 w-full rounded border border-trace-border bg-trace-composer px-2 py-1.5 text-xs text-trace-text"
          >
            {ACTION_OPTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-[10px] text-trace-text-muted">
        Reviewer note (optional)
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-1 w-full rounded border border-trace-border bg-trace-composer px-2 py-1.5 text-xs text-trace-text"
        />
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() =>
            onSave({
              signals: { source, reasoning, uncertainty, confidence },
              recommendedAction: action,
              reviewerNote: note.trim() || undefined,
            })
          }
          className="flex-1 rounded-lg bg-trace-accent px-3 py-2 text-xs font-medium text-white hover:opacity-90"
        >
          Save override
        </button>
        {override && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg border border-trace-border px-3 py-2 text-xs text-trace-text-muted hover:bg-trace-composer"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
