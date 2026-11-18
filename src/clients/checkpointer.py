"""PostgreSQL checkpointer used by LangGraph to persist conversation threads."""

from functools import lru_cache

import psycopg
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool
from langgraph.checkpoint.postgres import PostgresSaver

from src.config.session import require, resolve_database_url


@lru_cache(maxsize=4)
def get_pool(database_url: str) -> ConnectionPool:
    pool = ConnectionPool(
        database_url,
        min_size=1,
        max_size=5,
        max_idle=120,
        max_lifetime=1800,
        check=ConnectionPool.check_connection,
        kwargs={
            "autocommit": True,
            "row_factory": dict_row,
            "keepalives": 1,
            "keepalives_idle": 30,
            "keepalives_interval": 10,
            "keepalives_count": 5,
        },
    )
    return pool


def get_connection(database_url: str) -> psycopg.Connection:
    """Creates a standalone psycopg connection for direct queries."""
    return psycopg.connect(
        database_url,
        autocommit=True,
        row_factory=dict_row,
    )


@lru_cache(maxsize=4)
def get_checkpointer(database_url: str):
    if not database_url or not str(database_url).strip():
        from langgraph.checkpoint.memory import MemorySaver
        return MemorySaver()
    try:
        pool = get_pool(database_url)
        checkpointer = PostgresSaver(pool)
        checkpointer.setup()
        return checkpointer
    except Exception as e:
        print(f"[checkpointer] Postgres checkpointer setup warning: {e}. Falling back to MemorySaver.")
        from langgraph.checkpoint.memory import MemorySaver
        return MemorySaver()


def get_session_checkpointer() -> PostgresSaver:
    """Checkpointer for whichever database URL the current session resolves to."""
    require("DATABASE_URL")
    return get_checkpointer(resolve_database_url())
