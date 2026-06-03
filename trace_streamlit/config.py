"""LLM configuration for Streamlit deployment (OpenAI + Groq)."""
from __future__ import annotations

import os
from typing import Literal

Provider = Literal["openai", "groq"]

OPENAI_MODELS = ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"]
GROQ_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"]


def get_api_key() -> str | None:
    try:
        import streamlit as st

        key = st.secrets.get("OPENAI_API_KEY", "") or ""
        if key.strip():
            return key.strip()
    except Exception:
        pass
    return os.getenv("OPENAI_API_KEY", "").strip() or None


def detect_provider(api_key: str) -> Provider:
    return "groq" if api_key.startswith("gsk_") else "openai"


def get_base_url(api_key: str) -> str:
    explicit = os.getenv("OPENAI_BASE_URL", "").strip()
    if explicit:
        return explicit.rstrip("/")
    if detect_provider(api_key) == "groq":
        return "https://api.groq.com/openai/v1"
    return "https://api.openai.com/v1"


def get_default_model(api_key: str) -> str:
    env_model = os.getenv("OPENAI_MODEL", "").strip()
    provider = detect_provider(api_key)
    if env_model:
        if provider == "groq" and env_model.startswith("gpt-"):
            return "llama-3.3-70b-versatile"
        return env_model
    return "llama-3.3-70b-versatile" if provider == "groq" else "gpt-4o-mini"


def available_models(api_key: str) -> list[str]:
    return GROQ_MODELS if detect_provider(api_key) == "groq" else OPENAI_MODELS


def resolve_model(api_key: str, requested: str | None) -> str:
    allowed = available_models(api_key)
    if requested and requested in allowed:
        return requested
    default = get_default_model(api_key)
    return default if default in allowed else allowed[0]
