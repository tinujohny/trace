# Trace

Evaluation layer for AI chat: each **claim** in an assistant answer gets five signals (source, reasoning, assumptions, confidence, uncertainty). **Calibration mode** lets users predict trust / verify / skip before signals are revealed.

## Deploy on Streamlit (recommended)

[![Streamlit App](https://static.streamlit.io/badges/streamlit_badge_black_white.svg)](https://share.streamlit.io)

### Streamlit Community Cloud

1. Push this repo to GitHub.
2. Go to [share.streamlit.io](https://share.streamlit.io) → **New app**.
3. Set **Main file path** to `streamlit_app.py`.
4. Under **Advanced settings → Secrets**, add:

```toml
OPENAI_API_KEY = "your-openai-or-groq-key"
# Groq keys (gsk_...) are auto-detected
OPENAI_MODEL = "llama-3.3-70b-versatile"
```

5. Deploy. The app runs without Node.js.

### Run locally (Streamlit)

```bash
pip install -r requirements.txt
cp .streamlit/secrets.toml.example .streamlit/secrets.toml
# Edit secrets.toml with your API key
streamlit run streamlit_app.py
```

## Next.js app (full prototype)

The original UI (Phases 0–9) is the Next.js app under `src/`:

```bash
npm install
cp .env.example .env.local   # add OPENAI_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API (Next.js only)

| Endpoint | Description |
|----------|-------------|
| `POST /api/evaluate` | Evaluate assistant text |
| `POST /api/evaluate/batch` | Batch document evaluation |
| `GET /api/v1/trace` | API manifest |

SDK: `src/sdk/trace-client.ts`

## Docs

- [architecture.md](./architecture.md)
- [docs/PHASES.md](./docs/PHASES.md)
