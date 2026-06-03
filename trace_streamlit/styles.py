"""ChatGPT-like custom CSS for Streamlit."""

CHATGPT_CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

:root {
  --trace-bg: #212121;
  --trace-sidebar: #171717;
  --trace-user-band: #303030;
  --trace-composer: #2f2f2f;
  --trace-border: rgba(255,255,255,0.1);
  --trace-text: #ececec;
  --trace-text-muted: #b4b4b4;
  --trace-accent: #10a37f;
  --trace-claim-border: #58a6ff;
  --trace-claim-bg: rgba(88,166,255,0.12);
  --trace-claim-active: rgba(88,166,255,0.28);
  --trace-thread-max: 42rem;
  --trace-eval-width: 100%;
}

/* App chrome */
.stApp {
  background-color: var(--trace-bg) !important;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif !important;
}

header[data-testid="stHeader"] {
  background: transparent !important;
  border: none !important;
}

#MainMenu, footer, .stDeployButton {
  visibility: hidden !important;
  height: 0 !important;
}

/* Sidebar */
section[data-testid="stSidebar"] {
  background-color: var(--trace-sidebar) !important;
  border-right: 1px solid var(--trace-border) !important;
}

section[data-testid="stSidebar"] .stMarkdown,
section[data-testid="stSidebar"] label,
section[data-testid="stSidebar"] p {
  color: var(--trace-text) !important;
}

section[data-testid="stSidebar"] .stTextArea textarea,
section[data-testid="stSidebar"] .stSelectbox > div > div {
  background: var(--trace-composer) !important;
  color: var(--trace-text) !important;
  border-color: var(--trace-border) !important;
  border-radius: 8px !important;
}

section[data-testid="stSidebar"] hr {
  border-color: var(--trace-border) !important;
  margin: 0.75rem 0 !important;
}

section[data-testid="stSidebar"] h1 {
  font-size: 1rem !important;
  font-weight: 600 !important;
  color: var(--trace-text) !important;
  padding-top: 0.25rem !important;
}

/* Sidebar nav radios → compact links */
section[data-testid="stSidebar"] div[data-testid="stRadio"] label {
  background: transparent !important;
  border: 1px solid var(--trace-border) !important;
  border-radius: 8px !important;
  padding: 0.5rem 0.75rem !important;
  margin-bottom: 0.35rem !important;
}

section[data-testid="stSidebar"] div[data-testid="stRadio"] label:hover {
  background: var(--trace-composer) !important;
}

/* Main blocks */
.main .block-container {
  padding-top: 1rem !important;
  padding-bottom: 6rem !important;
  max-width: 100% !important;
}

/* Chat input — pill composer */
.stChatInput {
  background: var(--trace-bg) !important;
  border-top: 1px solid var(--trace-border) !important;
  padding: 0.75rem 1rem 1.25rem !important;
}

.stChatInput > div {
  max-width: var(--trace-thread-max) !important;
  margin: 0 auto !important;
  background: var(--trace-composer) !important;
  border: 1px solid var(--trace-border) !important;
  border-radius: 1.5rem !important;
}

.stChatInput textarea {
  color: var(--trace-text) !important;
  background: transparent !important;
}

.stChatInput button {
  background: var(--trace-text) !important;
  color: #000 !important;
  border-radius: 50% !important;
}

/* Hide default chat avatars for custom layout */
div[data-testid="stChatMessage"] {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
}

/* Buttons */
.stButton > button {
  border-radius: 8px !important;
  border: 1px solid var(--trace-border) !important;
  background: var(--trace-composer) !important;
  color: var(--trace-text) !important;
  font-weight: 500 !important;
}

.stButton > button[kind="primary"] {
  background: var(--trace-accent) !important;
  border-color: var(--trace-accent) !important;
  color: #fff !important;
}

/* Select / inputs in main */
.stSelectbox > div > div,
.stTextInput > div > div > input,
.stTextArea textarea {
  background: var(--trace-composer) !important;
  color: var(--trace-text) !important;
  border-color: var(--trace-border) !important;
  border-radius: 8px !important;
}

/* Trace layout */
.trace-shell-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--trace-text-muted);
  text-align: center;
  margin: 0 0 1rem;
}

.trace-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 2rem 1rem;
}

.trace-empty h2 {
  font-size: 1.75rem;
  font-weight: 500;
  color: var(--trace-text);
  margin: 0 0 1.5rem;
}

.trace-suggestions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  width: 100%;
  max-width: var(--trace-thread-max);
}

.trace-msg-row {
  width: 100%;
  padding: 1.25rem 0;
  border-bottom: 1px solid transparent;
}

.trace-msg-row.user {
  background: var(--trace-user-band);
}

.trace-msg-row.assistant {
  background: var(--trace-bg);
}

.trace-msg-inner {
  max-width: var(--trace-thread-max);
  margin: 0 auto;
  padding: 0 1.5rem;
  line-height: 1.6;
  color: var(--trace-text);
  font-size: 0.9375rem;
}

.trace-msg-label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--trace-text-muted);
  margin-bottom: 0.35rem;
}

.trace-claim {
  display: inline;
  background: var(--trace-claim-bg);
  border-bottom: 2px solid var(--trace-claim-border);
  border-radius: 4px;
  padding: 0 2px;
  cursor: default;
}

.trace-claim.active {
  background: var(--trace-claim-active);
  box-shadow: 0 0 0 1px var(--trace-claim-border);
}

.trace-eval-panel {
  background: var(--trace-sidebar);
  border-left: 1px solid var(--trace-border);
  border-radius: 0;
  padding: 1rem 1.25rem;
  min-height: 70vh;
  position: sticky;
  top: 0;
}

.trace-eval-panel h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--trace-text);
  margin: 0 0 0.25rem;
}

.trace-eval-sub {
  font-size: 0.75rem;
  color: var(--trace-text-muted);
  margin: 0 0 1rem;
}

.trace-signal-block {
  margin-bottom: 1rem;
}

.trace-signal-block h4 {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--trace-text-muted);
  margin: 0 0 0.35rem;
}

.trace-signal-block p {
  font-size: 0.8125rem;
  color: var(--trace-text-muted);
  margin: 0;
  line-height: 1.5;
}

.trace-quote {
  border-left: 2px solid var(--trace-claim-border);
  padding-left: 0.75rem;
  margin: 0 0 1rem;
  font-size: 0.875rem;
  color: var(--trace-text);
}

.trace-badge {
  display: inline-block;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  margin-bottom: 0.75rem;
}

.trace-badge.calibrating {
  background: rgba(16,163,127,0.2);
  color: var(--trace-accent);
}

.trace-confidence {
  font-size: 0.75rem;
  color: var(--trace-accent);
  margin-bottom: 0.75rem;
}

/* Batch page */
.trace-batch-wrap {
  max-width: 48rem;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Streamlit columns gap */
div[data-testid="column"] {
  padding: 0 !important;
}

.stAlert {
  background: var(--trace-composer) !important;
  border-color: var(--trace-border) !important;
  color: var(--trace-text) !important;
}
</style>
"""


def inject_styles() -> None:
    import streamlit as st

    st.markdown(CHATGPT_CSS, unsafe_allow_html=True)
