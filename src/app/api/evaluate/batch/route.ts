import { NextResponse } from "next/server";
import { evaluateAssistantContent } from "@/lib/evaluate-pipeline";
import { normalizeSourceUrls } from "@/lib/grounding";
import { createId } from "@/lib/id";
import type { BatchEvaluateRequestBody, BatchEvaluateResponseBody } from "@/types/phase9";

export async function POST(request: Request) {
  let body: BatchEvaluateRequestBody;

  try {
    body = (await request.json()) as BatchEvaluateRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const content = body.content?.trim();
  if (!content) {
    return NextResponse.json({ error: "content is required." }, { status: 400 });
  }

  const sourceUrls = normalizeSourceUrls(body.sourceUrls);

  const messageId = createId("batch");
  const result = await evaluateAssistantContent(messageId, content, body.model, sourceUrls);

  const response: BatchEvaluateResponseBody = {
    reportId: createId("report"),
    title: body.title?.trim() || "Batch evaluation",
    messageId: result.evaluation.messageId,
    claims: result.evaluation.claims,
    pipeline: result.pipeline,
    sourceUrls: sourceUrls.length > 0 ? sourceUrls : undefined,
    ...(result.ok ? {} : { error: result.error }),
  };

  return NextResponse.json(response);
}
