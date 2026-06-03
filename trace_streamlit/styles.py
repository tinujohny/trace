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
  --trace-thread-max: 48rem;
  --trace-composer-max: min(52rem, calc(100vw - 19rem));
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
  padding-bottom: 7.5rem !important;
  max-width: 100% !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

/* Marker only — real thread is the column that contains it */
.trace-chat-thread {
  display: none !important;
}

.trace-chat-column {
  width: 100%;
  max-width: var(--trace-composer-max);
  margin: 0 auto;
  padding: 0 1.25rem;
  box-sizing: border-box;
}

/* Bottom chat composer — full-width bar, wide centered pill */
div[data-testid="stBottom"],
div[data-testid="stBottomBlockContainer"] {
  width: 100% !important;
  background: var(--trace-bg) !important;
}

.stChatInput,
[data-testid="stChatInput"] {
  background: var(--trace-bg) !important;
  border-top: 1px solid var(--trace-border) !important;
  padding: 1rem 1.25rem 1.5rem !important;
  width: 100% !important;
  max-width: 100% !important;
}

/* Hide Streamlit's small caption above the input */
.stChatInput p,
.stChatInput label,
[data-testid="stChatInput"] p,
[data-testid="stChatInput"] label {
  display: none !important;
  height: 0 !important;
  margin: 0 !important;
}

/* Outer pill shell */
.stChatInput > div,
[data-testid="stChatInput"] > div {
  width: var(--trace-composer-max) !important;
  max-width: calc(100% - 2.5rem) !important;
  margin: 0 auto !important;
  background: var(--trace-composer) !important;
  border: 1px solid var(--trace-border) !important;
  border-radius: 1.75rem !important;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.2) !important;
  min-height: 3.25rem !important;
  padding: 0.5rem 0.65rem 0.5rem 1.15rem !important;
  display: flex !important;
  align-items: flex-end !important;
  gap: 0.5rem !important;
  box-sizing: border-box !important;
}

/* Inner wrappers — no nested dark box (only the outer pill has background) */
.stChatInput > div > div,
[data-testid="stChatInput"] > div > div,
.stChatInput [data-testid="stTextArea"],
.stChatInput [data-testid="stTextArea"] > div,
.stChatInput [data-testid="stTextArea"] > div > div,
.stChatInput [data-testid="stTextArea"] fieldset,
.stChatInput div[class*="stTextArea"],
.stChatInput div[class*="stTextArea"] > div,
[data-testid="stChatInput"] [data-testid="stTextArea"],
[data-testid="stChatInput"] [data-testid="stTextArea"] > div,
[data-testid="stChatInput"] [data-testid="stTextArea"] > div > div,
[data-testid="stChatInput"] div[class*="stTextArea"],
.stChatInput div[data-baseweb="base-input"],
.stChatInput div[data-baseweb="textarea"],
[data-testid="stChatInput"] div[data-baseweb="base-input"],
[data-testid="stChatInput"] div[data-baseweb="textarea"] {
  flex: 1 1 auto !important;
  width: 100% !important;
  min-width: 0 !important;
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  outline: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

.stChatInput textarea,
[data-testid="stChatInput"] textarea {
  width: 100% !important;
  min-height: 1.75rem !important;
  max-height: 10rem !important;
  color: var(--trace-text) !important;
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  font-size: 1rem !important;
  line-height: 1.5 !important;
  padding: 0.35rem 0 !important;
  resize: none !important;
  -webkit-box-shadow: none !important;
}

/* Streamlit theme paints a darker rectangle on textarea containers — override */
.stChatInput [data-testid="stTextArea"] textarea,
[data-testid="stChatInput"] [data-testid="stTextArea"] textarea {
  background-color: transparent !important;
  border-radius: 0 !important;
}

.stChatInput textarea::placeholder,
[data-testid="stChatInput"] textarea::placeholder {
  color: var(--trace-text-muted) !important;
  opacity: 0.85 !important;
}

.stChatInput button,
[data-testid="stChatInput"] button {
  flex-shrink: 0 !important;
  width: 2.25rem !important;
  height: 2.25rem !important;
  min-width: 2.25rem !important;
  min-height: 2.25rem !important;
  margin: 0 0 0.1rem 0 !important;
  padding: 0 !important;
  background: var(--trace-text) !important;
  color: #000 !important;
  border-radius: 50% !important;
  border: none !important;
}

.stChatInput button svg,
[data-testid="stChatInput"] button svg {
  width: 1rem !important;
  height: 1rem !important;
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

/* Select / inputs (not chat composer) */
.stSelectbox > div > div,
.stTextInput > div > div > input,
section[data-testid="stSidebar"] .stTextArea textarea,
.trace-batch-wrap .stTextArea textarea {
  background: var(--trace-composer) !important;
  color: var(--trace-text) !important;
  border-color: var(--trace-border) !important;
  border-radius: 8px !important;
}

/* Hide footer app label under composer */
div[data-testid="stBottom"] [data-testid="stCaptionContainer"],
div[data-testid="stBottom"] small {
  display: none !important;
}

/* Trace layout */
.trace-shell-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--trace-text-muted);
  text-align: center;
  margin: 0 0 1rem;
}

.trace-context-badge {
  display: block;
  text-align: center;
  font-size: 0.75rem;
  color: var(--trace-text-muted);
  margin: 0 auto 0.75rem;
  padding: 0.35rem 0.75rem;
  max-width: var(--trace-thread-max);
  background: var(--trace-composer);
  border: 1px solid var(--trace-border);
  border-radius: 999px;
  width: fit-content;
}

