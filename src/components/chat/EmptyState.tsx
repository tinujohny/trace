"use client";

const SUGGESTIONS = [
  "Is it okay to drink several cups of coffee every day?",
  "Can solar alone power most countries soon?",
];

interface EmptyStateProps {
  onSuggestionClick?: (text: string) => void;
}

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 pb-8">
      <h2 className="text-2xl font-medium text-trace-text">What can I help with?</h2>
      <div className="mt-8 grid w-full max-w-[var(--trace-thread-max)] gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((text) => (
          <button
            key={text}
            type="button"
            onClick={() => onSuggestionClick?.(text)}
            disabled={!onSuggestionClick}
            className="rounded-xl border border-trace-border bg-trace-composer/60 px-4 py-3 text-left text-sm text-trace-text transition-colors hover:bg-trace-composer disabled:cursor-default"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
