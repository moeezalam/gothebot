"""Regression: cookie-session detection must key off page content, not URL.

The old check was `"login" not in driver.current_url` — but the CAS host is
login.goethe.de, so it could never pass and saved cookies were never used.
"""
import pytest

pytest.importorskip("selenium")

import booking_helper


class _FakeElement:
    def __init__(self, displayed=True):
        self._displayed = displayed

    def is_displayed(self):
        return self._displayed


class _FakeDriver:
    current_url = "https://login.goethe.de/cas/login"

    def __init__(self, elements):
        self._elements = elements

    def find_elements(self, by, selector):
        return self._elements


def test_login_form_present_when_password_field_visible():
    driver = _FakeDriver([_FakeElement(displayed=True)])
    assert booking_helper._cas_login_form_present(driver) is True


def test_logged_in_when_no_password_field_despite_login_url():
    # URL still contains "login" (it always does on this host) — must not matter.
    driver = _FakeDriver([])
    assert booking_helper._cas_login_form_present(driver) is False


def test_hidden_password_field_does_not_count():
    driver = _FakeDriver([_FakeElement(displayed=False)])
    assert booking_helper._cas_login_form_present(driver) is False


def test_driver_error_assumes_login_needed():
    class _Boom:
        def find_elements(self, by, selector):
            raise RuntimeError("browser crashed")

    assert booking_helper._cas_login_form_present(_Boom()) is True


def test_inject_cookies_retries_without_domain():
    class _PickyDriver:
        """Rejects cookies carrying a domain attr — like add_cookie does for
        domains not matching the current page."""
        def __init__(self):
            self.added = []

        def add_cookie(self, cookie):
            if "domain" in cookie:
                raise Exception("invalid cookie domain")
            self.added.append(cookie)

    import logging
    driver = _PickyDriver()
    cookies = [
        {"name": "TGC", "value": "x", "domain": ".goethe.de"},
        {"name": "plain", "value": "y"},
    ]
    added = booking_helper._inject_cookies(driver, cookies, logging.getLogger("t"))
    assert added == 2
    assert {c["name"] for c in driver.added} == {"TGC", "plain"}
