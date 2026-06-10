# Goethe Booking Bot — Session Summary (Updated 10 Jun 2026)

## Project
Automated bot for booking Goethe-Institut Pakistan German language exams (A1, A2, B1) — multi-student, multi-city.

## User
- GitHub: `abeermeer`
- Goethe My Goethe.de: `student@example.com` / `GOETHE_PASSWORD_REDACTED`
- A1 Karachi (bookable from July 17, 2026)
- Python: `C:\Users\brosp\AppData\Local\Programs\Python\Python312\python.exe`
- Project dir: `C:\Users\brosp\AppData\Local\Temp\opencode\goethe-bot` (also copied to `Downloads\goethe-bot`)
- Platform: Windows

## Deployments
| Service | URL | Status |
|---------|-----|--------|
| **Frontend (Netlify)** | https://aesthetic-alpaca-769b17.netlify.app | ✅ Live |
| **Backend (Railway)** | https://goethe-booking-bot-production-a6a6.up.railway.app | ✅ Live (bot works, old build) |
| **GitHub** | https://github.com/abeermeer/goethe-booking-bot | ✅ Latest code pushed |
| **Custom Domain** | User purchased a domain — needs to connect to Netlify | ⏳ Pending |

## What Works
- Chrome launches on Railway (google-chrome-stable)
- Bot polls Goethe exam page every ~45s for "Book Now" button
- Config loaded with real account (A1 Karachi, bookable July 17)
- Frontend connects to backend, shows student cards, live logs
- Headless checkbox, Telegram fields, upload config
- Netlify frontend deployed with schedule display UI
- Bot runs 24/7 in cloud — no need for user's computer to stay awake

## What's Not Deployed (old build running)
- `/api/schedule` endpoint (schedule data is in `booking_helper.py` but old Railway build doesn't have it)
- Dockerfile optimized for slim (builds failing on Railway, but old Dockerfile works)

## Bot Behavior
- Starts polling 10s before booking time (burst mode)
- In burst mode: polls every 2-3s
- Normal mode: polls every 45s
- Finds "Book Now" button by text matching (book, next, buchen, weiter)
- Clicks button → CAS login (My Goethe.de) → fills registration form → submits
- Captures confirmation screenshot
- Stops gracefully via stop event
- Each student runs in separate thread with separate Chrome profile

## Exam Schedule (A1 Karachi)
- Registration opens: **July 17, 2026** (bookable from)
- Exam date: July 31 - Aug 1, 2026
- Price: PKR 25,000 (full) / PKR 16,500 (reduced)
- Location: Goethe-Institut Karachi
- Config booking datetime: `2026-07-17T10:00:00`

## Key Files
| File | Purpose |
|------|---------|
| `booking_helper.py` | Core bot engine (Selenium, multi-student, polling) |
| `webapp.py` | Flask backend API (start/stop/status/logs/results/schedule) |
| `frontend/index.html` | Web dashboard (Netlify) |
| `config.csv` | Student credentials and booking info |
| `Dockerfile` | Container definition (python:3.12-slim + google-chrome-stable) |
| `gui.py` | Alternative Tkinter desktop GUI (not deployed) |
| `SESSION_SUMMARY.md` | This file — full session memory for resume |

## Known Issues
1. `excludeSwitches`, `['enable-automation']` + `--user-data-dir` crashes Chrome 148 on Windows — removed
2. Docker builds on Railway timeout with larger images — using slim + `--no-install-recommends` + `apt-get install -f -y`
3. Railway Docker build queue stuck — old working build still running

## Production Hosting Suggestions
| Provider | Price | Why |
|----------|-------|-----|
| Railway (current) | $5/mo Starter | Already deployed, fix Docker build |
| DigitalOcean | $6/mo droplet | Full VPS, install Chrome directly |
| Hetzner | $4/mo VPS | Cheapest reliable VPS |
| AWS EC2 | Free tier 1yr | Free, can run Chrome |

**Neither Hostinger nor GoDaddy** work — they're shared PHP hosting, can't run Python + Chrome.

## Connecting Custom Domain to Netlify
General process:
1. Netlify Dashboard → Site settings → Domain management → Add custom domain
2. At registrar: add `CNAME` pointing to `aesthetic-alpaca-769b17.netlify.app`
3. Or point nameservers to Netlify
4. Wait 5-30 mins for DNS

## Netlify Deploy Token
`NETLIFY_DEPLOY_TOKEN_REDACTED`
Site ID: `NETLIFY_SITE_ID_REDACTED`

## Commands
```powershell
# Run locally
cd C:\Users\brosp\Downloads\goethe-bot
python webapp.py

# Deploy frontend
$env:NETLIFY_AUTH_TOKEN = "NETLIFY_DEPLOY_TOKEN_REDACTED"
netlify deploy --prod --dir frontend --site "NETLIFY_SITE_ID_REDACTED"

# Git
cd C:\Users\brosp\Downloads\goethe-bot
git add -A; git commit -m "message"; git push
```

## CSV Columns (updated)
`name,email,password,level,city,booking_datetime,dob,place_of_birth,address,phone`

## Registration Form Fields (confirmed by user)
1. Name (single field)
2. Date of Birth
3. Place of Birth
4. Address
5. Phone number
6. Level (A1/A2/B1 dropdown)

## Selectors Updated
- `form_name` — single name input
- `form_place_of_birth` — place of birth input
- `form_level` — exam level dropdown
- Removed old unused: form_firstname, form_lastname, form_gender, form_nationality, form_passport, form_cnic, form_city
