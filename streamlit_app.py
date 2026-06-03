"""
Trace — Streamlit deployment (ChatGPT-like UI)
"""
from __future__ import annotations

import json
from datetime import datetime, timezone

import streamlit as st

from trace_streamlit.config import (
    available_models,
    detect_provider,
    get_api_key,
    get_default_model,
)
from trace_streamlit.grounding import parse_source_urls
from trace_streamlit.layout import inject_split_layout_css
from trace_streamlit.llm import chat_completion, evaluate_json
from trace_streamlit.styles import inject_styles
from trace_streamlit.claims import is_well_sourced_high_confidence
from trace_streamlit.ui_helpers import format_assistant_body, render_signal_section

st.set_page_config(
    page_title="Trace",
    page_icon="◆",
    layout="wide",
    initial_sidebar_state="expanded",
)

SUGGESTIONS = [
    "Is it okay to drink several cups of coffee every day?",
    "Can solar alone power most countries soon?",
]

USER_CONTEXT_OPTIONS: list[tuple[str, str]] = [
    ("general_user", "General user"),
    ("med_student", "Med student"),
    ("engineer", "Engineer"),
    ("lawyer", "Lawyer"),
    ("founder", "Founder"),
    ("marketing", "Marketing"),
]
USER_CONTEXT_VALUES = [v for v, _ in USER_CONTEXT_OPTIONS]
USER_CONTEXT_LABELS = dict(USER_CONTEXT_OPTIONS)


def _init_state() -> None:
    defaults = {
        "messages": [],
        "evaluations": {},
        "calibration_enabled": False,
        "calibration_records": {},
        "grounding_text": "",
        "selected_claim_id": None,
        "last_assistant_idx": None,
        "page": "Chat",
        "user_context": "general_user",
    }
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v


_init_state()
inject_styles()

api_key = get_api_key()
provider = detect_provider(api_key) if api_key else None
mode_label = "llm" if api_key else "stub"


def render_sidebar() -> str:
    st.sidebar.markdown("### ◆ Trace")
    page = st.sidebar.radio(
        "Navigate",
        ["Chat", "Batch evaluate"],
        index=0 if st.session_state.page == "Chat" else 1,
        label_visibility="collapsed",
    )
    st.session_state.page = page

    st.sidebar.markdown(
        f'<p style="font-size:0.75rem;color:#b4b4b4;margin:0.5rem 0;">'
        f'Assistant: <span style="color:#ececec;">{mode_label}</span>'
        f'{" · " + provider if provider else ""}</p>',
        unsafe_allow_html=True,
    )

    if not api_key:
        st.sidebar.warning("Add `OPENAI_API_KEY` in Streamlit **Secrets**.")
        model = "gpt-4o-mini"
    else:
        models = available_models(api_key)
        default = get_default_model(api_key)
        idx = models.index(default) if default in models else 0
        model = st.sidebar.selectbox("Model", models, index=idx, key="model_select")

    if st.sidebar.button("＋  New chat", use_container_width=True, type="secondary"):
        st.session_state.messages = []
        st.session_state.evaluations = {}
        st.session_state.calibration_records = {}
        st.session_state.selected_claim_id = None
        st.session_state.last_assistant_idx = None
        st.rerun()

    st.sidebar.divider()

    st.session_state.grounding_text = st.sidebar.text_area(
        "Grounding URLs",
        value=st.session_state.grounding_text,
        height=72,
        placeholder="One URL per line",
    )
    urls = parse_source_urls(st.session_state.grounding_text)
    if urls:
        st.sidebar.caption(f"{len(urls)} URL(s) active")

    st.session_state.calibration_enabled = st.sidebar.toggle(
        "Calibration mode",
        value=st.session_state.calibration_enabled,
    )

    ctx_idx = (
        USER_CONTEXT_VALUES.index(st.session_state.user_context)
        if st.session_state.user_context in USER_CONTEXT_VALUES
        else 0
    )
    st.session_state.user_context = st.sidebar.selectbox(
        "Your context",
        USER_CONTEXT_VALUES,
        index=ctx_idx,
        format_func=lambda v: USER_CONTEXT_LABELS[v],
        help="Shapes how Trace interprets claims for your role (display only for now).",
    )

    return model


def evaluate_message(assistant_idx: int, content: str, model: str) -> None:
    urls = parse_source_urls(st.session_state.grounding_text)
    data, pipeline = evaluate_json(content, model=model, source_urls=urls)
    claims = data.get("claims", [])
    for i, c in enumerate(claims):
        c["id"] = f"claim-{assistant_idx}-{i}"
        if urls:
            c["groundingUrls"] = urls
            src = c.get("source", "")
            if "Grounded references" not in src:
                c["source"] = src + "\n\nGrounded references:\n" + "\n".join(f"• {u}" for u in urls)
    st.session_state.evaluations[assistant_idx] = {
        "claims": claims,
        "pipeline": pipeline,
    }


