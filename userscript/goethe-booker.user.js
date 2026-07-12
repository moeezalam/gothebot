// ==UserScript==
// @name         Goethe Exam Auto-Booker (Pakistan)
// @namespace    goethe-booker
// @version      1.0
// @description  Auto-books a Goethe exam slot inside YOUR OWN browser (your real residential IP). No server, no exe. Fills login + the 5-step wizard automatically.
// @match        *://*.goethe.de/*
// @match        *://goethe.de/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

/*
  HOW TO USE
  1. Install Tampermonkey (Chrome/Edge/Firefox extension).
  2. Add this script (Tampermonkey -> Create new script -> paste -> save).
  3. Edit the CONFIG block below (student details + Goethe login + level).
  4. Open  https://www.goethe.de  -> a small panel appears bottom-right.
  5. Click START ~5 min before registration opens. Leave the tab open, don't touch it.

  It uses YOUR browser + YOUR home IP, so Goethe's reCAPTCHA passes like a normal person.
*/

(function () {
  "use strict";

  // ======================= CONFIG — EDIT THIS =======================
  const CONFIG = {
    level: "A1",                       // A1 | A2 | B1
    city: "Islamabad",                 // matches your exam city
    goethe: {
      email: "abeermeer7979@gmail.com",   // student's Goethe login email
      password: "hf?3Ru8UkhfKw*X",
    },
    student: {
      name: "Abeer Meer",              // full name (first + last)
      first_name: "Abeer",             // optional; else taken from name
      surname: "Meer",                 // optional; else taken from name
      dob: "01/01/2000",               // DD/MM/YYYY  <-- PUT REAL DATE OF BIRTH
      email: "abeermeer7979@gmail.com",  // contact email on the form (often same as login)
      contact_number: "+923124092886", // passport / contact number if asked
      country: "Pakistan",
      postal_code: "54000",
      street: "PIA Society",
      house_number: "Block F",
      additional_address: "",
      place_of_birth: "Lahore",
      phone_prefix: "+92",             // e.g. "+92" (matched in the dropdown)
      phone: "3124092886",
      motivation: "",                  // dropdown text, if the form asks
      promo_code: "",                  // usually empty
    },
    pollSeconds: 4,                    // reload interval while waiting for the slot
  };
  // ================================================================

  const LEVEL_URLS = {
    A1: "https://www.goethe.de/ins/pk/en/spr/prf/gzsd1.cfm",
    A2: "https://www.goethe.de/ins/pk/en/spr/prf/gzsd2.cfm",
    B1: "https://www.goethe.de/ins/pk/en/spr/prf/gzb1.cfm",
  };

  // Selectors ported 1:1 from the Python bot (selector_fallbacks.py).
  // Each entry: list of ["css"|"xpath", selector]. First visible match wins.
  const SEL = {
    book_button: [
      ["xpath", "//*[self::a or self::button][contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'select module') or contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'book') or contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'buchen') or contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'weiter')][contains(translate(@class,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'standard')][not(contains(translate(@class,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'disabled'))]"],
      ["css", "a.standard, button.standard"],
      ["xpath", "//*[self::a or self::button][contains(text(),'Select') or contains(text(),'select') or contains(text(),'Module') or contains(text(),'Book') or contains(text(),'book')]"],
      ["xpath", "//*[self::a or self::button][contains(@href,'book') or contains(@href,'buchen')]"],
    ],
    book_for_myself: [
      ["xpath", "//*[self::a or self::button][contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'book') and contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'myself')]"],
      ["xpath", "//*[self::a or self::button][contains(@href,'book') and contains(@href,'myself')]"],
    ],
    login_email: [["css", "input[type='email']"], ["css", "input[name='email']"], ["css", "input[name='username']"], ["css", "#email"], ["css", "#username"]],
    login_password: [["css", "input[type='password']"], ["css", "input[name='password']"], ["css", "#password"], ["css", "#passwort"]],
    login_submit: [["css", "button[type='submit']"], ["css", "input[type='submit']"], ["css", ".btn-submit"], ["css", "#login-button"], ["css", ".login-button"]],
    first_name: [["css", "input[name*='first']"], ["css", "input[id*='first']"], ["css", "input[name*='vorname']"], ["xpath", "//label[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'first name')]/following::input[1]"]],
    surname: [["css", "input[name*='surname']"], ["css", "input[name*='last']"], ["css", "input[id*='surname']"], ["css", "input[name*='nachname']"], ["xpath", "//label[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'surname')]/following::input[1]"]],
    dob_day: [["css", "select[name*='day']"], ["css", "select[name*='tag']"], ["xpath", "//label[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'date of birth')]/following::select[1]"]],
    dob_month: [["css", "select[name*='month']"], ["css", "select[name*='monat']"], ["xpath", "//label[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'date of birth')]/following::select[2]"]],
    dob_year: [["css", "select[name*='year']"], ["css", "select[name*='jahr']"], ["xpath", "//label[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'date of birth')]/following::select[3]"]],
    email_field: [["css", "input[type='email']"], ["css", "input[name='email']"], ["css", "input[name='e-mail']"], ["css", "#email"]],
    contact_number: [["css", "input[name*='contact']"], ["css", "input[name*='passport']"], ["css", "input[id*='contact']"], ["css", "input[id*='passport']"]],
    country_dropdown: [["css", "select[name*='country']"], ["css", "select[id*='country']"], ["css", "select[name*='land']"]],
    postal_code: [["css", "input[name*='postal']"], ["css", "input[name*='zip']"], ["css", "input[name*='plz']"]],
    street_field: [["css", "input[name*='street']"], ["css", "input[name*='strasse']"]],
    house_number: [["css", "input[name*='house']"], ["css", "input[name*='haus']"], ["css", "input[name*='number']"]],
    additional_address: [["css", "input[name*='additional']"], ["css", "input[name*='address2']"], ["css", "input[name*='addition']"]],
    location_city: [["css", "input[name*='location']"], ["css", "input[name*='city']"], ["css", "input[name*='ort']"], ["css", "input[name*='stadt']"]],
    phone_prefix: [["css", "select[name*='phone']"], ["css", "select[name*='code']"], ["css", "select[name*='vorwahl']"]],
    form_phone: [["css", "input[name*='phone']"], ["css", "input[id*='phone']"], ["css", "input[name*='telefon']"], ["css", "input[name*='mobile']"], ["css", "input[type='tel']"]],
    form_place_of_birth: [["css", "input[name*='place']"], ["css", "input[id*='place']"], ["css", "input[name*='ort']"], ["css", "input[placeholder*='Place']"], ["css", "input[placeholder*='Birth']"]],
    motivation_dropdown: [["css", "select[name*='motivation']"], ["css", "select[id*='motivation']"]],
    invoice_option: [["xpath", "//*[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'invoice')]"], ["css", "[class*='invoice']"], ["css", "[class*='rechnung']"]],
    promo_code: [["css", "input[name*='promo']"], ["css", "input[name*='gutschein']"], ["css", "input[name*='coupon']"], ["css", "input[id*='promo']"]],
    apply_promo: [["xpath", "//button[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'apply')]"], ["css", "button[name*='apply']"]],
    confirm_order: [["xpath", "//button[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'confirm')]"], ["xpath", "//button[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'order')]"], ["xpath", "//button[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'submit')]"], ["xpath", "//button[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'buchen')]"]],
    continue_button: [["xpath", "//button[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'continue')]"], ["xpath", "//a[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'continue')]"], ["xpath", "//input[contains(translate(@value,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'continue')]"], ["xpath", "//button[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'weiter')]"]],
    terms_checkbox: [["css", "input[type='checkbox']"]],
  };

  // ---------- element helpers ----------
  const lc = (s) => (s || "").trim().toLowerCase();
  function xpath(q) {
    const out = [];
    const r = document.evaluate(q, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (let i = 0; i < r.snapshotLength; i++) out.push(r.snapshotItem(i));
    return out;
  }
  function visible(el) {
    if (!el) return false;
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden" || s.opacity === "0") return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function findAll(key) {
    for (const [type, q] of SEL[key] || []) {
      let els = [];
      try { els = type === "css" ? Array.from(document.querySelectorAll(q)) : xpath(q); } catch (e) { continue; }
      const vis = els.filter(visible);
      if (vis.length) return vis;
    }
    return [];
  }
  function find(key) { const a = findAll(key); return a.length ? a[0] : null; }

  function setValue(el, value) {
    if (!el || value === "" || value == null) return false;
    const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
    setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));
    return true;
  }
  function fillText(key, value) { const el = find(key); if (el) return setValue(el, value); return false; }
  function selectByText(key, value) {
    if (!value) return false;
    const el = find(key);
    if (!el || el.tagName !== "SELECT") return false;
    const want = lc(value);
    for (const opt of el.options) {
      if (lc(opt.textContent) === want || lc(opt.value) === want || lc(opt.textContent).includes(want)) {
        el.value = opt.value;
        el.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      }
    }
    return false;
  }
  function click(el) {
    if (!el) return false;
    el.scrollIntoView({ block: "center" });
    el.click();
    return true;
  }

  // ---------- consent ----------
  function acceptConsent() {
    try {
      if (window.UC_UI && UC_UI.acceptAllConsents) { UC_UI.acceptAllConsents().then(() => UC_UI.closeCUI && UC_UI.closeCUI()).catch(() => {}); }
    } catch (e) {}
    for (const b of xpath("//button[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'accept') or contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'akzeptieren') or contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'agree')]")) {
      if (visible(b)) { try { b.click(); } catch (e) {} }
    }
  }

  // ---------- state (survives navigations) ----------
  const S = {
    get running() { return localStorage.getItem("gb_running") === "1"; },
    set running(v) { localStorage.setItem("gb_running", v ? "1" : "0"); },
    get step() { return localStorage.getItem("gb_step") || ""; },
    set step(v) { localStorage.setItem("gb_step", v); },
  };

  function status(msg) {
    const el = document.getElementById("gb_status");
    if (el) el.textContent = msg;
    console.log("[GoetheBooker]", msg);
  }

  // ---------- page detection + actions ----------
  function detectAndAct() {
    if (!S.running) return;
    acceptConsent();
    const host = location.host;
    const url = location.href.toLowerCase();

    // LOGIN page
    if (host.includes("login.goethe.de")) {
      if (find("login_password")) {
        status("Login page — signing in…");
        fillText("login_email", CONFIG.goethe.email);
        fillText("login_password", CONFIG.goethe.password);
        setTimeout(() => click(find("login_submit")), 600);
        return;
      }
    }

    // WIZARD detection — check latest step first to avoid mis-filling
    // Step 5: review/confirm
    if (find("confirm_order")) {
      status("Step 5 — Review & Confirm");
      // tick any terms checkboxes
      for (const cb of findAll("terms_checkbox")) { if (!cb.checked) { cb.click(); } }
      setTimeout(() => click(find("confirm_order")), 800);
      S.step = "done";
      return;
    }
    // Step 4: promo
    if (find("promo_code")) {
      status("Step 4 — Promo");
      if (CONFIG.student.promo_code) { fillText("promo_code", CONFIG.student.promo_code); const a = find("apply_promo"); if (a) click(a); }
      setTimeout(clickContinue, 700);
      return;
    }
    // Step 3: payment (invoice)
    if (find("invoice_option") && !find("country_dropdown") && !find("first_name")) {
      status("Step 3 — Payment (Invoice)");
      const inv = find("invoice_option"); if (inv) click(inv);
      setTimeout(clickContinue, 700);
      return;
    }
    // Step 2: address
    if (find("country_dropdown") || find("postal_code")) {
      status("Step 2 — Address & Contact");
      selectByText("country_dropdown", CONFIG.student.country || "Pakistan");
      fillText("postal_code", CONFIG.student.postal_code);
      fillText("street_field", CONFIG.student.street);
      fillText("house_number", CONFIG.student.house_number);
      fillText("additional_address", CONFIG.student.additional_address);
      fillText("location_city", CONFIG.student.city);
      selectByText("phone_prefix", CONFIG.student.phone_prefix);
      fillText("form_phone", CONFIG.student.phone);
      fillText("form_place_of_birth", CONFIG.student.place_of_birth);
      selectByText("motivation_dropdown", CONFIG.student.motivation);
      setTimeout(clickContinue, 900);
      return;
    }
    // Step 1: name & birth
    if (find("first_name") || find("surname")) {
      status("Step 1 — Name & Birth");
      const parts = (CONFIG.student.name || "").trim().split(/\s+/);
      fillText("first_name", CONFIG.student.first_name || parts[0] || "");
      fillText("surname", CONFIG.student.surname || (parts.length > 1 ? parts[parts.length - 1] : ""));
      const dob = (CONFIG.student.dob || "").replace(/[-.]/g, "/").split("/");
      if (dob.length === 3) { selectByText("dob_day", dob[0]); selectByText("dob_month", dob[1]); selectByText("dob_year", dob[2]); }
      fillText("email_field", CONFIG.student.email);
      fillText("contact_number", CONFIG.student.contact_number);
      setTimeout(clickContinue, 900);
      return;
    }

    // "Book for myself" intermediate
    const mine = find("book_for_myself");
    if (mine) { status("Clicking 'Book for myself'…"); click(mine); return; }

    // LEVEL / module page — find the Select-module / Book button, else poll
    if (host.includes("goethe.de")) {
      const bookBtn = find("book_button");
      if (bookBtn) { status("Slot OPEN — clicking Book / Select module!"); click(bookBtn); return; }
      // not bookable yet → reload and keep polling
      status(`Waiting for slot… reloading in ${CONFIG.pollSeconds}s`);
      setTimeout(() => location.reload(), CONFIG.pollSeconds * 1000);
      return;
    }

    status("Waiting… (page not recognised yet)");
  }

  function clickContinue() {
    const btn = find("continue_button");
    if (btn) { click(btn); return true; }
    // fallback: any visible submit
    const sub = document.querySelector("button[type='submit'], input[type='submit']");
    if (sub && visible(sub)) { click(sub); return true; }
    status("Could not find Continue button");
    return false;
  }

  // ---------- control panel ----------
  function panel() {
    if (document.getElementById("gb_panel")) return;
    const box = document.createElement("div");
    box.id = "gb_panel";
    box.style.cssText = "position:fixed;bottom:16px;right:16px;z-index:2147483647;background:#111;color:#eee;font:13px/1.4 system-ui,sans-serif;padding:12px 14px;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.4);width:240px;border:1px solid #333";
    box.innerHTML =
      '<div style="font-weight:700;margin-bottom:6px">Goethe Auto-Booker</div>' +
      '<div style="font-size:11px;color:#9ad;margin-bottom:8px">Level ' + CONFIG.level + ' · ' + CONFIG.city + '</div>' +
      '<div id="gb_status" style="min-height:32px;margin-bottom:8px;color:#ddd">Idle</div>' +
      '<button id="gb_start" style="width:48%;padding:6px;border:0;border-radius:6px;background:#2d7;color:#012;font-weight:700;cursor:pointer">START</button>' +
      '<button id="gb_stop" style="width:48%;padding:6px;border:0;border-radius:6px;background:#e55;color:#fff;font-weight:700;cursor:pointer;margin-left:4%">STOP</button>' +
      '<button id="gb_go" style="width:100%;margin-top:6px;padding:6px;border:0;border-radius:6px;background:#38f;color:#fff;cursor:pointer">Go to ' + CONFIG.level + ' exam page</button>';
    document.body.appendChild(box);
    document.getElementById("gb_start").onclick = () => { S.running = true; status("Started"); detectAndAct(); };
    document.getElementById("gb_stop").onclick = () => { S.running = false; status("Stopped"); };
    document.getElementById("gb_go").onclick = () => { location.href = LEVEL_URLS[CONFIG.level] || LEVEL_URLS.A1; };
    if (S.running) status("Running…");
  }

  // ---------- boot ----------
  function boot() {
    panel();
    if (S.running) setTimeout(detectAndAct, 1200);
  }
  if (document.readyState === "complete" || document.readyState === "interactive") boot();
  else window.addEventListener("DOMContentLoaded", boot);
})();
