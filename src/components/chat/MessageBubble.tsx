import { AssistantAvatar } from "@/components/chat/AssistantAvatar";
import {
  ClaimHighlightedText,
  type ClaimCalibrationStatus,
} from "@/components/chat/ClaimHighlightedText";
import type { Claim, Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  claims?: Claim[];
  activeClaimId?: string | null;
  onSelectClaim?: (claimId: string) => void;
  getCalibrationStatus?: (claimId: string) => ClaimCalibrationStatus;
  calibrationEnabled?: boolean;
  isEvaluating?: boolean;
  evaluationError?: string;
  isStreaming?: boolean;
}

export function MessageBubble({
  message,
  claims = [],
  activeClaimId = null,
  onSelectClaim,
  getCalibrationStatus,
  calibrationEnabled = false,
  isEvaluating = false,
  evaluationError,
  isStreaming = false,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const hasClaims = !isUser && claims.length > 0 && onSelectClaim;

  if (isUser) {
    return (
      <article className="w-full bg-trace-user-band">
        <div className="mx-auto flex w-full max-w-[var(--trace-thread-max)] justify-end px-4 py-6">
          <div className="max-w-[85%] rounded-[18px] bg-trace-surface-raised px-5 py-3 text-base leading-7 text-trace-text">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="w-full bg-trace-bg">
      <div className="mx-auto flex w-full max-w-[var(--trace-thread-max)] gap-4 px-4 py-6">
        <AssistantAvatar />
        <div className="min-w-0 flex-1 text-base leading-7 text-trace-text">
          {hasClaims ? (
            <>
              <ClaimHighlightedText
                content={message.content}
                claims={claims}
                activeClaimId={activeClaimId}
                onSelectClaim={onSelectClaim}
                getCalibrationStatus={getCalibrationStatus}
              />
              <p className="mt-3 text-xs text-trace-text-muted">
                {calibrationEnabled
                  ? `${claims.length} claims — predict trust / verify / skip, then reveal`
                  : `${claims.length} claims — select highlighted text to evaluate`}
              </p>
            </>
          ) : (
            <>
              <p className="whitespace-pre-wrap">
                {message.content}
                {isStreaming && (
                  <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-trace-accent align-middle" />
                )}
              </p>
              {isEvaluating && (
                <p className="mt-3 text-xs text-trace-accent">Analyzing claims…</p>
              )}
              {!isEvaluating && evaluationError && (
                <p className="mt-3 text-xs text-trace-verify">{evaluationError}</p>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
