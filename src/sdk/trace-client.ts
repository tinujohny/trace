import type { EvaluateRequestBody, EvaluateResponseBody } from "@/lib/evaluate-api";
import type { BatchEvaluateRequestBody, BatchEvaluateResponseBody } from "@/types/phase9";

export type { EvaluateRequestBody, EvaluateResponseBody };
export type { BatchEvaluateRequestBody, BatchEvaluateResponseBody };

export interface TraceClientOptions {
  baseUrl: string;
  headers?: Record<string, string>;
}

/**
 * Thin HTTP client for embedding Trace evaluation in other apps (Phase 9).
 */
export class TraceClient {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;

  constructor(options: TraceClientOptions | string) {
    if (typeof options === "string") {
      this.baseUrl = options.replace(/\/$/, "");
      this.headers = { "Content-Type": "application/json" };
    } else {
      this.baseUrl = options.baseUrl.replace(/\/$/, "");
      this.headers = {
        "Content-Type": "application/json",
        ...options.headers,
      };
    }
  }

  async getManifest(): Promise<unknown> {
    const res = await fetch(`${this.baseUrl}/api/v1/trace`, { headers: this.headers });
    if (!res.ok) throw new Error(`Trace manifest failed (${res.status})`);
    return res.json();
  }

  async evaluate(params: EvaluateRequestBody): Promise<EvaluateResponseBody> {
    const res = await fetch(`${this.baseUrl}/api/evaluate`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      return {
        messageId: params.messageId,
        claims: [],
        error: `Evaluation request failed (${res.status}).`,
      };
    }
    return (await res.json()) as EvaluateResponseBody;
  }

  async batchEvaluate(params: BatchEvaluateRequestBody): Promise<BatchEvaluateResponseBody> {
    const res = await fetch(`${this.baseUrl}/api/evaluate/batch`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      throw new Error(`Batch evaluation failed (${res.status}).`);
    }
    return (await res.json()) as BatchEvaluateResponseBody;
  }
}
