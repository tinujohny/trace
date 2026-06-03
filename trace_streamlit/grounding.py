from __future__ import annotations

import re

URL_PATTERN = re.compile(r"https?://[^\s<>\"{}|\\^`\[\]]+", re.I)


def parse_source_urls(text: str) -> list[str]:
    parts = re.split(r"[\n,]+", text)
    seen: set[str] = set()
    urls: list[str] = []
    for part in parts:
        part = part.strip()
        if not part:
            continue
        match = URL_PATTERN.search(part)
        candidate = match.group(0) if match else part
        if candidate in seen:
            continue
        if candidate.startswith(("http://", "https://")):
            seen.add(candidate)
            urls.append(candidate)
    return urls


def build_grounding_prompt_block(urls: list[str]) -> str:
    if not urls:
        return ""
    lines = "\n".join(f"{i + 1}. {u}" for i, u in enumerate(urls))
    return (
        "Reference URLs provided by the user (use these to inform each claim's "
        f'"source" field; cite which URL applies when relevant):\n{lines}\n\n'
    )
