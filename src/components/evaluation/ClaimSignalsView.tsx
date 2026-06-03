import { ConfidenceMeter } from "@/components/evaluation/ConfidenceMeter";
import { SignalSection } from "@/components/evaluation/SignalSection";
import type { Claim } from "@/types";

function GroundingLinks({ urls }: { urls: string[] }) {
  return (
    <ul className="mt-2 flex flex-col gap-1">
      {urls.map((url) => (
        <li key={url}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-xs text-trace-trust hover:underline"
          >
            {url}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function ClaimSignalsView({
  claim,
  showOverrideBadge,
}: {
  claim: Claim;
  showOverrideBadge?: boolean;
}) {
  const { signals } = claim;

  return (
    <div className="space-y-5">
      <blockquote className="border-l-2 border-trace-claim-border pl-3 text-sm leading-snug text-trace-text">
        &ldquo;{claim.text}&rdquo;
      </blockquote>

      {showOverrideBadge && (
        <p className="text-[10px] font-medium uppercase tracking-wide text-trace-verify">
          Reviewer override applied
        </p>
      )}

      <ConfidenceMeter level={signals.confidence} />

      <SignalSection title="Source">
        <p className="whitespace-pre-wrap text-trace-text-muted">{signals.source}</p>
        {claim.groundingUrls && claim.groundingUrls.length > 0 && (
          <GroundingLinks urls={claim.groundingUrls} />
        )}
      </SignalSection>

      <SignalSection title="Reasoning">
        <p className="text-trace-text-muted">{signals.reasoning}</p>
      </SignalSection>

      <SignalSection title="Assumptions">
        {signals.assumptions.length === 0 ? (
          <p className="text-trace-text-muted">None listed.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {signals.assumptions.map((assumption, index) => (
              <li
                key={`${claim.id}-a-${index}`}
                className="rounded-lg bg-trace-composer px-3 py-2 text-xs leading-relaxed text-trace-text-muted"
              >
                {assumption}
              </li>
            ))}
          </ul>
        )}
      </SignalSection>

      <SignalSection title="Uncertainty">
        <p className="rounded-lg bg-trace-composer px-3 py-2 text-sm text-trace-text-muted">
          {signals.uncertainty}
        </p>
      </SignalSection>
    </div>
  );
}
