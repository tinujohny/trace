from __future__ import annotations

from openai import OpenAI

from trace_streamlit.config import get_api_key, get_base_url, resolve_model
from trace_streamlit.fixtures import pick_stub_reply

ASSISTANT_SYSTEM = """You are a helpful assistant in the Trace prototype.
Answer clearly in 2-5 sentences unless the user asks for more detail.
Use accurate, measured language. Do not invent citations."""

EVALUATE_SYSTEM = """You are Trace, an evaluation engine for AI answers.
Given an assistant reply, extract atomic factual claims as verbatim substrings of the text.
For each claim output exactly five fields plus a recommended user action.

Rules:
- "text" MUST be copied exactly from the assistant message (character-for-character substring).
- Split into 3-8 proposition-level claims when possible.
- "confidence" is one of: low, medium, high.
- "recommendedAction" is one of: trust, verify, skip.
- "source" must cite model knowledge, reasoning steps, or say if no external source exists.
- Be honest in "uncertainty" about what could be wrong or unknown.
- Output valid JSON only, matching the schema given."""


def _client() -> OpenAI | None:
    key = get_api_key()
    if not key:
        return None
    return OpenAI(api_key=key, base_url=get_base_url(key))


def chat_completion(
    messages: list[dict[str, str]],
    model: str | None = None,
) -> tuple[str, str]:
    """Returns (content, mode) where mode is 'llm' or 'stub'."""
    key = get_api_key()
    client = _client()
    if not client or not key:
        user = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
        return pick_stub_reply(user), "stub"

    resolved = resolve_model(key, model)
    try:
        resp = client.chat.completions.create(
            model=resolved,
            messages=[{"role": "system", "content": ASSISTANT_SYSTEM}, *messages],
            temperature=0.7,
            max_tokens=1024,
        )
        content = resp.choices[0].message.content or ""
        if not content.strip():
            raise ValueError("Empty response")
        return content.strip(), "llm"
    except Exception:
        user = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
        return pick_stub_reply(user), "stub"


def evaluate_json(
    assistant_content: str,
    model: str | None = None,
    source_urls: list[str] | None = None,
) -> tuple[dict, str]:
    """Returns (parsed_json, mode)."""
    from trace_streamlit.grounding import build_grounding_prompt_block

    key = get_api_key()
    client = _client()
    urls = source_urls or []
    grounding = build_grounding_prompt_block(urls)
    user_prompt = f"""{grounding}Assistant message to evaluate:

\"\"\"
{assistant_content.strip()}
\"\"\"

Return JSON:
{{
  "claims": [
    {{
      "text": "<verbatim substring>",
      "source": "<string>",
      "reasoning": "<string>",
      "assumptions": ["<string>"],
      "confidence": "low" | "medium" | "high",
      "uncertainty": "<string>",
      "recommendedAction": "trust" | "verify" | "skip"
    }}
  ]
}}

Maximum 10 claims."""

    if not client or not key:
        return _stub_evaluation(assistant_content), "stub"

    resolved = resolve_model(key, model)
    try:
        resp = client.chat.completions.create(
            model=resolved,
            messages=[
                {"role": "system", "content": EVALUATE_SYSTEM},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,
            max_tokens=4096,
            response_format={"type": "json_object"},
        )
        import json

        raw = resp.choices[0].message.content or "{}"
        return json.loads(raw), "llm"
    except Exception:
        return _stub_evaluation(assistant_content), "stub"


def _stub_evaluation(content: str) -> dict:
    """Minimal sentence-split stub when LLM unavailable."""
    import re

    sentences = re.split(r"(?<=[.!?])\s+", content.strip())
    claims = []
    for i, sent in enumerate(sentences[:8]):
        sent = sent.strip()
        if len(sent) < 12:
            continue
        claims.append(
            {
                "text": sent,
                "source": "Stub evaluation (no API key or request failed).",
                "reasoning": "Generic stub pipeline split on sentence boundaries.",
                "assumptions": ["Demo mode."],
                "confidence": "medium",
                "uncertainty": "Not verified against external sources.",
                "recommendedAction": "verify",
            }
        )
    return {"claims": claims or [{"text": content[:200], "source": "Stub", "reasoning": "—", "assumptions": [], "confidence": "low", "uncertainty": "—", "recommendedAction": "verify"}]}
