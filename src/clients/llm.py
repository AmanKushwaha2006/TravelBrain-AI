"""Groq chat model, resolved per session and cached per distinct key."""

from functools import lru_cache

from langchain_groq import ChatGroq

from src.config.session import require, resolve_groq_api_key
from src.config.settings import GROQ_MODEL


def extract_message_content(message) -> str:
    """Extract clean string content from an AIMessage, supporting reasoning models and content blocks."""
    if message is None:
        return ""

    content = getattr(message, "content", "")
    if isinstance(content, str) and content.strip():
        return content.strip()

    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, dict):
                if block.get("type") == "text":
                    parts.append(block.get("text", ""))
                elif "text" in block:
                    parts.append(str(block["text"]))
            elif isinstance(block, str):
                parts.append(block)
        joined = "\n".join(parts).strip()
        if joined:
            return joined

    # Check additional_kwargs for reasoning or alternative model outputs
    add_kwargs = getattr(message, "additional_kwargs", {}) or {}
    if add_kwargs.get("reasoning_content"):
        return str(add_kwargs["reasoning_content"]).strip()

    return str(content).strip() if content else ""


@lru_cache(maxsize=8)
def _build_llm(model: str, api_key: str) -> ChatGroq:
    return ChatGroq(model=model, api_key=api_key, temperature=0.1)


def get_llm() -> ChatGroq:
    """
    The key comes from the current session if one supplied it, otherwise
    from the server's .env. One client is reused per distinct key.
    """

    require("GROQ_API_KEY")

    return _build_llm(GROQ_MODEL, resolve_groq_api_key())
