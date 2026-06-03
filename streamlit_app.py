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
from trace_streamlit.llm import chat_completion, evaluate_json
from trace_streamlit.styles import inject_styles
from trace_streamlit.ui_helpers import (
    render_eval_panel_header,
    render_message_html,
    render_signal_section,
)

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
        label_visibility="visible",
    )
    urls = parse_source_urls(st.session_state.grounding_text)
    if urls:
        st.sidebar.caption(f"{len(urls)} URL(s) active")

    st.session_state.calibration_enabled = st.sidebar.toggle(
        "Calibration mode",
        value=st.session_state.calibration_enabled,
    )

    st.sidebar.caption("—")
    st.sidebar.caption("Next.js UI: `npm run dev` in repo.")
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


def _latest_eval_idx() -> int | None:
    idx = st.session_state.last_assistant_idx
    if idx is not None and idx in st.session_state.evaluations:
        return idx
    for i, m in enumerate(st.session_state.messages):
        if m["role"] == "assistant" and i in st.session_state.evaluations:
            return i
    return None


def render_eval_panel(claims: list[dict], pipeline: str, model: str) -> None:
    st.markdown(render_eval_panel_header(st.session_state.calibration_enabled), unsafe_allow_html=True)

    if not claims:
        st.markdown(
            '<p style="font-size:0.8125rem;color:#b4b4b4;">Select a highlighted claim after the assistant replies.</p></div>',
            unsafe_allow_html=True,
        )
        return

    claim_ids = [c["id"] for c in claims]
    labels = [
        f"Claim {i + 1}: {c['text'][:60]}{'…' if len(c['text']) > 60 else ''}"
        for i, c in enumerate(claims)
    ]
    current = st.session_state.selected_claim_id
    if current not in claim_ids:
        current = claim_ids[0]
        st.session_state.selected_claim_id = current

    picked = st.radio(
        "Claims",
        claim_ids,
        format_func=lambda cid: labels[claim_ids.index(cid)],
        index=claim_ids.index(current),
        label_visibility="collapsed",
        key="claim_radio",
    )
    st.session_state.selected_claim_id = picked
    claim = next(c for c in claims if c["id"] == picked)

    cal = st.session_state.calibration_records.get(claim["id"], {})
    revealed = bool(cal.get("revealedAt"))

    if st.session_state.calibration_enabled and not revealed:
        st.markdown("**What would you do with this claim?**")
        c1, c2, c3 = st.columns(3)
        for col, choice, color in zip(
            [c1, c2, c3],
            ["trust", "verify", "skip"],
            ["#22c55e", "#eab308", "#94a3b8"],
        ):
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
            st.markdown("</div>", unsafe_allow_html=True)
            return

    if st.session_state.calibration_enabled and revealed and cal.get("choice"):
        aligned = cal["choice"] == claim.get("recommendedAction")
        msg = "✓ Aligned with Trace" if aligned else "Different from Trace recommendation"
        st.markdown(f"**You:** {cal['choice']} · **Trace:** {claim.get('recommendedAction')} — {msg}")

    import html as html_mod

    quote = html_mod.escape(claim["text"])
    st.markdown(f'<blockquote class="trace-quote">{quote}</blockquote>', unsafe_allow_html=True)
    st.markdown(
        f'<p class="trace-confidence">Confidence · {claim.get("confidence", "—").upper()}</p>',
        unsafe_allow_html=True,
    )

    body_src = html_mod.escape(claim.get("source", "—")).replace("\n", "<br>")
    st.markdown(render_signal_section("Source", body_src), unsafe_allow_html=True)
    for url in claim.get("groundingUrls", []):
        st.markdown(f"[{url}]({url})")
    st.markdown(
        render_signal_section("Reasoning", html_mod.escape(claim.get("reasoning", "—"))),
        unsafe_allow_html=True,
    )
    assumptions = claim.get("assumptions", [])
    if assumptions:
        ass_html = "<br>".join(f"• {html_mod.escape(a)}" for a in assumptions)
    else:
        ass_html = "None listed."
    st.markdown(render_signal_section("Assumptions", ass_html), unsafe_allow_html=True)
    st.markdown(
        render_signal_section("Uncertainty", html_mod.escape(claim.get("uncertainty", "—"))),
        unsafe_allow_html=True,
    )
    st.caption(f"Pipeline: {pipeline}")
    st.markdown("</div>", unsafe_allow_html=True)


def render_chat(model: str) -> None:
    eval_idx = _latest_eval_idx()
    has_eval = bool(
        eval_idx is not None and st.session_state.evaluations.get(eval_idx, {}).get("claims"),
    )

    if has_eval:
        col_thread, col_eval = st.columns([1.55, 1], gap="small")
    else:
        col_thread = st.container()
        col_eval = None

    with col_thread:
        if not st.session_state.messages:
            st.markdown(
                """
                <div class="trace-empty">
                  <h2>What can I help with?</h2>
                </div>
                """,
                unsafe_allow_html=True,
            )
            s1, s2 = st.columns(2)
            for col, text in zip([s1, s2], SUGGESTIONS):
                if col.button(text, key=f"sug-{text[:24]}", use_container_width=True):
                    st.session_state._pending_prompt = text
                    st.rerun()
        else:
            for i, msg in enumerate(st.session_state.messages):
                claims = None
                if msg["role"] == "assistant" and i in st.session_state.evaluations:
                    claims = st.session_state.evaluations[i].get("claims", [])
                active_id = st.session_state.selected_claim_id if msg["role"] == "assistant" else None
                st.markdown(
                    render_message_html(msg["role"], msg["content"], claims, active_id),
                    unsafe_allow_html=True,
                )
                if msg["role"] == "assistant" and claims:
                    st.caption(f"{len(claims)} claims — use the evaluation panel →")

    if col_eval is not None:
        with col_eval:
            if has_eval and eval_idx is not None:
                ev = st.session_state.evaluations[eval_idx]
                render_eval_panel(ev.get("claims", []), ev.get("pipeline", "—"), model)

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
        if st.session_state.evaluations[assistant_idx].get("claims"):
            st.session_state.selected_claim_id = st.session_state.evaluations[assistant_idx]["claims"][0]["id"]
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
