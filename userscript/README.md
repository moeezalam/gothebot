# Goethe Auto-Booker — Userscript (runs in YOUR browser)

Books a Goethe exam slot **inside the client's own browser**, using their **real home IP**
and real browser — so Goethe's reCAPTCHA treats it like a normal person. **No server, no .exe,
no Python.** This is the free "option 2" alternative to the desktop app.

## Why this bypasses the block
The booking runs in the client's browser on their home internet. Goethe sees a normal
residential IP + a real Chrome fingerprint → reCAPTCHA v3 scores it high → login + booking
go through. (Datacenter/cloud IPs score low and get blocked — that's the whole problem.)

## Install (client, one time)
1. Install the **Tampermonkey** extension:
   - Chrome/Edge: https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
   - Firefox: https://addons.mozilla.org/firefox/addon/tampermonkey/
2. Tampermonkey icon → **Create a new script** → delete the template → paste the contents of
   `goethe-booker.user.js` → **File ▸ Save** (Ctrl+S).

## Configure (edit the CONFIG block at the top of the script)
- `level` (A1/A2/B1), `city`
- `goethe.email` / `goethe.password` — the student's Goethe login
- `student.*` — name, dob (DD/MM/YYYY), address, phone, place of birth, etc.
Save after editing.

## Use (booking day)
1. Open **https://www.goethe.de** → a small **"Goethe Auto-Booker"** panel appears bottom-right.
2. Click **"Go to A1 exam page"** (or your level).
3. ~5 min before registration opens, click **START**.
4. It polls the page, and when the slot opens it clicks Book, logs in, and fills all 5 wizard
   steps automatically. **Leave the tab open, don't touch it.**
5. **STOP** cancels.

## Notes / limits
- The browser tab must stay **open + logged-in-capable**; the client's PC on + online.
- Selectors are the same ones the Python bot uses; if Goethe changes their form, they may need
  updating (same as the bot).
- It stops after clicking the final Confirm. Verify the confirmation email.
- This does the booking; it is NOT the dashboard. One student per configured script.
```
```
