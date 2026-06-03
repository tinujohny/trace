"""
Trace — Streamlit deployment
Chat + claim evaluation + calibration (Streamlit Community Cloud).
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

st.set_page_config(
    page_title="Trace",
    page_icon="🔍",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ——— Session defaults ———
def _init_state() -> None:
    defaults = {
        "messages": [],
        "evaluations": {},
        "calibration_enabled": False,
        "calibration_records": {},
        "grounding_text": "",
        "selected_claim_idx": None,
        "last_assistant_idx": None,
    }
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v


_init_state()

api_key = get_api_key()
provider = detect_provider(api_key) if api_key else None
mode_label = "llm" if api_key else "stub"


def render_sidebar() -> tuple[str, bool]:
    st.sidebar.title("Trace")
    page = st.sidebar.radio(
        "Navigate",
        ["Chat", "Batch evaluate"],
        label_visibility="collapsed",
    )

    st.sidebar.divider()
    st.sidebar.caption(f"Assistant: **{mode_label}**" + (f" ({provider})" if provider else ""))

    if not api_key:
        st.sidebar.warning(
            "Add `OPENAI_API_KEY` in **Streamlit Cloud → Settings → Secrets**, "
            "or set it locally in `.streamlit/secrets.toml`."
        )
        model = "gpt-4o-mini"
    else:
        models = available_models(api_key)
        default = get_default_model(api_key)
        idx = models.index(default) if default in models else 0
        model = st.sidebar.selectbox("Model", models, index=idx, key="model_select")

    st.session_state.grounding_text = st.sidebar.text_area(
        "Grounding URLs (one per line)",
        value=st.session_state.grounding_text,
        height=80,
        placeholder="https://example.com/article",
    )
    grounding_urls = parse_source_urls(st.session_state.grounding_text)
    if grounding_urls:
        st.sidebar.caption(f"{len(grounding_urls)} URL(s) active")

    st.session_state.calibration_enabled = st.sidebar.toggle(
        "Calibration mode",
        value=st.session_state.calibration_enabled,
    )

    if st.sidebar.button("New chat", use_container_width=True):
        st.session_state.messages = []
        st.session_state.evaluations = {}
        st.session_state.calibration_records = {}
        st.session_state.selected_claim_idx = None
        st.session_state.last_assistant_idx = None
        st.rerun()

    st.sidebar.divider()
    st.sidebar.caption("Full Next.js UI: run `npm run dev` from this repo.")
    return page, model


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


def render_chat(model: str) -> None:
    st.header("Trace Chat")
    st.caption("Select claims in assistant replies · predict trust / verify / skip in calibration mode")

    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    if prompt := st.chat_input("Ask anything…"):
        st.session_state.messages.append(
            {"role": "user", "content": prompt, "at": datetime.now(timezone.utc).isoformat()}
        )
        history = [{"role": m["role"], "content": m["content"]} for m in st.session_state.messages]
        with st.spinner("Assistant thinking…"):
            reply, chat_mode = chat_completion(history, model=model)
        assistant_idx = len(st.session_state.messages)
        st.session_state.messages.append(
            {"role": "assistant", "content": reply, "mode": chat_mode, "at": datetime.now(timezone.utc).isoformat()}
        )
        st.session_state.last_assistant_idx = assistant_idx
        with st.spinner("Evaluating claims…"):
            evaluate_message(assistant_idx, reply, model)
        st.rerun()

    # Show latest evaluation UI
    idx = st.session_state.last_assistant_idx
    if idx is None or idx not in st.session_state.evaluations:
        if st.session_state.messages:
            for i, m in enumerate(st.session_state.messages):
                if m["role"] == "assistant" and i in st.session_state.evaluations:
                    idx = i
                    break
    if idx is None or idx not in st.session_state.evaluations:
        return

    ev = st.session_state.evaluations[idx]
    claims = ev.get("claims", [])
    if not claims:
        st.info(ev.get("error", "No claims extracted."))
        return

    st.subheader("Claims")
    claim_labels = [f"{i + 1}. {c['text'][:80]}…" if len(c["text"]) > 80 else f"{i + 1}. {c['text']}" for i, c in enumerate(claims)]
    selected = st.selectbox("Select claim", range(len(claims)), format_func=lambda i: claim_labels[i], key="claim_select")
    claim = claims[selected]
    st.session_state.selected_claim_idx = selected

    cal = st.session_state.calibration_records.get(claim["id"], {})
    revealed = bool(cal.get("revealedAt"))

    if st.session_state.calibration_enabled and not revealed:
        st.markdown("**What would you do with this claim?**")
        cols = st.columns(3)
        for col, choice in zip(cols, ["trust", "verify", "skip"]):
            if col.button(choice.capitalize(), key=f"pred-{claim['id']}-{choice}", use_container_width=True):
                st.session_state.calibration_records[claim["id"]] = {
                    "choice": choice,
                    "revealedAt": None,
                }
                st.rerun()
        if cal.get("choice") and st.button("Reveal evaluation", type="primary"):
            st.session_state.calibration_records[claim["id"]]["revealedAt"] = datetime.now(timezone.utc).isoformat()
            st.rerun()
        if cal.get("choice"):
            st.caption("Signals stay hidden until you reveal.")
            return

    if st.session_state.calibration_enabled and revealed and cal.get("choice"):
        aligned = cal["choice"] == claim.get("recommendedAction")
        st.success(f"Your choice: **{cal['choice']}** · Trace recommends: **{claim.get('recommendedAction')}** · {'Aligned' if aligned else 'Different'}")

    st.markdown(f"> {claim['text']}")
    st.metric("Confidence", claim.get("confidence", "—").upper())
    st.markdown("**Source**")
    st.write(claim.get("source", "—"))
    for url in claim.get("groundingUrls", []):
        st.markdown(f"- [{url}]({url})")
    st.markdown("**Reasoning**")
    st.write(claim.get("reasoning", "—"))
    st.markdown("**Assumptions**")
    for a in claim.get("assumptions", []):
        st.markdown(f"- {a}")
    st.markdown("**Uncertainty**")
    st.write(claim.get("uncertainty", "—"))
    st.caption(f"Evaluate pipeline: {ev.get('pipeline', '—')}")


def render_batch(model: str) -> None:
    st.header("Batch evaluation")
    st.caption("Paste a document — get a claim-level report (no chat thread).")

    title = st.text_input("Report title", value="Batch evaluation")
    content = st.text_area("Document text", height=220, placeholder="Paste text to evaluate…")
    if st.button("Run evaluation", type="primary", disabled=not content.strip()):
        urls = parse_source_urls(st.session_state.grounding_text)
        with st.spinner("Evaluating…"):
            data, pipeline = evaluate_json(content, model=model, source_urls=urls)
        report = {
            "title": title,
            "content": content,
            "claims": data.get("claims", []),
            "pipeline": pipeline,
            "sourceUrls": urls,
            "exportedAt": datetime.now(timezone.utc).isoformat(),
        }
        st.session_state.batch_report = report

    report = st.session_state.get("batch_report")
    if not report:
        return

    claims = report["claims"]
    st.success(f"{len(claims)} claims · pipeline: {report['pipeline']}")
    st.download_button(
        "Download JSON",
        data=json.dumps(report, indent=2),
        file_name="trace-batch-report.json",
        mime="application/json",
    )
    for i, c in enumerate(claims):
        with st.expander(f"Claim {i + 1}: {c.get('text', '')[:100]}"):
            st.json(c)


def main() -> None:
    page, model = render_sidebar()
    if page == "Batch evaluate":
        render_batch(model)
    else:
        render_chat(model)


if __name__ == "__main__":
    main()
