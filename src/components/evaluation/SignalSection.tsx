import type { ReactNode } from "react";

interface SignalSectionProps {
  title: string;
  children: ReactNode;
}

export function SignalSection({ title, children }: SignalSectionProps) {
  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-trace-text-muted">
        {title}
      </h3>
      <div className="mt-2 text-sm leading-relaxed text-trace-text">{children}</div>
    </section>
  );
}
