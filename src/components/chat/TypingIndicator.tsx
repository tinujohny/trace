import { AssistantAvatar } from "@/components/chat/AssistantAvatar";

export function TypingIndicator() {
  return (
    <article className="w-full bg-trace-bg" aria-label="Assistant is typing" role="status">
      <div className="mx-auto flex w-full max-w-[var(--trace-thread-max)] gap-4 px-4 py-6">
        <AssistantAvatar />
        <div className="flex items-center gap-1 pt-2">
          <span className="h-2 w-2 animate-bounce rounded-full bg-trace-text-muted [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-trace-text-muted [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-trace-text-muted [animation-delay:300ms]" />
        </div>
      </div>
    </article>
  );
}
