"""Single decision point for which DB backend holds shared key/value state.

webapp.py picks `database` (Postgres) when DATABASE_URL is set and `db` (SQLite)
otherwise. Modules that write state the webapp later reads — Goethe session
cookies above all — must resolve the backend by the same rule, or writes land in
one store and reads come from the other.

Only state helpers are routed here. `db` remains the queue/student store because
`database` does not implement the queue functions.
"""
import os


def backend():
    """Return the module webapp.py would import for state access."""
    url = os.environ.get("DATABASE_URL", "").strip()
    if url.startswith("postgresql://") or url.startswith("postgres://"):
        import database

        return database
    import db

    return db


def get_state(key: str, default: str = "") -> str:
    return backend().get_state(key, default)


def set_state(key: str, value: str):
    backend().set_state(key, value)


def delete_state(key: str):
    backend().delete_state(key)
