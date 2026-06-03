"use client";

import type { Claim } from "@/types";

interface ClaimNavigatorProps {
  claims: Claim[];
  activeClaim: Claim;
  onSelectClaim: (claimId: string) => void;
  onClear: () => void;
}

export function ClaimNavigator({
  claims,
  activeClaim,
  onSelectClaim,
  onClear,
}: ClaimNavigatorProps) {
  const index = claims.findIndex((c) => c.id === activeClaim.id);
  const hasPrev = index > 0;
  const hasNext = index >= 0 && index < claims.length - 1;

  return (
    <nav
      className="shrink-0 border-b border-trace-border bg-trace-composer/50 px-4 py-2"
      aria-label="Claim navigation"
    >
      <div className="mx-auto flex max-w-[var(--trace-thread-max)] items-center justify-between gap-3">
        <p className="min-w-0 truncate text-xs text-trace-text-muted" id="claim-nav-status">
          <span className="font-medium text-trace-claim-border">
            Claim {index + 1}/{claims.length}
          </span>
          {" · "}
          {activeClaim.text}
        </p>
        <div className="flex shrink-0 items-center gap-1" role="group" aria-label="Claim controls">
          <button
            type="button"
            onClick={() => hasPrev && onSelectClaim(claims[index - 1].id)}
            disabled={!hasPrev}
            aria-label="Previous claim"
            className="rounded-md px-2 py-1 text-xs text-trace-text-muted hover:bg-trace-surface-raised disabled:opacity-40"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => hasNext && onSelectClaim(claims[index + 1].id)}
            disabled={!hasNext}
            aria-label="Next claim"
            className="rounded-md px-2 py-1 text-xs text-trace-text-muted hover:bg-trace-surface-raised disabled:opacity-40"
          >
            Next
          </button>
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear claim selection"
            className="rounded-md px-2 py-1 text-xs text-trace-text-muted hover:bg-trace-surface-raised"
          >
            Clear
          </button>
        </div>
      </div>
      <p className="sr-only">
        Use arrow keys or j and k to move between claims. Press Escape to clear selection.
      </p>
    </nav>
  );
}
