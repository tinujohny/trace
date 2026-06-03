"""HTML rendering helpers for chat messages and claims."""
from __future__ import annotations

import html
from typing import Any


def _esc(text: str) -> str:
    return html.escape(text)


def render_message_html(
    role: str,
    content: str,
    claims: list[dict[str, Any]] | None = None,
    active_claim_id: str | None = None,
    claim_count: int = 0,
) -> str:
    row_class = "user" if role == "user" else "assistant"
    label = "You" if role == "user" else "Assistant"
    body = _format_content_with_claims(content, claims or [], active_claim_id)
    footer = ""
    if claim_count > 0:
        footer = (
            f'<p class="trace-msg-footer">{claim_count} claims — '
            "pick one in the evaluation panel →</p>"
        )
    return f"""
    <div class="trace-msg-row {row_class}">
      <div class="trace-msg-inner">
        <div class="trace-msg-label">{label}</div>
        <div class="trace-msg-body">{body}</div>
        {footer}
      </div>
    </div>
    """


def _format_content_with_claims(
    content: str,
    claims: list[dict[str, Any]],
    active_claim_id: str | None,
) -> str:
    if not claims:
        return f'<p style="margin:0;white-space:pre-wrap;">{_esc(content)}</p>'

    # Replace claims longest-first to avoid partial overlaps
    sorted_claims = sorted(claims, key=lambda c: len(c.get("text", "")), reverse=True)
    parts: list[tuple[int, int, str]] = []
    used_spans: list[tuple[int, int]] = []

    for claim in sorted_claims:
        text = claim.get("text", "")
        if not text:
            continue
        start = 0
        while True:
            idx = content.find(text, start)
            if idx == -1:
                break
            end = idx + len(text)
            overlap = any(not (end <= s or idx >= e) for s, e in used_spans)
            if not overlap:
                used_spans.append((idx, end))
                cid = claim.get("id", "")
                active = " active" if cid and cid == active_claim_id else ""
                parts.append((idx, end, f'<span class="trace-claim{active}">{_esc(text)}</span>'))
                break
            start = idx + 1

    if not parts:
        return f'<p style="margin:0;white-space:pre-wrap;">{_esc(content)}</p>'

    parts.sort(key=lambda x: x[0])
    out: list[str] = []
    pos = 0
    for start, end, chunk in parts:
        if start > pos:
            out.append(_esc(content[pos:start]))
        out.append(chunk)
        pos = end
    if pos < len(content):
        out.append(_esc(content[pos:]))
    return f'<p style="margin:0;white-space:pre-wrap;">{"".join(out)}</p>'


def render_eval_panel_header(calibration: bool) -> str:
    sub = "Calibration — predict before reveal" if calibration else "Trace signals"
    badge = '<span class="trace-badge calibrating">Calibrating</span>' if calibration else ""
    return f"""
    <div class="trace-eval-panel">
      <h3>Evaluation</h3>
      <p class="trace-eval-sub">{sub}</p>
      {badge}
    """

def render_signal_section(title: str, body: str) -> str:
    return f"""
    <div class="trace-signal-block">
      <h4>{_esc(title)}</h4>
      <p>{body}</p>
    </div>
    """
