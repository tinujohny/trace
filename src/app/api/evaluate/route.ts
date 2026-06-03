import { NextResponse } from "next/server";
import type { EvaluateRequestBody, EvaluateResponseBody } from "@/lib/evaluate-api";
import { evaluateAssistantContent } from "@/lib/evaluate-pipeline";
import { normalizeSourceUrls } from "@/lib/grounding";

export async function POST(request: Request) {
  let body: EvaluateRequestBody;

  try {
    body = (await request.json()) as EvaluateRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { messageId, content, model, sourceUrls: rawUrls } = body;
  const sourceUrls = normalizeSourceUrls(rawUrls);

  if (!messageId || typeof messageId !== "string") {
    return NextResponse.json({ error: "messageId is required." }, { status: 400 });
  }

  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "content is required." }, { status: 400 });
  }

  const result = await evaluateAssistantContent(messageId, content, model, sourceUrls);

  const response: EvaluateResponseBody = {
    messageId: result.evaluation.messageId,
    claims: result.evaluation.claims,
    pipeline: result.pipeline,
    ...(result.ok ? {} : { error: result.error }),
  };

  return NextResponse.json(response);
}
