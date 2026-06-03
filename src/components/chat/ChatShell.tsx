"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ClaimCalibrationStatus } from "@/components/chat/ClaimHighlightedText";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ClaimNavigator } from "@/components/chat/ClaimNavigator";
import { Composer } from "@/components/chat/Composer";
import { MessageThread } from "@/components/chat/MessageThread";
import { SignalsPanel } from "@/components/evaluation/SignalsPanel";
import { MenuIcon } from "@/components/icons/ChatIcons";
import { useAppConfig } from "@/hooks/useAppConfig";
import { useCalibration } from "@/hooks/useCalibration";
import { useChat } from "@/hooks/useChat";
import { useClaimKeyboardNav } from "@/hooks/useClaimKeyboardNav";
import { useClaimOverrides } from "@/hooks/useClaimOverrides";
import { useClaimSelection } from "@/hooks/useClaimSelection";
import { useGroundingUrls } from "@/hooks/useGroundingUrls";
import { useSettings } from "@/hooks/useSettings";
import { applyOverridesToEvaluationMap } from "@/lib/claim-overrides";
import { computeCalibrationAnalytics } from "@/lib/calibration-analytics";
import { debounce } from "@/lib/debounce";
import { loadSession, saveSession } from "@/lib/session-storage";
import type { PersistedTraceSession } from "@/types/session-storage";
import type { CalibrationChoice, Claim } from "@/types";

