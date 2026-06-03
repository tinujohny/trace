"use client";

import { useCallback, useRef, useState } from "react";
import { SendIcon } from "@/components/icons/ChatIcons";

interface ComposerProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function Composer({ onSend, disabled }: ComposerProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  const canSend = !disabled && value.trim().length > 0;

  return (
    <div className="shrink-0 bg-gradient-to-t from-trace-bg from-60% to-transparent px-4 pb-5 pt-2">
      <div className="mx-auto w-full max-w-[var(--trace-thread-max)]">
        <div className="relative flex items-end gap-2 rounded-[26px] border border-trace-border bg-trace-composer px-4 py-3 shadow-[0_0_24px_rgba(0,0,0,0.25)]">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Message Trace"
            rows={1}
            disabled={disabled}
            aria-label="Message input"
            className="max-h-[200px] min-h-[24px] flex-1 resize-none bg-transparent py-0.5 text-base leading-6 text-trace-text placeholder:text-trace-text-muted focus:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!canSend}
            aria-label="Send message"
            className={`mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
              canSend
                ? "bg-trace-send-active text-trace-send-active-fg hover:opacity-90"
                : "bg-trace-send-disabled text-trace-send-disabled-fg cursor-not-allowed"
            }`}
          >
            <SendIcon />
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-trace-text-muted/70">
          Trace can make mistakes. Check important claims.
        </p>
      </div>
    </div>
  );
}
