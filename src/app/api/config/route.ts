import { NextResponse } from "next/server";
import { getEvaluatePipelineMode } from "@/lib/evaluate-pipeline";
import {
  getAvailableModels,
  getLlmModeLabel,
  getLlmProvider,
  isOpenAiConfigured,
  isStubOnlyMode,
} from "@/lib/llm/config";

/** Public runtime flags for the UI (no secrets). */
export async function GET() {
  return NextResponse.json({
    assistantMode: getLlmModeLabel(),
    evaluateMode: getEvaluatePipelineMode(),
    openAiConfigured: isOpenAiConfigured(),
    stubOnly: isStubOnlyMode(),
    provider: getLlmProvider(),
    availableModels: getAvailableModels(),
  });
}
