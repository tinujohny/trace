"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ClaimCalibrationStatus } from "@/components/chat/ClaimHighlightedText";
import { EmptyState } from "@/components/chat/EmptyState";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import type { Claim, Message } from "@/types";

const MESSAGE_WINDOW = 40;

interface MessageThreadProps {
  messages: Message[];
  isLoading: boolean;
  streamingMessageId: string | null;
  evaluationsByMessageId: Record<string, Claim[]>;
  evaluationErrorsByMessageId: Record<string, string>;
  evaluatingMessageIds: Set<string>;
  activeClaimId: string | null;
  onSelectClaim: (claimId: string) => void;
  onSuggestionClick?: (text: string) => void;
  calibrationEnabled?: boolean;
  getCalibrationStatus?: (claimId: string) => ClaimCalibrationStatus;
}

export function MessageThread({
  messages,
  isLoading,
  streamingMessageId,
  evaluationsByMessageId,
  evaluationErrorsByMessageId,
  evaluatingMessageIds,
  activeClaimId,
  onSelectClaim,
  onSuggestionClick,
  calibrationEnabled = false,
  getCalibrationStatus,
}: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(MESSAGE_WINDOW);
  const hasMessages = messages.length > 0;

  const hiddenCount = Math.max(0, messages.length - visibleCount);
  const visibleMessages = useMemo(
    () => (hiddenCount > 0 ? messages.slice(hiddenCount) : messages),
    [messages, hiddenCount],
  );

  useEffect(() => {
    setVisibleCount((prev) => Math.max(prev, Math.min(messages.length, MESSAGE_WINDOW)));
  }, [messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, streamingMessageId, evaluationsByMessageId, visibleCount]);

  if (!hasMessages && !isLoading) {
    return <EmptyState onSuggestionClick={onSuggestionClick} />;
  }

  return (
    <div
      className="trace-shell__thread flex-1 overflow-y-auto"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      aria-label="Chat messages"
    >
      <div className="flex flex-col">
        {hiddenCount > 0 && (
          <div className="flex justify-center py-3">
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + MESSAGE_WINDOW)}
              className="rounded-lg border border-trace-border px-3 py-1.5 text-xs text-trace-text-muted hover:bg-trace-composer"
            >
              Load {Math.min(hiddenCount, MESSAGE_WINDOW)} earlier messages
              {hiddenCount > MESSAGE_WINDOW ? ` (${hiddenCount} hidden)` : ""}
            </button>
          </div>
        )}
        {visibleMessages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            claims={evaluationsByMessageId[message.id]}
            activeClaimId={activeClaimId}
            onSelectClaim={onSelectClaim}
            getCalibrationStatus={getCalibrationStatus}
            calibrationEnabled={calibrationEnabled}
            isEvaluating={evaluatingMessageIds.has(message.id)}
            evaluationError={evaluationErrorsByMessageId[message.id]}
            isStreaming={streamingMessageId === message.id}
          />
        ))}
        {isLoading && !streamingMessageId && <TypingIndicator />}
        <div ref={bottomRef} className="h-4" aria-hidden />
      </div>
    </div>
  );
}
