# reCAPTCHA Blocking Test Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Determine whether Railway's datacenter IP triggers a blocking reCAPTCHA challenge on Goethe's CAS login page.

**Architecture:** Existing bot code is complete. No code changes needed. This plan runs the existing login flow on Railway and observes the outcome.

**Tech Stack:** Railway CLI, existing Goethe bot backend + frontend

**Context:**
- Bot backend: `https://goethe-booking-bot-production-21af.up.railway.app`
- Frontend: `https://goethe-frontend-v3.vercel.app`
- Railway project: `520adb72-b1f4-4021-8c4b-21ca81f8a901`
- Railway service: `f568e242-4d2a-4b44-8205-07899abfbd26`
- Railway env: `20945f76-1cfa-4e38-b50b-a5cb8d5f47cd`
- No `CAPTCHA_API_KEY` env var set (2Captcha not configured)
- No code changes required

---
### Task 1: Tail Railway logs in real-time

**Files:** none

- [ ] **Step 1: Open terminal and tail logs**

```bash
railway logs --service f568e242-4d2a-4b44-8205-07899abfbd26 --environment 20945f76-1cfa-4e38-b50b-a5cb8d5f47cd
```

- [ ] **Step 2: Leave terminal running in background**

Expected: Continuous log output showing bot is alive (heartbeat or idle state)

---
### Task 2: Trigger a login attempt from the frontend

**Files:** none

- [ ] **Step 1: Open frontend in browser**

URL: `https://goethe-frontend-v3.vercel.app`

- [ ] **Step 2: Log into dashboard**

Use `AUTH_EMAIL` / `AUTH_PASSWORD` credentials.

- [ ] **Step 3: Navigate to schedule/config page**

Find an exam slot for any level/location and click the **Run** (or equivalent) button to trigger the booking bot for a single student.

- [ ] **Step 4: Wait 30-60 seconds**

Let the bot run through its login flow.

---
### Task 3: Observe logs and determine outcome

**Files:** none

- [ ] **Step 1: Check Railway logs for these lines**

Search for these exact log messages:

| Log line | Meaning |
|---|---|
| `login page loaded` | Bot reached CAS login page ✅ |
| `detected reCAPTCHA on login page` | reCAPTCHA widget is visible (expected) |
| `solving captcha with 2captcha` | Bot attempted to solve — won't happen without `CAPTCHA_API_KEY` |
| `logged in successfully` | Login worked despite reCAPTCHA ✅ |
| `login failed` or `authentication failed` | Login blocked by CAPTCHA or wrong credentials ❌ |

- [ ] **Step 2: Determine the answer**

Check one:
- **No blocking:** If `login page loaded` → `logged in successfully` appears → **reCAPTCHA is NOT blocking Railway IP. No action needed.**
- **Blocking confirmed:** If `login page loaded` → `detected reCAPTCHA` → then stalls/times out with `login failed` → **reCAPTCHA IS blocking Railway IP.**

---
### Task 4: Decide next steps based on result

**Files:** none

- [ ] **Step 1: If login succeeded (no blocking)**

Conclusion: Deploy is fully ready. No CAPTCHA workaround needed. Next booking window can run on Railway directly.

- [ ] **Step 2: If login failed (blocking confirmed)**

Three options:
1. **Cheapest:** Run `python webapp.py` locally from home IP on booking day (`scripts/run_local.bat`) — home IP unlikely to trigger reCAPTCHA
2. **Paid (~$3):** Set `CAPTCHA_API_KEY` Railway env var — code is already wired, just needs the key
3. **Hybrid:** Local backend + deployed frontend — update `API_URL` in frontend to point to local backend during booking window

---
