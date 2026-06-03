import { NextResponse } from "next/server";

/** Public API manifest for embedding Trace evaluation (Phase 9). */
export async function GET() {
  return NextResponse.json({
    name: "Trace Evaluation API",
    version: "1.0.0",
    description:
      "Claim-level evaluation with five signals. Use from any client via HTTP or the @/sdk/trace-client module.",
    endpoints: [
      {
        method: "POST",
        path: "/api/evaluate",
        body: {
          messageId: "string (required)",
          content: "string (required) — assistant text to evaluate",
          model: "string (optional)",
          sourceUrls: "string[] (optional) — reference URLs for grounding",
        },
        response: {
          messageId: "string",
          claims: "Claim[]",
          pipeline: "llm | stub",
          error: "string (optional)",
        },
      },
      {
        method: "POST",
        path: "/api/evaluate/batch",
        body: {
          content: "string (required) — document or paste text",
          title: "string (optional)",
          model: "string (optional)",
          sourceUrls: "string[] (optional)",
        },
        response: {
          reportId: "string",
          title: "string",
          messageId: "string",
          claims: "Claim[]",
          pipeline: "llm | stub",
          error: "string (optional)",
        },
      },
      {
        method: "GET",
        path: "/api/v1/trace",
        description: "This manifest",
      },
    ],
    sdk: {
      module: "src/sdk/trace-client.ts",
      class: "TraceClient",
      example:
        'const client = new TraceClient("http://localhost:3000"); await client.evaluate({ messageId: "m1", content: "..." });',
    },
  });
}
