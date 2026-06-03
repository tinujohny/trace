"use client";

import { exportSessionJson, exportSessionMarkdown, type ExportSessionInput } from "@/lib/export-session";

interface SessionExportProps {
  session: ExportSessionInput;
  disabled?: boolean;
}

export function SessionExport({ session, disabled }: SessionExportProps) {
  const hasContent = session.messages.length > 0;

  return (
    <div className="space-y-2 rounded-lg border border-trace-border px-3 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-trace-text-muted">
        Export session
      </p>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={disabled || !hasContent}
          onClick={() => exportSessionJson(session)}
          className="rounded-lg border border-trace-border px-3 py-2 text-xs text-trace-text hover:bg-trace-composer disabled:opacity-40"
        >
          Download JSON
        </button>
        <button
          type="button"
          disabled={disabled || !hasContent}
          onClick={() => exportSessionMarkdown(session)}
          className="rounded-lg border border-trace-border px-3 py-2 text-xs text-trace-text hover:bg-trace-composer disabled:opacity-40"
        >
          Download Markdown
        </button>
      </div>
    </div>
  );
}