.trace-context-badge span {
  color: var(--trace-text);
  font-weight: 500;
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

.trace-suggestions-wrap {
  width: 100%;
  max-width: var(--trace-composer-max);
  margin: 0 auto;
  padding: 0 1.25rem;
  box-sizing: border-box;
}

/* Suggestion chips — match composer width */
section.main .stButton > button {
  min-height: 3rem !important;
  padding: 0.75rem 1rem !important;
  text-align: left !important;
  line-height: 1.4 !important;
  white-space: normal !important;
  height: auto !important;
}

/* Message bands — stay inside column (no 100vw bleed) */
.trace-msg-row {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 1.1rem 0;
  box-sizing: border-box;
  overflow-wrap: anywhere;
}

.trace-msg-row.user {
  background: var(--trace-user-band);
}

.trace-msg-row.assistant {
  background: var(--trace-bg);
}

/* Native Streamlit chat bubbles (marker lives in thread container/column) */
section.main:has(.trace-chat-thread) [data-testid="stChatMessage"] {
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0.75rem 1rem !important;
  background: transparent !important;
  border: none !important;
  overflow-x: hidden !important;
  box-sizing: border-box !important;
}

section.main:has(.trace-chat-thread) [data-testid="stChatMessage"] [data-testid="stChatMessageAvatar"] {
  display: none !important;
}

section.main:has(.trace-chat-thread) [data-testid="stChatMessage"] > div:last-child {
  max-width: var(--trace-thread-max) !important;
  margin: 0 auto !important;
  padding: 0 1rem !important;
  width: 100% !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
}

section.main:has(.trace-chat-thread) [data-testid="stChatMessage"][aria-label="Chat message from user"] {
  background: var(--trace-user-band) !important;
  margin: 0 !important;
  padding: 1rem 1.25rem !important;
  width: 100% !important;
}

section.main:has(.trace-chat-thread) [data-testid="stChatMessage"][aria-label="Chat message from assistant"] {
  background: var(--trace-bg) !important;
  padding: 1rem 1.25rem !important;
}

section.main:has(.trace-chat-thread) [data-testid="stMarkdownContainer"],
section.main:has(.trace-chat-thread) [data-testid="stMarkdown"] {
  width: 100% !important;
  max-width: 100% !important;
  overflow-wrap: anywhere !important;
  word-break: break-word !important;
}

.trace-msg-inner {
  max-width: var(--trace-thread-max);
  margin: 0 auto;
  padding: 0 1.25rem;
  line-height: 1.65;
  color: var(--trace-text);
  font-size: 0.9375rem;
  text-align: left;
}

.trace-msg-body,
.trace-msg-body p {
  margin: 0;
  text-align: left;
  line-height: 1.65;
  word-wrap: break-word;
}

.trace-msg-footer {
  font-size: 0.75rem;
  color: var(--trace-text-muted);
  margin: 0.75rem 0 0;
  text-align: left;
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
  border-radius: 2px;
  padding: 0 1px;
  line-height: inherit;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  cursor: default;
}

.trace-claim.active {
  background: var(--trace-claim-active);
  box-shadow: 0 0 0 1px var(--trace-claim-border);
}

.trace-claim-wrap {
  display: inline;
  white-space: inherit;
}

.trace-claim-check {
  color: #22c55e;
  font-weight: 700;
  line-height: 1;
}

/* Inline chat — sit on text line, outside underline */
.trace-claim-check--inline {
  display: inline-block;
  font-size: 0.85em;
  margin-right: 0.12em;
  vertical-align: middle;
  transform: translateY(0.06em);
}

.trace-claim-check-spacer {
  display: inline-block;
  width: 0.85rem;
}

.trace-claim-list {
  display: none !important;
}

/* Eval panel — center tick beside claim button */
section.main [data-testid="column"]:has(.trace-eval-col) [data-testid="stHorizontalBlock"] {
  align-items: center !important;
}

section.main [data-testid="column"]:has(.trace-eval-col)
  [data-testid="stHorizontalBlock"] > [data-testid="column"]:first-child {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  align-self: center !important;
  padding-top: 0 !important;
}

section.main [data-testid="column"]:has(.trace-eval-col)
  [data-testid="stHorizontalBlock"] > [data-testid="column"]:first-child
  [data-testid="stMarkdownContainer"],
section.main [data-testid="column"]:has(.trace-eval-col)
  [data-testid="stHorizontalBlock"] > [data-testid="column"]:first-child
  [data-testid="stMarkdown"] {
  margin: 0 !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-height: 0 !important;
}

.trace-claim-check--panel {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  width: 1rem;
  height: 1rem;
  margin: 0;
  transform: none;
}

section.main [data-testid="column"]:has(.trace-eval-col) .stButton > button {
  text-align: left !important;
  white-space: normal !important;
  line-height: 1.35 !important;
  min-height: 2.5rem !important;
}

/* Eval column — Streamlit widgets only (no mixed HTML shell) */
.trace-eval-col {
  display: none !important;
}

section.main [data-testid="column"]:has(.trace-eval-col) h3 {
  font-size: 0.875rem !important;
  font-weight: 600 !important;
  color: var(--trace-text) !important;
  margin: 0 0 0.25rem !important;
}

section.main [data-testid="column"]:has(.trace-eval-col) .eval-sub {
  font-size: 0.75rem;
  color: var(--trace-text-muted);
  margin: 0 0 1rem;
}

section.main [data-testid="column"]:has(.trace-eval-col) div[data-testid="stRadio"] label {
  text-align: left !important;
  font-size: 0.8125rem !important;
  line-height: 1.35 !important;
  padding: 0.5rem 0.6rem !important;
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

/* Default column padding (split layout overrides in layout.py) */
section.main div[data-testid="column"] {
  padding-top: 0 !important;
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
