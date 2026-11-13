"""
Password hashing, user CRUD, and session management.

Uses hashlib.scrypt (no extra dependency) for passwords
and SHA-256 for session token storage.
"""

import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta, timezone


# --------------- Password hashing (scrypt) ---------------

def hash_password(password: str) -> str:
    """Return 'salt_hex$scrypt_hex' string."""
    salt = os.urandom(16)
    derived = hashlib.scrypt(
        password.encode(), salt=salt, n=16384, r=8, p=1, dklen=32
    )
    return salt.hex() + "$" + derived.hex()


def verify_password(password: str, stored_hash: str) -> bool:
    """Timing-safe comparison of password against stored hash."""
    try:
        salt_hex, dk_hex = stored_hash.split("$", 1)
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(dk_hex)
    except (ValueError, AttributeError):
        return False

    derived = hashlib.scrypt(
        password.encode(), salt=salt, n=16384, r=8, p=1, dklen=32
    )
    return hmac.compare_digest(derived, expected)


# --------------- Session tokens ---------------

SESSION_LIFETIME_HOURS = 72


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def create_session(pool, user_id: str) -> str:
    """Create a new session row and return the raw token (to set in cookie)."""
    raw_token = secrets.token_urlsafe(48)
    token_hash = _hash_token(raw_token)
    expires = datetime.now(timezone.utc) + timedelta(hours=SESSION_LIFETIME_HOURS)

    with pool.connection() as conn:
        conn.execute(
            """
            INSERT INTO user_sessions (user_id, session_token_hash, expires_at)
            VALUES (%s::uuid, %s, %s)
            """,
            (user_id, token_hash, expires),
        )
    return raw_token


def get_session_user(pool, token: str) -> dict | None:
    """Look up user by raw token. Returns user dict or None."""
    if not token:
        return None

    token_hash = _hash_token(token)
    now = datetime.now(timezone.utc)

    with pool.connection() as conn:
        row = conn.execute(
            """
            SELECT u.id, u.name, u.email, u.created_at
            FROM user_sessions s
            JOIN users u ON u.id = s.user_id
            WHERE s.session_token_hash = %s AND s.expires_at > %s
            """,
            (token_hash, now),
        ).fetchone()

    if not row:
        return None

    return {
        "id": str(row["id"]),
        "name": row["name"],
        "email": row["email"],
        "created_at": row["created_at"].isoformat() if row["created_at"] else None,
    }


def delete_session(pool, token: str) -> None:
    """Invalidate a session by raw token."""
    if not token:
        return
    token_hash = _hash_token(token)
    with pool.connection() as conn:
        conn.execute(
            "DELETE FROM user_sessions WHERE session_token_hash = %s",
            (token_hash,),
        )


def cleanup_expired_sessions(pool) -> int:
    """Delete expired sessions. Returns count deleted."""
    now = datetime.now(timezone.utc)
    with pool.connection() as conn:
        cur = conn.execute(
            "DELETE FROM user_sessions WHERE expires_at <= %s", (now,)
        )
        return cur.rowcount


# --------------- User CRUD ---------------

def create_user(pool, name: str, email: str, password: str) -> dict:
    """
    Create a new user. Raises ValueError on duplicate email.
    Returns user dict (no password_hash).
    """
    pw_hash = hash_password(password)

    with pool.connection() as conn:
        # Check duplicate
        existing = conn.execute(
            "SELECT id FROM users WHERE email = %s", (email,)
        ).fetchone()

        if existing:
            raise ValueError("An account with this email already exists.")

        row = conn.execute(
            """
            INSERT INTO users (name, email, password_hash)
            VALUES (%s, %s, %s)
            RETURNING id, name, email, created_at
            """,
            (name, email, pw_hash),
        ).fetchone()

    return {
        "id": str(row["id"]),
        "name": row["name"],
        "email": row["email"],
        "created_at": row["created_at"].isoformat() if row["created_at"] else None,
    }


def authenticate_user(pool, email: str, password: str) -> dict | None:
    """Verify credentials. Returns user dict or None."""
    with pool.connection() as conn:
        row = conn.execute(
            "SELECT id, name, email, password_hash, created_at FROM users WHERE email = %s",
            (email,),
        ).fetchone()

    if not row:
        return None

    if not verify_password(password, row["password_hash"]):
        return None

    return {
        "id": str(row["id"]),
        "name": row["name"],
        "email": row["email"],
        "created_at": row["created_at"].isoformat() if row["created_at"] else None,
    }

