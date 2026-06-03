"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { streamChatReply } from "@/lib/chat-api";
import { fetchEvaluation } from "@/lib/evaluate-api";
import { applyEvaluation } from "@/lib/evaluation";
import { createId } from "@/lib/id";
import { clearSession } from "@/lib/session-storage";
import type { Claim, Message } from "@/types";

interface UseChatOptions {
  model: string;
  sourceUrls?: string[];
  initialMessages?: Message[];
  initialEvaluations?: Record<string, Claim[]>;
  initialEvaluationErrors?: Record<string, string>;
  sessionReady?: boolean;
}

export function useChat({
  model,
  sourceUrls = [],
  initialMessages = [],
  initialEvaluations = {},
  initialEvaluationErrors = {},
  sessionReady = true,
}: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [evaluationsByMessageId, setEvaluationsByMessageId] =
    useState<Record<string, Claim[]>>(initialEvaluations);
  const [evaluationErrorsByMessageId, setEvaluationErrorsByMessageId] = useState<
    Record<string, string>
  >(initialEvaluationErrors);
  const [evaluatingMessageIds, setEvaluatingMessageIds] = useState<Set<string>>(new Set());
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const requestIdRef = useRef(0);
  const modelRef = useRef(model);
  const sourceUrlsRef = useRef(sourceUrls);
  const evaluateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    modelRef.current = model;
  }, [model]);

  useEffect(() => {
    sourceUrlsRef.current = sourceUrls;
  }, [sourceUrls]);

  const runEvaluation = useCallback(async (message: Message, evaluateModel: string) => {
    if (message.role !== "assistant" || !message.content.trim()) return;

    setEvaluatingMessageIds((prev) => new Set(prev).add(message.id));

    try {
      const result = await fetchEvaluation(
        message.id,
        message.content,
        evaluateModel,
        sourceUrlsRef.current,
      );

      setEvaluationsByMessageId((prev) =>
        applyEvaluation(prev, message.id, result.claims),
      );

      setEvaluationErrorsByMessageId((prev) => {
        const next = { ...prev };
        if (result.error) next[message.id] = result.error;
        else delete next[message.id];
        return next;
      });
    } catch {
      setEvaluationsByMessageId((prev) => applyEvaluation(prev, message.id, []));
      setEvaluationErrorsByMessageId((prev) => ({
        ...prev,
        [message.id]: "Could not reach the evaluation service.",
      }));
    } finally {
      setEvaluatingMessageIds((prev) => {
        const next = new Set(prev);
        next.delete(message.id);
        return next;
      });
    }
  }, []);

  const evaluateMissingAssistantMessages = useCallback(
    (msgs: Message[], evals: Record<string, Claim[]>, errors: Record<string, string>) => {
      const assistants = msgs.filter((m) => m.role === "assistant" && m.content.trim());
      const missing = assistants.filter(
        (m) => !(m.id in evals) && !(m.id in errors),
      );
      if (missing.length === 0) return;

      if (evaluateTimerRef.current) clearTimeout(evaluateTimerRef.current);
      evaluateTimerRef.current = setTimeout(() => {
        void Promise.all(missing.map((m) => runEvaluation(m, modelRef.current)));
      }, 500);
    },
    [runEvaluation],
  );

  useEffect(() => {
    if (!sessionReady) return;
    setMessages(initialMessages);
    setEvaluationsByMessageId(initialEvaluations);
    setEvaluationErrorsByMessageId(initialEvaluationErrors);
    setHydrated(true);
    evaluateMissingAssistantMessages(
      initialMessages,
      initialEvaluations,
      initialEvaluationErrors,
    );
  }, [sessionReady]); // eslint-disable-line react-hooks/exhaustive-deps -- hydrate once when session loads

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isLoading) return;

      const userMessage: Message = {
        id: createId("msg-u"),
        role: "user",
        content: trimmed,
        createdAt: new Date().toISOString(),
      };

      const assistantMessage: Message = {
        id: createId("msg-a"),
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
      };

      const threadBeforeAssistant = [...messages, userMessage];
      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsLoading(true);
      setStreamingMessageId(assistantMessage.id);

      const requestId = ++requestIdRef.current;
      let accumulated = "";

      try {
        const streamResult = await streamChatReply(
          threadBeforeAssistant,
          modelRef.current,
          (token) => {
            if (requestId !== requestIdRef.current) return;
            accumulated += token;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessage.id ? { ...m, content: accumulated } : m,
              ),
            );
          },
        );

        if (requestId !== requestIdRef.current) return;

        setStreamingMessageId(null);
        setIsLoading(false);

        const finalMessage: Message = {
          ...assistantMessage,
          content: accumulated.trim() || assistantMessage.content,
        };

        if (streamResult.error && !finalMessage.content) {
          setEvaluationErrorsByMessageId((prev) => ({
            ...prev,
            [assistantMessage.id]: streamResult.error!,
          }));
          return;
        }

        await runEvaluation(finalMessage, modelRef.current);
      } finally {
        if (requestId === requestIdRef.current) {
          setStreamingMessageId(null);
          setIsLoading(false);
        }
      }
    },
    [isLoading, messages, runEvaluation],
  );

  const clearChat = useCallback(() => {
    requestIdRef.current += 1;
    if (evaluateTimerRef.current) clearTimeout(evaluateTimerRef.current);
    setMessages([]);
    setEvaluationsByMessageId({});
    setEvaluationErrorsByMessageId({});
    setEvaluatingMessageIds(new Set());
    setStreamingMessageId(null);
    setIsLoading(false);
    clearSession();
  }, []);

  return {
    messages,
    isLoading,
    streamingMessageId,
    evaluationsByMessageId,
    evaluationErrorsByMessageId,
    evaluatingMessageIds,
    hydrated,
    sendMessage,
    clearChat,
  };
}
