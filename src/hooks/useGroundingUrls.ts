"use client";

import { useCallback, useEffect, useState } from "react";
import { parseSourceUrls } from "@/lib/grounding";
import { GROUNDING_STORAGE_KEY } from "@/types/phase9";

function loadGroundingText(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(GROUNDING_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function useGroundingUrls() {
  const [input, setInput] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setInput(loadGroundingText());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(GROUNDING_STORAGE_KEY, input);
    } catch {
      // ignore
    }
  }, [input, loaded]);

  const urls = parseSourceUrls(input);

  const clear = useCallback(() => setInput(""), []);

  return { input, setInput, urls, loaded, clear };
}
