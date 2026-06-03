"""Claim trust helpers (anti-over-skepticism: high confidence + real source)."""
from __future__ import annotations

from typing import Any

_NO_EXTERNAL_SOURCE_MARKERS = (
    "no external source exists",
    "no external source",
)


def is_well_sourced_high_confidence(claim: dict[str, Any]) -> bool:
    """True when confidence is high and source is not a no-external-source placeholder."""
    confidence = str(claim.get("confidence", "")).strip().lower()
    if confidence != "high":
        return False

    source = str(claim.get("source", "")).strip()
    if not source:
        return False

    lower = source.lower()
    return not any(marker in lower for marker in _NO_EXTERNAL_SOURCE_MARKERS)


def trusted_check_html() -> str:
    return '<span class="trace-claim-check trace-claim-check--inline" aria-hidden="true">✓</span>'
