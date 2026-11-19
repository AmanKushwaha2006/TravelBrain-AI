"""
In-memory store for credentials a user typed into the settings panel.

Deliberately NOT backed by Redis or PostgreSQL: these are live API keys and
database URLs, and this store is the one place they exist on the server.
Keeping them in process memory means they are never written to disk, never
replicated, and are gone when the process restarts.
"""

import os
import secrets
import threading
import time

from src.config import settings
from src.config.session import Credentials

SESSION_COOKIE = "travelbrain_session"

# How long an idle session keeps its keys.
SESSION_TTL_SECONDS = 12 * 3600

# Guard against unbounded growth from repeated cookie-less requests.
MAX_SESSIONS = 500


_lock = threading.Lock()
_sessions: dict[str, dict] = {}


def new_session_id() -> str:
    return secrets.token_urlsafe(24)


def _prune(now: float) -> None:
    """Caller must hold the lock."""

    expired = [
        sid for sid, entry in _sessions.items()
        if entry["expires_at"] <= now
    ]

    for sid in expired:
        del _sessions[sid]

    if len(_sessions) > MAX_SESSIONS:
        oldest = sorted(_sessions, key=lambda sid: _sessions[sid]["expires_at"])

        for sid in oldest[: len(_sessions) - MAX_SESSIONS]:
            del _sessions[sid]


def get_credentials_for(session_id: str | None) -> Credentials | None:
    if not session_id:
        return None

    now = time.time()

    with _lock:
        _prune(now)

        entry = _sessions.get(session_id)

        if entry is None:
            return None

        # Sliding expiry: an active session stays alive.
        entry["expires_at"] = now + SESSION_TTL_SECONDS

        return entry["credentials"]


def store_credentials(
    session_id: str,
    groq_api_key: str | None = None,
    database_url: str | None = None,
    tavily_api_key: str | None = None,
    aviationstack_api_key: str | None = None,
    openweather_api_key: str | None = None,
) -> Credentials:
    """
    Merge new values into the session. Passing None leaves a field
    untouched; passing "" clears it.
    """

    now = time.time()

    with _lock:
        _prune(now)

        existing = _sessions.get(session_id, {}).get("credentials", Credentials())

        merged_groq = _merge(existing.groq_api_key, groq_api_key)
        merged_db = _merge(existing.database_url, database_url)
        merged_tavily = _merge(existing.tavily_api_key, tavily_api_key)
        merged_aviation = _merge(existing.aviationstack_api_key, aviationstack_api_key)
        merged_weather = _merge(existing.openweather_api_key, openweather_api_key)

        credentials = Credentials(
            groq_api_key=merged_groq,
            database_url=merged_db,
            tavily_api_key=merged_tavily,
            aviationstack_api_key=merged_aviation,
            openweather_api_key=merged_weather,
        )

        _sessions[session_id] = {
            "credentials": credentials,
            "expires_at": now + SESSION_TTL_SECONDS,
        }

        # Propagate configured keys to environment & runtime settings
        # so that MCP clients/subprocesses inherit active credentials
        if merged_groq:
            os.environ["GROQ_API_KEY"] = merged_groq
            settings.GROQ_API_KEY = merged_groq
        if merged_db:
            os.environ["DATABASE_URL"] = merged_db
            settings.DATABASE_URL = merged_db
        if merged_tavily:
            os.environ["TAVILY_API_KEY"] = merged_tavily
            settings.TAVILY_API_KEY = merged_tavily
        if merged_aviation:
            os.environ["AVIATION_STACK_API_KEY"] = merged_aviation
            os.environ["AVIATIONSTACK_API_KEY"] = merged_aviation
            settings.AVIATIONSTACK_API_KEY = merged_aviation
        if merged_weather:
            os.environ["OPENWEATHER_API_KEY"] = merged_weather
            settings.OPENWEATHER_API_KEY = merged_weather

        return credentials


def _merge(current: str | None, incoming: str | None) -> str | None:
    if incoming is None:
        return current

    incoming = incoming.strip()

    return incoming or None


def clear_credentials(session_id: str | None) -> None:
    if not session_id:
        return

    with _lock:
        _sessions.pop(session_id, None)


def active_session_count() -> int:
    with _lock:
        _prune(time.time())
        return len(_sessions)
