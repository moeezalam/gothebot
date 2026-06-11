"""
Multi-channel notifications: Telegram + Email + WhatsApp.
"""

from __future__ import annotations

import logging
import os
import smtplib
import urllib.parse
import urllib.request
from email.mime.text import MIMEText
from typing import Optional

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")

EMAIL_SMTP_HOST = os.environ.get("EMAIL_SMTP_HOST", "")
EMAIL_SMTP_PORT = int(os.environ.get("EMAIL_SMTP_PORT", "587"))
EMAIL_USER = os.environ.get("EMAIL_USER", "")
EMAIL_PASS = os.environ.get("EMAIL_PASS", "")
EMAIL_FROM = os.environ.get("EMAIL_FROM", "")
EMAIL_TO = os.environ.get("EMAIL_TO", "")

WHAPI_TOKEN = os.environ.get("WHAPI_TOKEN", "")
WHAPI_PHONE = os.environ.get("WHAPI_PHONE", "")  # Your WhatsApp number
WHAPI_TO = os.environ.get("WHAPI_TO", "")  # Recipient WhatsApp number
WHAPI_BASE = os.environ.get("WHAPI_BASE", "https://gate.whapi.cloud")


def send_telegram(message: str, logger: logging.Logger) -> bool:
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return False
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        data = urllib.parse.urlencode({"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": "HTML"}).encode()
        req = urllib.request.Request(url, data=data, method="POST")
        urllib.request.urlopen(req, timeout=10)
        logger.info("Telegram sent")
        return True
    except Exception as exc:
        logger.warning("Telegram failed: %s", exc)
        return False


def send_email(subject: str, body: str, logger: logging.Logger) -> bool:
    if not all([EMAIL_SMTP_HOST, EMAIL_USER, EMAIL_PASS, EMAIL_TO]):
        return False
    try:
        msg = MIMEText(body, "plain", "utf-8")
        msg["Subject"] = subject
        msg["From"] = EMAIL_FROM or EMAIL_USER
        msg["To"] = EMAIL_TO
        with smtplib.SMTP(EMAIL_SMTP_HOST, EMAIL_SMTP_PORT, timeout=15) as s:
            s.starttls()
            s.login(EMAIL_USER, EMAIL_PASS)
            s.send_message(msg)
        logger.info("Email sent to %s", EMAIL_TO)
        return True
    except Exception as exc:
        logger.warning("Email failed: %s", exc)
        return False


def send_whatsapp(message: str, logger: logging.Logger) -> bool:
    if not all([WHAPI_TOKEN, WHAPI_PHONE, WHAPI_TO]):
        return False
    try:
        url = f"{WHAPI_BASE}/messages/text"
        headers = {
            "Authorization": f"Bearer {WHAPI_TOKEN}",
            "Content-Type": "application/json",
        }
        payload = {
            "to": WHAPI_TO,
            "body": message,
        }
        data = json.dumps(payload).encode()
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")
        urllib.request.urlopen(req, timeout=10)
        logger.info("WhatsApp sent")
        return True
    except Exception as exc:
        logger.warning("WhatsApp failed: %s", exc)
        return False


def notify_all(title: str, message: str, logger: logging.Logger):
    full = f"<b>{title}</b>\n{message}"
    logger.info("NOTIFY: %s - %s", title, message)
    send_telegram(full, logger)
    send_email(title, message, logger)
    send_whatsapp(message, logger)


import json  # noqa: E402 (needed by send_whatsapp)
