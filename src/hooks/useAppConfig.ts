"use client";

import { useEffect, useState } from "react";

export interface AppConfig {
  assistantMode: "llm" | "stub";
  evaluateMode: "llm" | "stub";
  openAiConfigured: boolean;
  stubOnly: boolean;
  provider?: "openai" | "groq";
  availableModels?: string[];
}

const DEFAULT_CONFIG: AppConfig = {
  assistantMode: "stub",
  evaluateMode: "stub",
  openAiConfigured: false,
  stubOnly: false,
  provider: "openai",
  availableModels: [],
};

export function useAppConfig() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => setConfig({ ...DEFAULT_CONFIG, ...data }))
      .catch(() => setConfig(DEFAULT_CONFIG))
      .finally(() => setLoaded(true));
  }, []);

  return { config, loaded };
}
