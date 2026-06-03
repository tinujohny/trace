"use client";

import { buildClaimSegments } from "@/lib/claim-segments";
import { isWellSourcedHighConfidence } from "@/lib/claim-trust";
import type { Claim } from "@/types";

export type ClaimCalibrationStatus = "none" | "predicted" | "revealed";

interface ClaimHighlightedTextProps {
  content: string;
  claims: Claim[];
  activeClaimId: string | null;
  onSelectClaim: (claimId: string) => void;
  getCalibrationStatus?: (claimId: string) => ClaimCalibrationStatus;
}

export function ClaimHighlightedText({
  content,
  claims,
  activeClaimId,
  onSelectClaim,
  getCalibrationStatus,
}: ClaimHighlightedTextProps) {
  const segments = buildClaimSegments(content, claims);

  return (
    <p className="whitespace-pre-wrap">
      {segments.map((segment, index) => {
        if (segment.type === "text") {
          return <span key={`t-${index}`}>{segment.text}</span>;
        }

        const { claim } = segment;
        const isActive = claim.id === activeClaimId;
        const calStatus = getCalibrationStatus?.(claim.id) ?? "none";
        const trusted = isWellSourcedHighConfidence(claim);

        return (
          <button
            key={claim.id}
            type="button"
            id={`claim-${claim.id}`}
            onClick={() => onSelectClaim(claim.id)}
            aria-pressed={isActive}
            aria-label={`Claim: ${claim.text}`}
            className={`mx-0.5 inline rounded-md border-b-2 px-0.5 text-left transition-colors ${
              isActive
                ? "border-trace-claim-border bg-trace-claim-active-bg ring-1 ring-trace-claim-border/50"
                : "border-trace-claim-border/50 bg-trace-claim-bg hover:border-trace-claim-border hover:bg-trace-claim-active-bg/60"
            } ${calStatus === "predicted" ? "border-dashed" : ""} ${
              calStatus === "revealed" ? "decoration-trace-trust/30" : ""
            }`}
          >
            {trusted && (
              <span
                className="relative top-[0.08em] mr-0.5 inline-block align-middle text-sm font-bold leading-none text-trace-confidence-high"
                aria-label="High confidence with source"
              >
                ✓
              </span>
            )}
            {claim.text}
            {calStatus === "predicted" && (
              <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-trace-verify align-middle" />
            )}
            {calStatus === "revealed" && (
              <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-trace-trust align-middle" />
            )}
          </button>
        );
      })}
    </p>
  );
}
