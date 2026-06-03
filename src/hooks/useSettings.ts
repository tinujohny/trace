"use client";

import { useCallback, useEffect, useState } from "react";
import { loadSettings, persistSettings } from "@/lib/settings-persistence";
import { DEFAULT_TRACE_SETTINGS, type TraceSettings } from "@/types/settings";

export function useSettings() {
  const [settings, setSettings] = useState<TraceSettings>(DEFAULT_TRACE_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    persistSettings(settings);
  }, [settings, loaded]);

  const updateSettings = useCallback((patch: Partial<TraceSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  return { settings, loaded, updateSettings };
}
