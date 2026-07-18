"""Regression: shared state must resolve to the same DB backend the webapp uses.

booking_helper imported `db` (SQLite) unconditionally while webapp.py imports
`database` (Postgres) whenever DATABASE_URL is set. The Form Scanner therefore
wrote Goethe cookies into SQLite while /api/goethe-cookies read Postgres, so the
dashboard reported "Cookies X" no matter how many times the scanner logged in.
"""
import sys
import types

import pytest

import db_state


def _fake_database_module():
    mod = types.ModuleType("database")
    store = {}
    mod._store = store
    mod.get_state = lambda key, default="": store.get(key, default)
    mod.set_state = lambda key, value: store.__setitem__(key, value)
    mod.delete_state = lambda key: store.pop(key, None)
    return mod


def test_resolves_to_database_when_postgres_url_set(monkeypatch):
    fake = _fake_database_module()
    monkeypatch.setitem(sys.modules, "database", fake)
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:pw@host:5432/railway")
    assert db_state.backend() is fake


def test_resolves_to_sqlite_without_database_url(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    import db

    assert db_state.backend() is db


def test_cookies_round_trip_through_postgres_backend(monkeypatch):
    fake = _fake_database_module()
    monkeypatch.setitem(sys.modules, "database", fake)
    monkeypatch.setenv("DATABASE_URL", "postgres://user:pw@host:5432/railway")

    db_state.set_state("goethe_cookies", '[{"name": "SESSION"}]')

    # The webapp reads this key from the same backend, so it must land there.
    assert fake._store["goethe_cookies"] == '[{"name": "SESSION"}]'
    assert db_state.get_state("goethe_cookies") == '[{"name": "SESSION"}]'

    db_state.delete_state("goethe_cookies")
    assert db_state.get_state("goethe_cookies", "") == ""


def test_booking_helper_uses_shared_state_backend():
    pytest.importorskip("selenium")
    import booking_helper

    assert booking_helper.db_state is db_state