def _context_badge_label() -> str:
    key = st.session_state.get("user_context", "general_user")
    return USER_CONTEXT_LABELS.get(key, "General user").lower()


def render_context_badge() -> None:
    label = _context_badge_label()
    st.markdown(
        f'<p class="trace-context-badge">Your context: <span>{label}</span></p>',
        unsafe_allow_html=True,
    )


def _latest_eval_idx() -> int | None:
    idx = st.session_state.last_assistant_idx
    if idx is not None and idx in st.session_state.evaluations:
        return idx
    for i, m in enumerate(st.session_state.messages):
        if m["role"] == "assistant" and i in st.session_state.evaluations:
            return i
    return None


def _render_messages(model: str) -> None:
    for i, msg in enumerate(st.session_state.messages):
        claims = None
        if msg["role"] == "assistant" and i in st.session_state.evaluations:
            claims = st.session_state.evaluations[i].get("claims", [])
        active_id = st.session_state.selected_claim_id if msg["role"] == "assistant" else None

        with st.chat_message(msg["role"]):
            if msg["role"] == "assistant" and claims:
                body = format_assistant_body(msg["content"], claims, active_id)
                st.markdown(body, unsafe_allow_html=True)
                st.caption(f"{len(claims)} claims — pick one in the evaluation panel →")
            else:
                st.markdown(msg["content"])


def render_eval_panel(claims: list[dict], pipeline: str) -> None:
    st.markdown('<span class="trace-eval-col" aria-hidden="true"></span>', unsafe_allow_html=True)

    sub = (
        "Calibration — predict before reveal"
        if st.session_state.calibration_enabled
        else "Trace signals"
    )
    st.markdown("### Evaluation")
    st.markdown(f'<p class="eval-sub">{sub}</p>', unsafe_allow_html=True)
    if st.session_state.calibration_enabled:
        st.markdown(
            '<span class="trace-badge calibrating">Calibrating</span>',
            unsafe_allow_html=True,
        )

    if not claims:
        st.caption("Select a claim after the assistant replies.")
        return

    claim_ids = [c["id"] for c in claims]
    current = st.session_state.selected_claim_id
    if current not in claim_ids:
        current = claim_ids[0]
        st.session_state.selected_claim_id = current

    st.markdown('<span class="trace-claim-list" aria-hidden="true"></span>', unsafe_allow_html=True)
    for i, c in enumerate(claims):
        truncated = c["text"][:56] + ("…" if len(c["text"]) > 56 else "")
        is_active = c["id"] == current
        col_mark, col_btn = st.columns([0.07, 0.93], gap="small")
        with col_mark:
            if is_well_sourced_high_confidence(c):
                st.markdown(
                    '<span class="trace-claim-check" title="High confidence with source">✓</span>',
                    unsafe_allow_html=True,
                )
            else:
                st.markdown('<span class="trace-claim-check-spacer"></span>', unsafe_allow_html=True)
        with col_btn:
            if st.button(
                f"Claim {i + 1}: {truncated}",
                key=f"claim-pick-{c['id']}",
                use_container_width=True,
                type="primary" if is_active else "secondary",
            ):
                st.session_state.selected_claim_id = c["id"]
                st.rerun()

    picked = st.session_state.selected_claim_id
    claim = next(c for c in claims if c["id"] == picked)

    cal = st.session_state.calibration_records.get(claim["id"], {})
    revealed = bool(cal.get("revealedAt"))

    if st.session_state.calibration_enabled and not revealed:
        st.markdown("**What would you do with this claim?**")
        c1, c2, c3 = st.columns(3)
        for col, choice in zip([c1, c2, c3], ["trust", "verify", "skip"]):
            if col.button(choice.capitalize(), key=f"pred-{claim['id']}-{choice}", use_container_width=True):
                st.session_state.calibration_records[claim["id"]] = {
                    "choice": choice,
                    "revealedAt": None,
                }
                st.rerun()
        if cal.get("choice") and st.button("Reveal evaluation", type="primary", use_container_width=True):
            st.session_state.calibration_records[claim["id"]]["revealedAt"] = datetime.now(timezone.utc).isoformat()
            st.rerun()
        if cal.get("choice"):
            st.caption("Signals hidden until you reveal.")
            return

    if st.session_state.calibration_enabled and revealed and cal.get("choice"):
        aligned = cal["choice"] == claim.get("recommendedAction")
        msg = "✓ Aligned with Trace" if aligned else "Different from Trace recommendation"
        st.markdown(f"**You:** {cal['choice']} · **Trace:** {claim.get('recommendedAction')} — {msg}")

    import html as html_mod

    st.markdown(f'<blockquote class="trace-quote">{html_mod.escape(claim["text"])}</blockquote>', unsafe_allow_html=True)
    st.markdown(
        f'<p class="trace-confidence">Confidence · {claim.get("confidence", "—").upper()}</p>',
        unsafe_allow_html=True,
    )
    st.markdown(render_signal_section("Source", html_mod.escape(claim.get("source", "—")).replace("\n", "<br>")), unsafe_allow_html=True)
    for url in claim.get("groundingUrls", []):
        st.markdown(f"[{url}]({url})")
    st.markdown(
        render_signal_section("Reasoning", html_mod.escape(claim.get("reasoning", "—"))),
        unsafe_allow_html=True,
    )
    assumptions = claim.get("assumptions", [])
    ass_html = "<br>".join(f"• {html_mod.escape(a)}" for a in assumptions) if assumptions else "None listed."
    st.markdown(render_signal_section("Assumptions", ass_html), unsafe_allow_html=True)
    st.markdown(
        render_signal_section("Uncertainty", html_mod.escape(claim.get("uncertainty", "—"))),
        unsafe_allow_html=True,
    )
    st.caption(f"Pipeline: {pipeline}")


