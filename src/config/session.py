"""
Per-session credentials.

Keys can come from two places:

* the server's .env  - shared by everyone, set once at deploy time
* the browser session - typed into the settings panel, held in memory only

Session values take precedence, are never written to disk, and disappear
when the session expires. Resolution happens through a ContextVar so the
agents can stay unaware of where a key came from.
"""

from contextlib import contextmanager
from contextvars import ContextVar
from dataclasses import dataclass

from src.config import settings


@dataclass(frozen=True)
class Credentials:
    groq_api_key: str | None = None
    database_url: str | None = None
    tavily_api_key: str | None = None
    aviationstack_api_key: str | None = None
    openweather_api_key: str | None = None


EMPTY = Credentials()

_current: ContextVar[Credentials] = ContextVar("travelbrain_credentials", default=EMPTY)


class MissingCredentialsError(RuntimeError):
    """Raised when a required key is configured in neither .env nor the session."""

    def __init__(self, missing: list[str]):
        self.missing = missing

        super().__init__(
            "Missing credentials: "
            + ", ".join(missing)
            + ". Add them in Settings, or set them in the server's .env file."
        )


def get_credentials() -> Credentials:
    return _current.get()


@contextmanager
def use_credentials(credentials: Credentials | None):
    """Bind session credentials for the duration of one request."""

    token = _current.set(credentials or EMPTY)

    try:
        yield
    finally:
        _current.reset(token)


# =========================
# Resolution
# =========================

def resolve_groq_api_key() -> str | None:
    return get_credentials().groq_api_key or settings.GROQ_API_KEY


def resolve_database_url() -> str | None:
    url = get_credentials().database_url or settings.DATABASE_URL
    return settings.normalize_database_url(url) if url else None


def resolve_tavily_api_key() -> str | None:
    return get_credentials().tavily_api_key or settings.TAVILY_API_KEY


def resolve_aviationstack_api_key() -> str | None:
    return (
        get_credentials().aviationstack_api_key
        or getattr(settings, "AVIATIONSTACK_API_KEY", None)
        or getattr(settings, "AVIATION_STACK_API_KEY", None)
    )


def resolve_openweather_api_key() -> str | None:
    return get_credentials().openweather_api_key or settings.OPENWEATHER_API_KEY


def require(*names: str) -> None:
    """Raise MissingCredentialsError listing whichever of these is absent."""

    resolvers = {
        "GROQ_API_KEY": resolve_groq_api_key,
        "DATABASE_URL": resolve_database_url,
        "TAVILY_API_KEY": resolve_tavily_api_key,
        "AVIATIONSTACK_API_KEY": resolve_aviationstack_api_key,
        "OPENWEATHER_API_KEY": resolve_openweather_api_key,
    }

    missing = [name for name in names if name in resolvers and not resolvers[name]()]

    if missing:
        raise MissingCredentialsError(missing)


# =========================
# Status, for the connection UI
# =========================

CREDENTIAL_LABELS = {
    "GROQ_API_KEY": {
        "id": "groq",
        "name": "Groq API",
        "tag": "Core Agent LLM",
        "label": "Groq API Key",
        "hint": "Powers the multi-agent LLM reasoning, itinerary synthesis, and agent conversations.",
        "placeholder": "gsk_...",
        "link": "https://console.groq.com/keys",
    },
    "TAVILY_API_KEY": {
        "id": "tavily",
        "name": "Tavily Search API",
        "tag": "Live Web Search",
        "label": "Tavily API Key",
        "hint": "Empowers Hotel and Itinerary Agents to fetch verified accommodation pricing, real attractions, and local insights.",
        "placeholder": "tvly-...",
        "link": "https://tavily.com",
    },
    "AVIATIONSTACK_API_KEY": {
        "id": "aviationstack",
        "name": "AviationStack API",
        "tag": "Flight & Airport Intelligence",
        "label": "AviationStack API Key",
        "hint": "Empowers Flight Agent via MCP to query live airline routes, IATA/ICAO airport directories, and flight schedules.",
        "placeholder": "Enter AviationStack Access Key",
        "link": "https://aviationstack.com",
    },
    "OPENWEATHER_API_KEY": {
        "id": "openweather",
        "name": "OpenWeather API",
        "tag": "Meteorological Forecasts",
        "label": "OpenWeather API Key",
        "hint": "Empowers Weather Agent via MCP to retrieve live meteorological observations, temperature trends, and packing advice.",
        "placeholder": "Enter OpenWeather API Key",
        "link": "https://openweathermap.org/api",
    },
    "DATABASE_URL": {
        "id": "database",
        "name": "PostgreSQL Database",
        "tag": "Persistence & Checkpoints",
        "label": "PostgreSQL Connection URL",
        "hint": "Stores conversation checkpoints, journey history, and user authentication accounts (Neon, Supabase, etc.).",
        "placeholder": "postgresql://user:password@host:5432/dbname",
        "link": "https://neon.tech",
    },
}


def credential_status() -> dict:
    """
    Describe what is configured and where it came from, without ever
    returning the secret itself.
    """

    session = get_credentials()

    sources = {
        "GROQ_API_KEY": (
            "session" if session.groq_api_key
            else "env" if settings.GROQ_API_KEY
            else None
        ),
        "TAVILY_API_KEY": (
            "session" if session.tavily_api_key
            else "env" if settings.TAVILY_API_KEY
            else None
        ),
        "AVIATIONSTACK_API_KEY": (
            "session" if session.aviationstack_api_key
            else "env" if getattr(settings, "AVIATIONSTACK_API_KEY", None)
            else None
        ),
        "OPENWEATHER_API_KEY": (
            "session" if session.openweather_api_key
            else "env" if settings.OPENWEATHER_API_KEY
            else None
        ),
        "DATABASE_URL": (
            "session" if session.database_url
            else "env" if settings.DATABASE_URL
            else None
        ),
    }

    credentials = {
        name: {
            **CREDENTIAL_LABELS[name],
            "configured": source is not None,
            "source": source,
        }
        for name, source in sources.items()
    }

    ready = sources["GROQ_API_KEY"] is not None
    missing = [name for name, source in sources.items() if source is None]
    connected_count = sum(1 for source in sources.values() if source is not None)

    return {
        "ready": ready,
        "connected_count": connected_count,
        "total_count": len(sources),
        "missing": missing,
        "credentials": credentials,
    }
