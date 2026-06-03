"""Stub assistant replies and sample evaluations for demo mode."""

CAFFEINE_REPLY = (
    "Moderate coffee consumption (about 3–4 cups per day) is generally considered safe "
    "for most healthy adults. Caffeine can improve alertness and concentration for several "
    "hours. However, high intake may increase anxiety and disrupt sleep if consumed late "
    "in the day. Pregnant people are usually advised to limit caffeine to roughly 200 mg "
    "per day. Individual sensitivity varies, so some people feel effects from a single "
    "espresso while others tolerate more."
)

SOLAR_REPLY = (
    "Solar power is now among the cheapest sources of electricity in many regions. "
    "Utility-scale solar and batteries are being paired to smooth evening demand. "
    "Most national grids still need gas, hydro, or imports for long cloudy stretches. "
    "Full decarbonization timelines depend on transmission upgrades and seasonal storage. "
    "Policy and land use remain major constraints on how fast capacity can scale."
)

FALLBACK_REPLIES = [
    "That's an interesting question. In demo mode, try coffee or solar topics, or add "
    "OPENAI_API_KEY in Streamlit secrets for live answers.",
    "Running without a working API key. Ask about coffee or solar, or configure secrets.",
]


def pick_stub_reply(user_text: str, index: int = 0) -> str:
    t = user_text.lower()
    if any(w in t for w in ("coffee", "caffeine", "espresso", "drink")):
        return CAFFEINE_REPLY
    if any(w in t for w in ("solar", "renewable", "grid", "energy", "power")):
        return SOLAR_REPLY
    return FALLBACK_REPLIES[index % len(FALLBACK_REPLIES)]