def render_chat(model: str) -> None:
    eval_idx = _latest_eval_idx()
    has_eval = bool(
        eval_idx is not None and st.session_state.evaluations.get(eval_idx, {}).get("claims"),
    )

    col_eval = None
    if has_eval:
        inject_split_layout_css()
        col_thread, col_eval = st.columns([1, 1], gap="small")
    else:
        col_thread = st.container()

    with col_thread:
        st.markdown(
            '<span class="trace-chat-thread" aria-hidden="true"></span>',
            unsafe_allow_html=True,
        )
        render_context_badge()

        if not st.session_state.messages:
            st.markdown(
                """
                <div class="trace-empty">
                  <h2>What can I help with?</h2>
                </div>
                """,
                unsafe_allow_html=True,
            )
            st.markdown('<div class="trace-suggestions-wrap">', unsafe_allow_html=True)
            s1, s2 = st.columns(2)
            for col, text in zip([s1, s2], SUGGESTIONS):
                if col.button(text, key=f"sug-{text[:24]}", use_container_width=True):
                    st.session_state._pending_prompt = text
                    st.rerun()
            st.markdown("</div>", unsafe_allow_html=True)
        else:
            _render_messages(model)

    if col_eval is not None and has_eval and eval_idx is not None:
        with col_eval:
            ev = st.session_state.evaluations[eval_idx]
            render_eval_panel(ev.get("claims", []), ev.get("pipeline", "—"))

    pending = st.session_state.pop("_pending_prompt", None)
    prompt = st.chat_input("Ask anything…") or pending

    if prompt:
        st.session_state.messages.append(
            {"role": "user", "content": prompt, "at": datetime.now(timezone.utc).isoformat()}
        )
        history = [{"role": m["role"], "content": m["content"]} for m in st.session_state.messages]
        with st.spinner(""):
            reply, chat_mode = chat_completion(history, model=model)
        assistant_idx = len(st.session_state.messages)
        st.session_state.messages.append(
            {
                "role": "assistant",
                "content": reply,
                "mode": chat_mode,
                "at": datetime.now(timezone.utc).isoformat(),
            }
        )
        st.session_state.last_assistant_idx = assistant_idx
        with st.spinner("Evaluating claims…"):
            evaluate_message(assistant_idx, reply, model)
        claims = st.session_state.evaluations.get(assistant_idx, {}).get("claims", [])
        if claims:
            st.session_state.selected_claim_id = claims[0]["id"]
        st.rerun()


def render_batch(model: str) -> None:
    st.markdown('<div class="trace-batch-wrap">', unsafe_allow_html=True)
    st.markdown("## Batch evaluation")
    st.caption("Paste a document — get a claim-level report.")

    title = st.text_input("Report title", value="Batch evaluation", label_visibility="collapsed")
    content = st.text_area(
        "Document",
        height=200,
        placeholder="Paste text to evaluate…",
        label_visibility="collapsed",
    )
    if st.button("Run evaluation", type="primary", disabled=not content.strip()):
        urls = parse_source_urls(st.session_state.grounding_text)
        with st.spinner("Evaluating…"):
            data, pipeline = evaluate_json(content, model=model, source_urls=urls)
        st.session_state.batch_report = {
            "title": title,
            "content": content,
            "claims": data.get("claims", []),
            "pipeline": pipeline,
            "sourceUrls": urls,
            "exportedAt": datetime.now(timezone.utc).isoformat(),
        }

    report = st.session_state.get("batch_report")
    if report:
        claims = report["claims"]
        st.success(f"{len(claims)} claims · {report['pipeline']}")
        st.download_button(
            "Download JSON",
            data=json.dumps(report, indent=2),
            file_name="trace-batch-report.json",
            mime="application/json",
        )
        for i, c in enumerate(claims):
            with st.expander(f"Claim {i + 1}"):
                st.markdown(f"**{c.get('text', '')}**")
                st.json(c)
    st.markdown("</div>", unsafe_allow_html=True)


def main() -> None:
    model = render_sidebar()
    if st.session_state.page == "Batch evaluate":
        render_batch(model)
    else:
        render_chat(model)


if __name__ == "__main__":
    main()
