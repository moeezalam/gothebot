# Goethe Booking Bot — Session Summary (Updated 11 Jun 2026)

## Project
Automated bot for booking Goethe-Institut Pakistan German language exams (A1, A2, B1) — multi-student, multi-city.

## User
- GitHub: `abeermeer`
- Goethe credentials: `student@example.com` / `GOETHE_PASSWORD_REDACTED`
- 3 students: A1 Karachi (10:00), A2 Lahore (10:05), B1 Karachi (10:10)
- All bookable from July 17, 2026
- Python: `C:\Users\brosp\AppData\Local\Programs\Python\Python312\python.exe`
- Project dir: `C:\Users\brosp\Downloads\goethe-bot`
- Platform: Windows

## Deployments (all currently live)
| Service | URL | Status |
|---------|-----|--------|
| **Frontend (Netlify)** | https://aesthetic-alpaca-769b17.netlify.app | ✅ Live |
| **Backend (Railway)** | https://goethe-booking-bot-production-a6a6.up.railway.app | ✅ Online |
| **Mock Site (Netlify)** | https://goethe-bot-mock.netlify.app | ✅ Live |
| **GitHub** | https://github.com/abeermeer/goethe-booking-bot | ✅ Latest pushed |

## Latest Changes (11 Jun v6 — Frontend Redesign)

### Frontend Redesign
- Complete rewrite with modern dark theme (glassmorphism-inspired)
- Color-coded student status cards with progress bars and step chips
- Live status badge with animated pulsing dot (green=running, yellow=stopping, gray=idle, red=disconnected)
- Responsive grid layout (2-col / 3-col), monospace terminal-style log viewer
- **Actions + Schedule merged** — clean toggle at bottom: **Run Now** / **Schedule**
  - Run Now → sends `immediate: true` to backend, bypasses all scheduling
  - Schedule → reveals datetime picker, calls `/api/schedule-start`
- Notifications card (Telegram token/chat ID, email, WhatsApp) — saves to localStorage
- History table shows past booking results from DB
- Exam Schedule table (fetches real Goethe schedule data via `/api/schedule`)

### `immediate` Flag Added
- `booking_helper.py`: `smart_retry()` and `run_student_flow()` accept `immediate=True` to skip `scheduled_wait()`
- `webapp.py`: `run_students_web()` and `/api/start` accept `immediate` from request
- Frontend sends `immediate: true` in Run Now mode
- **Before**: clicking Start Bot always waited until `booking_datetime` from CSV (July 17)
- **Now**: Run Now starts instantly, Schedule still waits until target time

### Deployment Method
- **Netlify**: `netlify deploy --prod --dir=frontend`
- **Railway**: `railway up --detach` (linked, no env needed)
- **Git**: `git add -A && git commit -m "..." && git push origin main`

## Current Config (3 students)
| Name | Level | City | Booking DateTime |
|------|-------|------|-----------------|
| Abeer Meer | A1 | Karachi | 2026-07-17T10:00:00 |
| Abeer Meer | A2 | Lahore | 2026-07-17T10:05:00 |
| Abeer Meer | B1 | Karachi | 2026-07-17T10:10:00 |

## Key Files
| File | Purpose |
|------|---------|
| `booking_helper.py` | Core bot engine (1161 lines) — Selenium, multi-student, polling, retry, proxy, CAPTCHA, human behavior |
| `webapp.py` | Flask backend API (start/stop/status/logs/results/schedule/DB) |
| `frontend/index.html` | Web dashboard (Netlify) — modern dark theme UI |
| `config.csv` | Student credentials (gitignored) |
| `db.py` | SQLite persistence (students, logs, bot_state) |
| `notifications.py` | Multi-channel notifications (Telegram, Email SMTP, WhatsApp WHAPI) |
| `Dockerfile` | python:3.12-slim + google-chrome-stable |
| `SESSION_SUMMARY.md` | This file |

## v2.0 Features (all deployed)
- Human behavior simulation (random scroll, mouse wander, pause between fields)
- Proxy rotation (PROXY_LIST env var, random assignment per student)
- Fingerprint randomization (random user-agent + viewport from 5 profiles)
- CAPTCHA solving (2Captcha integration — needs CAPTCHA_API_KEY env var)
- Scheduled mode (dashboard Schedule card + `/api/schedule-*` endpoints)
- Smart retry (on failure waits 30-60s, retries with new profile, up to MAX_SMART_RETRIES=2)
- DB persistence (SQLite — students, logs, results; auto-initializes)
- Multi-channel notifications (Telegram, Email SMTP, WhatsApp WHAPI)
- All features behind env vars — zero config needed if unused

## Testing
- Mock site: https://goethe-bot-mock.netlify.app
- 1-student mock test passed (A1 Karachi → confirmed)
- To test: open frontend → connect to Railway → click Start Bot (Run Now)

## Known Issues
1. Railway 512MB free tier barely handles 3 Chrome instances — may need $5 Starter upgrade for reliability
2. CAPTCHA solving needs CAPTCHA_API_KEY env var set to function
3. Proxy rotation needs PROXY_LIST env var with valid proxies
4. Email notifications need SMTP env vars, WhatsApp needs WHAPI credentials

## Pre-July 17 Checklist
- [x] v2.0 code deployed to Railway (human sim, proxy, fingerprint, CAPTCHA, smart retry, DB, notifications)
- [x] Frontend redesigned and deployed to Netlify
- [x] `immediate` flag added — Run Now works instantly, Schedule mode intact
- [x] Mock site deployed and tested
- [x] Railway linked to local repo for easy deploys
- [ ] Connect custom domain to Netlify (CNAME or nameservers)
- [ ] Set Railway env vars: CAPTCHA_API_KEY, PROXY_LIST, SMTP_*, WHAPI_* (as needed)
- [ ] On July 17: open Netlify URL → connect to Railway → click Start Bot ~10 min before 10:00

## Tokens & IDs (current — 11 Jun 2026)
- Railway API Token: `RAILWAY_TOKEN_REDACTED`
- Railway Project ID: `6aee17f5-fe9f-4496-a02d-e5f366d37c2a`
- Railway Service ID: `783d4933-1de1-45b6-a198-08b6f07692cd`
- Railway URL: `https://goethe-booking-bot-production-a6a6.up.railway.app`
- Netlify Site ID: `NETLIFY_SITE_ID_REDACTED`
- Netlify Deploy Token: `NETLIFY_DEPLOY_TOKEN_REDACTED`
- Netlify URL: `https://aesthetic-alpaca-769b17.netlify.app`
- Mock Netlify URL: `https://goethe-bot-mock.netlify.app`
- Mock repo: `C:\Users\brosp\Downloads\goethe-mock`

## Commands
```powershell
# Run backend locally
cd C:\Users\brosp\Downloads\goethe-bot
python webapp.py

# Deploy frontend to Netlify
netlify deploy --prod --dir=frontend

# Deploy backend to Railway
$env:RAILWAY_API_TOKEN = "RAILWAY_TOKEN_REDACTED"
railway up --detach

# Check Railway status
railway status

# Git push
git add -A; git commit -m "message"; git push origin main
```
