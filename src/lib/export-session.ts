import type { CalibrationRecord, Claim, Message } from "@/types";

export interface ExportSessionInput {
  messages: Message[];
  evaluationsByMessageId: Record<string, Claim[]>;
  evaluationErrorsByMessageId: Record<string, string>;
  calibrationRecords: Record<string, CalibrationRecord>;
  exportedAt?: string;
}

export function buildSessionExportJson(input: ExportSessionInput): string {
  return JSON.stringify(
    {
      exportedAt: input.exportedAt ?? new Date().toISOString(),
      messages: input.messages,
      evaluations: input.evaluationsByMessageId,
      evaluationErrors: input.evaluationErrorsByMessageId,
      calibration: input.calibrationRecords,
    },
    null,
    2,
  );
}

export function buildSessionExportMarkdown(input: ExportSessionInput): string {
  const lines: string[] = [
    "# Trace session export",
    "",
    `Exported: ${input.exportedAt ?? new Date().toISOString()}`,
    "",
    "## Conversation",
    "",
  ];

  for (const message of input.messages) {
    const role = message.role === "user" ? "User" : "Assistant";
    lines.push(`### ${role}`, "", message.content, "");
    const claims = input.evaluationsByMessageId[message.id];
    if (claims?.length) {
      lines.push("**Claims:**", "");
      for (const claim of claims) {
        lines.push(`- **Claim:** ${claim.text}`);
        lines.push(`  - Source: ${claim.signals.source}`);
        lines.push(`  - Confidence: ${claim.signals.confidence}`);
        lines.push(`  - Recommended: ${claim.recommendedAction}`);
        const record = input.calibrationRecords[claim.id];
        if (record?.choice) {
          lines.push(`  - Your prediction: ${record.choice}`);
        }
        lines.push("");
      }
    }
    const err = input.evaluationErrorsByMessageId[message.id];
    if (err) lines.push(`_Evaluation note: ${err}_`, "");
  }

  return lines.join("\n");
}

export function downloadTextFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportSessionJson(input: ExportSessionInput): void {
  const stamp = new Date().toISOString().slice(0, 10);
  downloadTextFile(
    `trace-session-${stamp}.json`,
    buildSessionExportJson(input),
    "application/json",
  );
}

export function exportSessionMarkdown(input: ExportSessionInput): void {
  const stamp = new Date().toISOString().slice(0, 10);
  downloadTextFile(
    `trace-session-${stamp}.md`,
    buildSessionExportMarkdown(input),
    "text/markdown",
  );
}
