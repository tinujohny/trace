"use client";

import { isWellSourcedHighConfidence } from "@/lib/claim-trust";
import type { Claim } from "@/types";

interface ClaimPickerListProps {
  claims: Claim[];
  activeClaimId: string | null;
  onSelectClaim: (claimId: string) => void;
}

export function ClaimPickerList({
  claims,
  activeClaimId,
  onSelectClaim,
}: ClaimPickerListProps) {
  if (claims.length === 0) {
    return null;
  }

  return (
    <nav className="mb-4 space-y-1" aria-label="Claims in this reply">
      {claims.map((claim, index) => {
        const trusted = isWellSourcedHighConfidence(claim);
        const isActive = claim.id === activeClaimId;
        const truncated =
          claim.text.length > 56 ? `${claim.text.slice(0, 56)}…` : claim.text;

        return (
          <button
            key={claim.id}
            type="button"
            onClick={() => onSelectClaim(claim.id)}
            aria-pressed={isActive}
            className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition-colors ${
              isActive
                ? "border-trace-claim-border bg-trace-claim-active-bg text-trace-text"
                : "border-transparent bg-trace-composer/40 text-trace-text-muted hover:border-trace-border hover:bg-trace-composer"
            }`}
          >
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center text-sm font-bold leading-none ${
                trusted ? "text-trace-confidence-high" : "text-transparent"
              }`}
              aria-hidden={!trusted}
            >
              {trusted ? "✓" : "·"}
            </span>
            <span className="min-w-0 flex-1 leading-snug">
              <span className="font-medium text-trace-claim-border">Claim {index + 1}:</span>{" "}
              {truncated}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
