"""Layout CSS for chat + evaluation split view."""

SPLIT_LAYOUT_CSS = """
<style>
/* Prevent horizontal scroll / left clipping */
.stApp,
section.main,
section.main .block-container,
section.main [data-testid="stVerticalBlock"],
section.main [data-testid="stHorizontalBlock"] {
  overflow-x: clip !important;
  max-width: 100vw !important;
}

/* Chat thread column */
section.main [data-testid="column"]:has(.trace-chat-thread) {
  flex: 1 1 0% !important;
  min-width: 0 !important;
  padding: 0 !important;
  overflow-x: hidden !important;
}

/* Evaluation column */
section.main [data-testid="column"]:has(.trace-eval-col) {
  flex: 0 0 22rem !important;
  width: 22rem !important;
  max-width: 22rem !important;
  min-width: 22rem !important;
  background: var(--trace-sidebar) !important;
  border-left: 1px solid var(--trace-border) !important;
  padding: 0.75rem 1rem 1.5rem !important;
  overflow-x: hidden !important;
}

/* Pair: thread column immediately before eval column */
section.main [data-testid="stHorizontalBlock"]:has(.trace-eval-col) {
  gap: 0 !important;
  align-items: stretch !important;
  width: 100% !important;
}

/* Composer sits under thread only (not under eval column) */
body:has(.trace-eval-col) div[data-testid="stBottom"],
body:has(.trace-eval-col) div[data-testid="stBottomBlockContainer"] {
  padding-right: 22rem !important;
  box-sizing: border-box !important;
}

body:has(.trace-eval-col) .stChatInput > div,
body:has(.trace-eval-col) [data-testid="stChatInput"] > div {
  width: min(36rem, 100%) !important;
  max-width: min(36rem, 100%) !important;
  margin-left: auto !important;
  margin-right: auto !important;
}

/* Hide streamlitApp / footer noise */
iframe[title="streamlitApp"],
[data-testid="stBottom"] [data-testid="stCaptionContainer"],
[data-testid="stBottom"] small,
[data-testid="stElementContainer"]:has(iframe) {
  display: none !important;
  height: 0 !important;
  visibility: hidden !important;
}
</style>
"""


def inject_split_layout_css() -> None:
    import streamlit as st

    st.markdown(SPLIT_LAYOUT_CSS, unsafe_allow_html=True)