export function ChatShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [initialSession] = useState(() => loadSession());

  const { config: appConfig } = useAppConfig();
  const { settings, loaded: settingsLoaded, updateSettings } = useSettings();
  const {
    input: groundingInput,
    setInput: setGroundingInput,
    urls: groundingUrls,
  } = useGroundingUrls();
  const {
    overrides,
    getOverride,
    hasOverride,
    saveOverride,
    clearOverride,
  } = useClaimOverrides();

  const {
    messages,
    isLoading,
    streamingMessageId,
    evaluationsByMessageId,
    evaluationErrorsByMessageId,
    evaluatingMessageIds,
    hydrated,
    sendMessage,
    clearChat,
  } = useChat({
    model: settings.model,
    sourceUrls: groundingUrls,
    initialMessages: initialSession?.messages ?? [],
    initialEvaluations: initialSession?.evaluationsByMessageId ?? {},
    initialEvaluationErrors: initialSession?.evaluationErrorsByMessageId ?? {},
    sessionReady: true,
  });

  const displayEvaluations = useMemo(
    () => applyOverridesToEvaluationMap(evaluationsByMessageId, overrides),
    [evaluationsByMessageId, overrides],
  );

  const {
    activeClaimId,
    activeClaim,
    activeMessageClaims,
    allClaims,
    selectClaim,
    clearSelection,
    resetSelection,
  } = useClaimSelection(displayEvaluations, {
    initialActiveClaimId: initialSession?.activeClaimId ?? null,
  });

  const baseActiveClaim = useMemo((): Claim | null => {
    if (!activeClaimId) return null;
    for (const claims of Object.values(evaluationsByMessageId)) {
      const found = claims.find((c) => c.id === activeClaimId);
      if (found) return found;
    }
    return activeClaim;
  }, [activeClaimId, activeClaim, evaluationsByMessageId]);

  const calibration = useCalibration({
    defaultEnabled: settings.calibrationDefault,
    initialEnabled: initialSession?.calibrationEnabled,
    initialRecords: initialSession?.calibrationRecords ?? {},
  });

  const {
    enabled: calibrationEnabled,
    setEnabled: setCalibrationEnabled,
    records: calibrationRecords,
    predict,
    reveal,
    revealAllForClaims,
    getRecord,
    resetCalibration,
    getMessageSummary,
    canRevealAll,
  } = calibration;

  const persistCurrentSession = useMemo(
    () =>
      debounce(
        (snapshot: PersistedTraceSession) => {
          saveSession(snapshot);
        },
        400,
      ),
    [],
  );

  useEffect(() => {
    if (!hydrated) return;
    persistCurrentSession({
      version: 2,
      messages,
      evaluationsByMessageId,
      evaluationErrorsByMessageId,
      calibrationEnabled,
      calibrationRecords,
      activeClaimId,
      updatedAt: new Date().toISOString(),
    });
  }, [
    hydrated,
    messages,
    evaluationsByMessageId,
    evaluationErrorsByMessageId,
    calibrationEnabled,
    calibrationRecords,
    activeClaimId,
    persistCurrentSession,
  ]);

  const messageSummary = useMemo(
    () => (activeMessageClaims.length > 0 ? getMessageSummary(activeMessageClaims) : null),
    [activeMessageClaims, getMessageSummary],
  );

  const calibrationStats = useMemo(
    () => computeCalibrationAnalytics(calibrationRecords, displayEvaluations),
    [calibrationRecords, displayEvaluations],
  );

  const getCalibrationStatus = useCallback(
    (claimId: string): ClaimCalibrationStatus => {
      if (!calibrationEnabled) return "none";
      const record = getRecord(claimId);
      if (!record?.choice) return "none";
      return record.revealedAt ? "revealed" : "predicted";
    },
    [calibrationEnabled, getRecord],
  );

  useClaimKeyboardNav({
    claims: activeMessageClaims.length > 0 ? activeMessageClaims : allClaims,
    activeClaimId,
    onSelectClaim: selectClaim,
    onClear: clearSelection,
    enabled: hydrated,
  });

  const handleNewChat = () => {
    clearChat();
    resetSelection();
    resetCalibration();
    setCalibrationEnabled(settings.calibrationDefault);
    setSidebarOpen(false);
  };

  const handlePredict = (choice: CalibrationChoice) => {
    if (!activeClaim) return;
    predict(activeClaim.id, choice);
  };

  const handleReveal = () => {
    if (!activeClaim) return;
    reveal(activeClaim.id);
  };

  const handleRevealAll = () => {
    if (activeMessageClaims.length > 0) {
      revealAllForClaims(activeMessageClaims);
    }
  };

  const handleSaveOverride = useCallback(
    (patch: Parameters<typeof saveOverride>[1]) => {
      if (!baseActiveClaim) return;
      saveOverride(baseActiveClaim, patch);
    },
    [baseActiveClaim, saveOverride],
  );

  const handleClearOverride = useCallback(() => {
    if (!activeClaimId) return;
    clearOverride(activeClaimId);
  }, [activeClaimId, clearOverride]);

  const busy = isLoading || Boolean(streamingMessageId);

  const exportInput = useMemo(
    () => ({
      messages,
      evaluationsByMessageId: displayEvaluations,
      evaluationErrorsByMessageId,
      calibrationRecords,
    }),
    [messages, displayEvaluations, evaluationErrorsByMessageId, calibrationRecords],
  );

  if (!settingsLoaded) {
    return (
      <div className="flex h-dvh items-center justify-center bg-trace-bg text-sm text-trace-text-muted">
        Loading session…
      </div>
    );
  }

  return (
    <div
      className="trace-shell flex h-dvh overflow-hidden bg-trace-bg text-trace-text"
      role="application"
      aria-label="Trace chat and evaluation"
    >
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <ChatSidebar
        onNewChat={handleNewChat}
        disabled={busy}
        calibrationEnabled={calibrationEnabled}
        onCalibrationChange={setCalibrationEnabled}
        settings={settings}
        onSettingsChange={updateSettings}
        assistantMode={appConfig.assistantMode}
        evaluateMode={appConfig.evaluateMode}
        llmProvider={appConfig.provider}
        availableModels={appConfig.availableModels}
        exportSession={exportInput}
        calibrationStats={calibrationStats}
        groundingInput={groundingInput}
        onGroundingChange={setGroundingInput}
        groundingUrlCount={groundingUrls.length}
        className={`trace-shell__sidebar ${sidebarOpen ? "is-open" : ""}`}
      />

      <div className="trace-shell__main flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center gap-2 border-b border-trace-border px-3 py-2 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            className="rounded-lg p-2 text-trace-text-muted hover:bg-trace-composer"
          >
            <MenuIcon />
          </button>
          <span className="text-sm font-medium">Trace</span>
          {calibrationEnabled && (
            <span className="ml-auto rounded-full bg-trace-accent/20 px-2 py-0.5 text-[10px] font-medium text-trace-accent">
              Calibrating
            </span>
          )}
        </div>

        {activeClaim && activeMessageClaims.length > 0 && (
          <ClaimNavigator
            claims={activeMessageClaims}
            activeClaim={activeClaim}
            onSelectClaim={selectClaim}
            onClear={clearSelection}
          />
        )}

        <MessageThread
          messages={messages}
          isLoading={isLoading}
          streamingMessageId={streamingMessageId}
          evaluationsByMessageId={displayEvaluations}
          evaluationErrorsByMessageId={evaluationErrorsByMessageId}
          evaluatingMessageIds={evaluatingMessageIds}
          activeClaimId={activeClaimId}
          onSelectClaim={selectClaim}
          onSuggestionClick={sendMessage}
          calibrationEnabled={calibrationEnabled}
          getCalibrationStatus={getCalibrationStatus}
        />

        <Composer onSend={sendMessage} disabled={busy} />
      </div>

      <SignalsPanel
        claim={activeClaim}
        baseClaim={baseActiveClaim}
        messageClaims={activeMessageClaims}
        calibrationEnabled={calibrationEnabled}
        record={activeClaim ? getRecord(activeClaim.id) : undefined}
        messageSummary={messageSummary}
        claimOverride={activeClaim ? getOverride(activeClaim.id) : undefined}
        hasOverride={activeClaim ? hasOverride(activeClaim.id) : false}
        onSaveOverride={handleSaveOverride}
        onClearOverride={handleClearOverride}
        onPredict={handlePredict}
        onReveal={handleReveal}
        onRevealAll={handleRevealAll}
        canRevealAll={canRevealAll(activeMessageClaims)}
        className={`trace-shell__eval ${activeClaim ? "is-visible" : ""}`}
      />
    </div>
  );
}
