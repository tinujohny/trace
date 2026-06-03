"use client";

import { useEffect } from "react";
import type { Claim } from "@/types";

interface UseClaimKeyboardNavOptions {
  claims: Claim[];
  activeClaimId: string | null;
  onSelectClaim: (claimId: string) => void;
  onClear: () => void;
  enabled?: boolean;
}

/** Arrow keys / j k navigate claims; Escape clears selection. */
export function useClaimKeyboardNav({
  claims,
  activeClaimId,
  onSelectClaim,
  onClear,
  enabled = true,
}: UseClaimKeyboardNavOptions) {
  useEffect(() => {
    if (!enabled || claims.length === 0) return;

    const isTypingTarget = (target: EventTarget | null) =>
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLInputElement ||
      target instanceof HTMLSelectElement;

    const handler = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;

      const index = activeClaimId ? claims.findIndex((c) => c.id === activeClaimId) : -1;

      if (event.key === "Escape") {
        event.preventDefault();
        onClear();
        return;
      }

      const prevKeys = ["ArrowLeft", "ArrowUp", "k"];
      const nextKeys = ["ArrowRight", "ArrowDown", "j"];

      if (prevKeys.includes(event.key)) {
        event.preventDefault();
        if (index > 0) onSelectClaim(claims[index - 1].id);
        else if (index === -1 && claims.length > 0) onSelectClaim(claims[0].id);
        return;
      }

      if (nextKeys.includes(event.key)) {
        event.preventDefault();
        if (index >= 0 && index < claims.length - 1) onSelectClaim(claims[index + 1].id);
        else if (index === -1 && claims.length > 0) onSelectClaim(claims[0].id);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [claims, activeClaimId, onSelectClaim, onClear, enabled]);
}
