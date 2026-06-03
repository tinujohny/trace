"use client";

interface GroundingPanelProps {
  value: string;
  onChange: (value: string) => void;
  urlCount: number;
  disabled?: boolean;
}

export function GroundingPanel({ value, onChange, urlCount, disabled }: GroundingPanelProps) {
  return (
    <div className="space-y-2 rounded-lg border border-trace-border px-3 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-trace-text-muted">
        Grounding URLs
      </p>
      <p className="text-[10px] leading-relaxed text-trace-text-muted/80">
        One URL per line. Feeds the <span className="text-trace-text">source</span> signal on the
        next evaluation.
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={3}
        placeholder="https://example.com/article"
        className="w-full resize-none rounded-lg border border-trace-border bg-trace-composer px-2.5 py-2 text-xs text-trace-text placeholder:text-trace-text-muted/60 focus:border-trace-accent focus:outline-none disabled:opacity-50"
      />
      {urlCount > 0 && (
        <p className="text-[10px] text-trace-trust">{urlCount} URL{urlCount === 1 ? "" : "s"} active</p>
      )}
    </div>
  );
}
