"""
Database table definitions for auth & travel history.

Creates tables via CREATE TABLE IF NOT EXISTS — safe to call on every startup.
Does NOT touch LangGraph checkpoint tables.
"""

_SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token_hash TEXT NOT NULL UNIQUE,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash
    ON user_sessions (session_token_hash);

CREATE INDEX IF NOT EXISTS idx_user_sessions_expires
    ON user_sessions (expires_at);

CREATE TABLE IF NOT EXISTS travel_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       TEXT NOT NULL DEFAULT '',
    query       TEXT NOT NULL DEFAULT '',
    destination TEXT NOT NULL DEFAULT '',
    result      JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_travel_history_user_created
    ON travel_history (user_id, created_at DESC);
"""


def init_auth_tables(pool) -> None:
    """Create auth + history tables if they don't exist."""
    with pool.connection() as conn:
        conn.execute(_SCHEMA_SQL)

