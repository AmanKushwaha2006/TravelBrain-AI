"""
Travel history CRUD — max 10 records per user.
"""

import json


MAX_HISTORY = 10


def save_trip(
    pool,
    user_id: str,
    title: str,
    query: str,
    destination: str,
    result: dict,
) -> dict:
    """
    Save a trip and auto-prune to keep only the newest MAX_HISTORY records.
    Returns the newly created history row.
    """
    result_json = json.dumps(result, default=str)

    with pool.connection() as conn:
        row = conn.execute(
            """
            INSERT INTO travel_history (user_id, title, query, destination, result)
            VALUES (%s::uuid, %s, %s, %s, %s::jsonb)
            RETURNING id, title, destination, query, created_at
            """,
            (user_id, title, query, destination, result_json),
        ).fetchone()

        # Auto-prune: delete everything beyond the newest MAX_HISTORY
        conn.execute(
            """
            DELETE FROM travel_history
            WHERE user_id = %s::uuid
              AND id NOT IN (
                SELECT id FROM travel_history
                WHERE user_id = %s::uuid
                ORDER BY created_at DESC
                LIMIT %s
              )
            """,
            (user_id, user_id, MAX_HISTORY),
        )

    return {
        "id": str(row["id"]),
        "title": row["title"],
        "destination": row["destination"],
        "query": row["query"],
        "created_at": row["created_at"].isoformat() if row["created_at"] else None,
    }


def get_user_history(pool, user_id: str, limit: int = MAX_HISTORY) -> list[dict]:
    """Latest trips for the sidebar."""
    with pool.connection() as conn:
        rows = conn.execute(
            """
            SELECT id, title, destination, query, created_at
            FROM travel_history
            WHERE user_id = %s::uuid
            ORDER BY created_at DESC
            LIMIT %s
            """,
            (user_id, limit),
        ).fetchall()

    return [
        {
            "id": str(r["id"]),
            "title": r["title"],
            "destination": r["destination"],
            "query": r["query"],
            "created_at": r["created_at"].isoformat() if r["created_at"] else None,
        }
        for r in rows
    ]


def get_trip(pool, user_id: str, trip_id: str) -> dict | None:
    """Fetch a single trip with full result. Enforces ownership."""
    with pool.connection() as conn:
        row = conn.execute(
            """
            SELECT id, title, destination, query, result, created_at
            FROM travel_history
            WHERE id = %s::uuid AND user_id = %s::uuid
            """,
            (trip_id, user_id),
        ).fetchone()

    if not row:
        return None

    return {
        "id": str(row["id"]),
        "title": row["title"],
        "destination": row["destination"],
        "query": row["query"],
        "result": row["result"],
        "created_at": row["created_at"].isoformat() if row["created_at"] else None,
    }


def delete_trip(pool, user_id: str, trip_id: str) -> bool:
    """Delete a trip. Returns True if something was deleted."""
    with pool.connection() as conn:
        cur = conn.execute(
            "DELETE FROM travel_history WHERE id = %s::uuid AND user_id = %s::uuid",
            (trip_id, user_id),
        )
        return cur.rowcount > 0

