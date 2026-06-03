"use client";

import { useState } from "react";
import Link from "next/link";
import { ClaimSignalsView } from "@/components/evaluation/ClaimSignalsView";
import { GroundingPanel } from "@/components/grounding/GroundingPanel";
import { TraceLogo } from "@/components/icons/ChatIcons";
import { useGroundingUrls } from "@/hooks/useGroundingUrls";
import { TraceClient } from "@/sdk/trace-client";
import type { BatchEvaluateResponseBody } from "@/types/phase9";
import type { Claim } from "@/types";

export function BatchEvalPanel() {
  const { input: groundingInput, setInput: setGroundingInput, urls: groundingUrls } =
    useGroundingUrls();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<BatchEvaluateResponseBody | null>(null);
  const [activeClaimId, setActiveClaimId] = useState<string | null>(null);

  const runBatch = async () => {
    const trimmed = content.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setReport(null);
    setActiveClaimId(null);

    try {
      const client = new TraceClient("");
      const result = await client.batchEvaluate({
        content: trimmed,
        title: title.trim() || undefined,
        model: model.trim() || undefined,
        sourceUrls: groundingUrls.length > 0 ? groundingUrls : undefined,
      });
      setReport(result);
      if (result.claims.length > 0) setActiveClaimId(result.claims[0].id);
      if (result.error) setError(result.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Batch evaluation failed.");
    } finally {
      setLoading(false);
    }
  };

  const activeClaim: Claim | null =
    report?.claims.find((c) => c.id === activeClaimId) ?? null;

  const downloadReport = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trace-batch-${report.reportId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="trace-shell flex h-dvh overflow-hidden bg-trace-bg text-trace-text">
      <aside className="flex w-[var(--trace-sidebar-width)] shrink-0 flex-col border-r border-trace-border bg-trace-sidebar">
        <div className="flex items-center gap-2 px-3 py-3">
          <TraceLogo className="text-trace-text" />
          <span className="text-sm font-semibold">Trace Batch</span>
        </div>
        <div className="space-y-2 overflow-y-auto px-2 pb-4">
          <Link
            href="/"
            className="block rounded-lg border border-trace-border px-3 py-2 text-xs text-trace-text hover:bg-trace-composer"
          >
            ← Back to chat
          </Link>
          <GroundingPanel
            value={groundingInput}
            onChange={setGroundingInput}
            urlCount={groundingUrls.length}
            disabled={loading}
          />
          <p className="px-1 text-[10px] text-trace-text-muted/80">
            API: <code className="text-trace-text">POST /api/evaluate/batch</code>
          </p>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-trace-border px-4 py-3">
          <h1 className="text-sm font-medium">Batch evaluation</h1>
          <p className="mt-0.5 text-xs text-trace-text-muted">
            Paste a document or article — get a claim-level report without chat.
          </p>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-1 flex-col overflow-y-auto p-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Report title (optional)"
              className="mb-3 w-full max-w-xl rounded-lg border border-trace-border bg-trace-composer px-3 py-2 text-sm text-trace-text"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={14}
              placeholder="Paste text to evaluate…"
              className="w-full max-w-3xl resize-y rounded-lg border border-trace-border bg-trace-composer px-3 py-3 text-sm text-trace-text placeholder:text-trace-text-muted/60"
            />
            <div className="mt-3 flex max-w-3xl flex-wrap items-center gap-3">
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Model override (optional)"
                className="min-w-[12rem] flex-1 rounded-lg border border-trace-border bg-trace-composer px-3 py-2 text-xs text-trace-text"
              />
              <button
                type="button"
                onClick={runBatch}
                disabled={loading || !content.trim()}
                className="rounded-lg bg-trace-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Evaluating…" : "Run evaluation"}
              </button>
              {report && (
                <button
                  type="button"
                  onClick={downloadReport}
                  className="rounded-lg border border-trace-border px-4 py-2 text-sm text-trace-text hover:bg-trace-composer"
                >
                  Download JSON
                </button>
              )}
            </div>

            {error && (
              <p className="mt-4 max-w-3xl text-sm text-red-400" role="alert">
                {error}
              </p>
            )}

            {report && report.claims.length > 0 && (
              <div className="mt-6 max-w-3xl">
                <p className="mb-2 text-xs text-trace-text-muted">
                  {report.claims.length} claims · pipeline: {report.pipeline}
                  {report.sourceUrls?.length
                    ? ` · ${report.sourceUrls.length} grounding URL(s)`
                    : ""}
                </p>
                <ul className="space-y-2">
                  {report.claims.map((claim, index) => (
                    <li key={claim.id}>
                      <button
                        type="button"
                        onClick={() => setActiveClaimId(claim.id)}
                        className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                          activeClaimId === claim.id
                            ? "border-trace-claim-border bg-trace-claim-active-bg"
                            : "border-trace-border bg-trace-composer/40 hover:bg-trace-composer"
                        }`}
                      >
                        <span className="text-xs font-medium text-trace-claim-border">
                          Claim {index + 1}
                        </span>
                        <span className="mt-1 block text-trace-text">{claim.text}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="hidden w-[var(--trace-eval-width)] shrink-0 flex-col border-l border-trace-border bg-trace-sidebar md:flex">
            <div className="border-b border-trace-border px-4 py-3">
              <h2 className="text-sm font-medium">Claim detail</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {activeClaim ? (
                <ClaimSignalsView claim={activeClaim} />
              ) : (
                <p className="text-sm text-trace-text-muted">
                  Run evaluation and select a claim to inspect signals.
                </p>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
