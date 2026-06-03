"use client";

import { CalibrationFeedback } from "@/components/evaluation/CalibrationFeedback";
import { CalibrationPredict } from "@/components/evaluation/CalibrationPredict";
import { CalibrationSummary } from "@/components/evaluation/CalibrationSummary";
import { ClaimSignalsView } from "@/components/evaluation/ClaimSignalsView";
import { ClaimReviewEditor } from "@/components/review/ClaimReviewEditor";
import type { MessageCalibrationSummary } from "@/hooks/useCalibration";
import type { CalibrationChoice, CalibrationRecord, Claim } from "@/types";
import type { ClaimOverride } from "@/types/phase9";

interface SignalsPanelProps {
  claim: Claim | null;
  baseClaim?: Claim | null;
  messageClaims?: Claim[];
  calibrationEnabled: boolean;
  record?: CalibrationRecord;
  messageSummary?: MessageCalibrationSummary | null;
  claimOverride?: ClaimOverride;
  hasOverride?: boolean;
  onSaveOverride?: (patch: {
    signals?: Partial<Claim["signals"]>;
    recommendedAction?: Claim["recommendedAction"];
    reviewerNote?: string;
  }) => void;
  onClearOverride?: () => void;
  onPredict: (choice: CalibrationChoice) => void;
  onReveal: () => void;
  onRevealAll?: () => void;
  canRevealAll?: boolean;
  className?: string;
}

export function SignalsPanel({
  claim,
  baseClaim,
  messageClaims = [],
  calibrationEnabled,
  record,
  messageSummary,
  claimOverride,
  hasOverride,
  onSaveOverride,
  onClearOverride,
  onPredict,
  onReveal,
  onRevealAll,
  canRevealAll,
  className = "",
}: SignalsPanelProps) {
  const revealed = claim ? Boolean(record?.revealedAt) : false;
  const hasChoice = Boolean(record?.choice);

  return (
    <aside
      className={`flex h-full w-full shrink-0 flex-col border-l border-trace-border bg-trace-sidebar md:w-[var(--trace-eval-width)] ${className}`}
      aria-label="Claim evaluation"
      aria-hidden={!claim}
    >
      <div className="border-b border-trace-border px-4 py-3">
        <h2 className="text-sm font-medium text-trace-text" id="signals-panel-heading">
          Evaluation
        </h2>
        <p className="mt-0.5 text-xs text-trace-text-muted" aria-live="polite">
          {calibrationEnabled ? "Calibration mode — predict before reveal" : "Trace signals"}
        </p>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div
          className="flex-1 overflow-y-auto px-4 py-4"
          role="region"
          aria-labelledby="signals-panel-heading"
        >
          {!claim ? (
            <EmptyPanel calibrationEnabled={calibrationEnabled} />
          ) : (
            <ClaimPanelContent
              claim={claim}
              baseClaim={baseClaim ?? claim}
              calibrationEnabled={calibrationEnabled}
              record={record}
              revealed={revealed}
              hasChoice={hasChoice}
              claimOverride={claimOverride}
              hasOverride={hasOverride}
              onSaveOverride={onSaveOverride}
              onClearOverride={onClearOverride}
              onPredict={onPredict}
              onReveal={onReveal}
            />
          )}
        </div>

        {calibrationEnabled && messageSummary && messageClaims.length > 0 && (
          <div className="shrink-0 border-t border-trace-border px-4 py-3">
            <CalibrationSummary
              summary={messageSummary}
              onRevealAll={onRevealAll}
              canRevealAll={canRevealAll}
            />
          </div>
        )}
      </div>
    </aside>
  );
}

function EmptyPanel({ calibrationEnabled }: { calibrationEnabled: boolean }) {
  return (
    <div className="flex flex-col justify-center py-8">
      <p className="text-sm text-trace-text-muted">
        {calibrationEnabled
          ? "Select a claim, predict trust / verify / skip, then reveal Trace’s evaluation."
          : "Select a highlighted claim in the chat to inspect source, reasoning, assumptions, confidence, and uncertainty."}
      </p>
    </div>
  );
}

function ClaimPanelContent({
  claim,
  baseClaim,
  calibrationEnabled,
  record,
  revealed,
  hasChoice,
  claimOverride,
  hasOverride,
  onSaveOverride,
  onClearOverride,
  onPredict,
  onReveal,
}: {
  claim: Claim;
  baseClaim: Claim;
  calibrationEnabled: boolean;
  record?: CalibrationRecord;
  revealed: boolean;
  hasChoice: boolean;
  claimOverride?: ClaimOverride;
  hasOverride?: boolean;
  onSaveOverride?: (patch: {
    signals?: Partial<Claim["signals"]>;
    recommendedAction?: Claim["recommendedAction"];
    reviewerNote?: string;
  }) => void;
  onClearOverride?: () => void;
  onPredict: (choice: CalibrationChoice) => void;
  onReveal: () => void;
}) {
  const showSignals = !calibrationEnabled || revealed;

  return (
    <div className="space-y-5">
      <blockquote className="border-l-2 border-trace-claim-border pl-3 text-sm leading-snug text-trace-text">
        &ldquo;{claim.text}&rdquo;
      </blockquote>

      {calibrationEnabled && !revealed && (
        <>
          <CalibrationPredict
            onPredict={onPredict}
            selectedChoice={record?.choice ?? null}
          />
          {hasChoice && (
            <button
              type="button"
              onClick={onReveal}
              className="w-full rounded-lg bg-trace-accent px-3 py-2.5 text-sm font-medium text-white hover:opacity-90"
            >
              Reveal evaluation
            </button>
          )}
          {hasChoice && (
            <p className="text-center text-xs text-trace-text-muted">
              Signals stay hidden until you reveal
            </p>
          )}
        </>
      )}

      {calibrationEnabled && revealed && record?.choice && (
        <>
          <CalibrationFeedback choice={record.choice} claim={claim} />
          <div className="border-t border-trace-border pt-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-trace-text-muted">
              Trace signals
            </p>
            <ClaimSignalsView claim={claim} showOverrideBadge={hasOverride} />
            {onSaveOverride && onClearOverride && (
              <ClaimReviewEditor
                claim={baseClaim}
                override={claimOverride}
                onSave={onSaveOverride}
                onClear={onClearOverride}
              />
            )}
          </div>
        </>
      )}

      {!calibrationEnabled && showSignals && (
        <>
          <ClaimSignalsView claim={claim} showOverrideBadge={hasOverride} />
          {onSaveOverride && onClearOverride && (
            <ClaimReviewEditor
              claim={baseClaim}
              override={claimOverride}
              onSave={onSaveOverride}
              onClear={onClearOverride}
            />
          )}
        </>
      )}
    </div>
  );
}
