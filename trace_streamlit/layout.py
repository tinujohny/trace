"""Layout helpers for Streamlit chat + eval split view."""

SPLIT_LAYOUT_CSS = """
<style>
.trace-layout-split [data-testid="stHorizontalBlock"] {
  align-items: flex-start !important;
  gap: 0 !important;
}

.trace-layout-split [data-testid="column"]:first-child {
  flex: 1 1 0% !important;
  min-width: 0 !important;
  padding: 0 !important;
}

.trace-layout-split [data-testid="column"]:last-child {
  flex: 0 0 20rem !important;
  width: 20rem !important;
  max-width: 20rem !important;
  min-width: 20rem !important;
  padding: 0.75rem 1rem 1rem !important;
  background: var(--trace-sidebar) !important;
  border-left: 1px solid var(--trace-border) !important;
  min-height: calc(100vh - 6rem) !important;
}

.trace-layout-split-active {
  --trace-composer-max: min(40rem, calc(100vw - 22rem - 20rem));
}

.trace-layout-split-active .stChatInput > div,
.trace-layout-split-active [data-testid="stChatInput"] > div {
  max-width: var(--trace-composer-max) !important;
  width: var(--trace-composer-max) !important;
  margin-left: max(1rem, calc(16rem + (100vw - 36rem - var(--trace-composer-max)) / 2)) !important;
  margin-right: auto !important;
}
</style>
"""


def inject_split_layout_css() -> None:
    import streamlit as st

    st.markdown(SPLIT_LAYOUT_CSS, unsafe_allow_html=True)
    st.markdown('<div class="trace-layout-split-active" aria-hidden="true"></div>', unsafe_allow_html=True)
