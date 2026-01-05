// ==UserScript==
// @name         Katana Helpers — Create MO + MO Done Helper + SO Pack All + SO EX/Ultra EX + Clicks HUD + Confetti
// @namespace    https://factory.katanamrp.com/
// @version      2.6.8
// @description  Create MO button + MO Done helper (only shows when Not started) + Sales Order Pack all helper + SO row EX (Make in batch qty=1 open MO) + Ultra EX (double-click: auto-Done if all In stock, then go back) + HUD counters.
// @match        https://factory.katanamrp.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
  "use strict";

  // ----------------------------
  // Config
  // ----------------------------
  const DEBUG = false;

  const KEY_TOTAL = "kh_clicks_total";
  const KEY_BY_DATE = "kh_clicks_by_date"; // JSON map: { "YYYY-MM-DD": n }

  const STYLE_ID = "kh-style";
  const HUD_ID = "kh-hud";

  const BTN_CREATE_MO_ID = "kh-create-mo-btn";
  const BTN_STATUS_HELPER_ID = "kh-status-helper-btn"; // MO Done helper OR SO Pack all
  const BTN_SO_EX_CLASS = "kh-so-ex-btn";
  const BTN_ETSY_ORDER_ID = "kh-etsy-order-btn";
  const ETSY_ORDER_CELL_ID = "kh-etsy-order-cell";
  const ETSY_ORDER_URL = "https://www.etsy.com/your/orders/sold";

  const SEL_CREATE_BTN = 'button[data-testid="globalAddButton"]';
  const SEL_MO_ITEM = 'a[data-testid="globalAddManufacturing"]';

  // Entity status dropdown button (used in multiple places/pages)
  const SEL_ENTITY_STATUS_BTN = 'button[data-testid="menuButton-entityStatus"]';

  // Manufacturing Order status menu items
  const SEL_MO_STATUS_DONE_ITEM = 'li[data-testid="menuListItem-entityStatus-done"]';

  // Sales Order status menu items
  const SEL_SO_STATUS_PACK_ALL_ITEM = 'li[data-testid="menuListItem-entityStatus-packAll"]';

  // "Not enough stock" dialog (Sales Order packing)
  const SEL_DIALOG_TITLE = 'div[role="dialog"] h2';
  const SEL_DIALOG_CLOSE_BTN = 'div[role="dialog"] button#closeButton';

  // Sales Order row actions + Make in batch
  const SEL_SO_ROW_ACTIONS_BTN = 'button[data-testid="soRowActionsMenu-button"]';
  const SEL_SO_MENU_MAKE_IN_BATCH = 'li[data-testid="soRowActionsMenu-item-makeInBatch"]';
  const SEL_BATCH_QTY_INPUT = 'input[data-testid="singleMOLayoutQuantityInput"]';
  const SEL_CREATE_AND_OPEN = 'button[data-testid="createAndOpenOrderButton"]';

  // Ultra EX availability checks (on Manufacturing Order page)
  const INGREDIENTS_GRID_ID = "#ingredients-grid";
  const DOUBLE_CLICK_WINDOW_MS = 250;

  // Click-saved accounting
  const SAVED_CLICKS_EX_NORMAL = 4;      // your calibrated value
  const SAVED_CLICKS_ULTRA_EXTRA = 2;    // auto Done + return/back

  // Ultra timing knobs
  const ULTRA_MAX_WAIT_FOR_READY_MS = 6000;
  const ULTRA_READY_POLL_MS = 140;
  const ULTRA_READY_COUNTDOWN_THRESHOLD_MS = 1500;
  const ULTRA_WAIT_GRID_MS = 20000;           // time allowed for grid/rows to appear
  const ULTRA_SCAN_TIMEOUT_MS = 30000;        // time allowed for full scroll+scan

  // ----------------------------
  // Utils
  // ----------------------------
  const log = (...args) => DEBUG && console.log("[KatanaHelpers]", ...args);

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  function safeJsonParse(s, fallback) {
    try { return JSON.parse(s); } catch { return fallback; }
  }

  function storageAvailable() {
    try {
      const k = "__kh_test__";
      localStorage.setItem(k, "1");
      localStorage.removeItem(k);
      return true;
    } catch {
      return false;
    }
  }

  const HAS_STORAGE = storageAvailable();
  let mem = { total: 0, byDate: {} };

  function getPacificYMD() {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Vancouver",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());

    const y = parts.find(p => p.type === "year")?.value ?? "0000";
    const m = parts.find(p => p.type === "month")?.value ?? "00";
    const d = parts.find(p => p.type === "day")?.value ?? "00";
    return `${y}-${m}-${d}`;
  }

  function readTotal() {
    if (!HAS_STORAGE) return mem.total;
    const raw = localStorage.getItem(KEY_TOTAL);
    const n = raw == null ? 0 : parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
  }

  function writeTotal(n) {
    if (!HAS_STORAGE) { mem.total = n; return; }
    localStorage.setItem(KEY_TOTAL, String(n));
  }

  function readByDateMap() {
    if (!HAS_STORAGE) return mem.byDate;
    const raw = localStorage.getItem(KEY_BY_DATE);
    const obj = safeJsonParse(raw || "{}", {});
    return (obj && typeof obj === "object") ? obj : {};
  }

  function writeByDateMap(map) {
    if (!HAS_STORAGE) { mem.byDate = map; return; }
    localStorage.setItem(KEY_BY_DATE, JSON.stringify(map));
  }

  function getTodayCount(map, ymd) {
    const v = map?.[ymd];
    return Number.isFinite(v) ? v : 0;
  }

  function incrementCounters(delta = 1) {
    const ymd = getPacificYMD();

    const total = readTotal() + delta;
    writeTotal(total);

    const map = readByDateMap();
    map[ymd] = getTodayCount(map, ymd) + delta;
    writeByDateMap(map);

    updateHud();
  }

  function waitForSelector(selector, timeoutMs = 1500, root = document) {
    return new Promise((resolve, reject) => {
      const existing = root.querySelector(selector);
      if (existing) return resolve(existing);

      const obs = new MutationObserver(() => {
        const el = root.querySelector(selector);
        if (el) {
          clearTimeout(t);
          obs.disconnect();
          resolve(el);
        }
      });

      obs.observe(document.body, { childList: true, subtree: true });

      const t = setTimeout(() => {
        obs.disconnect();
        reject(new Error(`Timeout waiting for ${selector}`));
      }, timeoutMs);
    });
  }

  function waitForCondition(checkFn, timeoutMs = 8000, intervalMs = 80) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const tick = () => {
        try {
          const val = checkFn();
          if (val) return resolve(val);
        } catch {
          // ignore
        }
        if (Date.now() - start >= timeoutMs) return reject(new Error("Timeout waiting for condition"));
        setTimeout(tick, intervalMs);
      };
      tick();
    });
  }

  function dispatchRealClick(el) {
    el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window }));
    el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window }));
    el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
  }

  function setReactInputValue(input, value) {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    if (setter) setter.call(input, value);
    else input.value = value;

    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function normText(s) {
    return (s || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  // ----------------------------
  // Toast (minimal, bottom-center)
  // ----------------------------
  const TOAST_ID = "kh-toast";
  function showToast(msg, ms = 2800) {
    let el = document.getElementById(TOAST_ID);
    if (!el) {
      el = document.createElement("div");
      el.id = TOAST_ID;
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.display = "block";
    el.style.opacity = "1";

    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      if (!el) return;
      el.style.opacity = "0";
      setTimeout(() => { if (el) el.style.display = "none"; }, 250);
    }, ms);
  }

  const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

  function startSpinnerToast(getMessage, intervalMs = 140) {
    let i = 0;
    const tick = () => {
      const frame = SPINNER_FRAMES[i++ % SPINNER_FRAMES.length];
      showToast(`${frame} ${getMessage()}`, 1600);
    };
    tick();
    const t = setInterval(tick, intervalMs);
    return () => clearInterval(t);
  }

  function startCountdownToast(maxWaitMs, thresholdMs, onMessage) {
    const start = Date.now();
    let shown = false;
    const tick = () => {
      const elapsed = Date.now() - start;
      if (!shown && elapsed < thresholdMs) return;
      shown = true;
      const remainingMs = Math.max(0, maxWaitMs - elapsed);
      onMessage(remainingMs);
    };
    tick();
    const t = setInterval(tick, 250);
    return () => clearInterval(t);
  }

  // ----------------------------
  // Styles
  // ----------------------------
  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      /* Katana Helpers (kh-) */

      /* Create MO: black bg / white text */
      #${BTN_CREATE_MO_ID} {
        background: #000 !important;
        color: #fff !important;
        border: 1px solid rgba(255,255,255,0.25) !important;
        border-radius: 6px !important;
        padding: 6px 12px !important;
        margin-right: 10px !important;
        font: inherit !important;
        cursor: pointer !important;
        line-height: 1.2 !important;
        white-space: nowrap !important;
      }
      #${BTN_CREATE_MO_ID}:hover { border-color: rgba(255,255,255,0.45) !important; }
      #${BTN_CREATE_MO_ID}:active { transform: translateY(0.5px) !important; }

      /* Shared helper button next to entity status dropdown (MO Done helper OR SO Pack all) */
      #${BTN_STATUS_HELPER_ID} {
        border-radius: 6px !important;
        padding: 6px 12px !important;
        margin-right: 10px !important;
        font: inherit !important;
        cursor: pointer !important;
        line-height: 1.2 !important;
        white-space: nowrap !important;
        border: 1px solid rgba(0,0,0,0.25) !important;
        font-weight: 800 !important;
      }
      #${BTN_STATUS_HELPER_ID}[data-kh-running="1"] {
        opacity: 0.6 !important;
        cursor: progress !important;
      }

      /* MO helper (only "Done") */
      #${BTN_STATUS_HELPER_ID}.kh-mo-done {
        background: rgba(46, 204, 113, 0.95) !important;
        color: #fff !important;
      }

      /* SO helper (Pack all) */
      #${BTN_STATUS_HELPER_ID}.kh-so-packall {
        background: rgba(230, 213, 153, 0.95) !important;
        color: #000 !important;
      }

      #${BTN_STATUS_HELPER_ID}:hover { border-color: rgba(0,0,0,0.45) !important; }
      #${BTN_STATUS_HELPER_ID}:active { transform: translateY(0.5px) !important; }

      /* SO row EX button (compact square) */
      .${BTN_SO_EX_CLASS} {
        background: rgba(153, 184, 230, 0.95) !important; /* light blue */
        color: #000 !important;
        font-weight: 900 !important;
        border: 1px solid rgba(0,0,0,0.25) !important;
        border-radius: 6px !important;

        width: 32px !important;
        height: 32px !important;
        padding: 0 !important;
        margin-right: 6px !important;

        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;

        font: inherit !important;
        font-size: 12px !important;
        line-height: 1 !important;
        white-space: nowrap !important;
        cursor: pointer !important;
      }
      .${BTN_SO_EX_CLASS}[data-kh-running="1"] {
        opacity: 0.7 !important;
        cursor: progress !important;
      }
      .${BTN_SO_EX_CLASS}.kh-ultra {
        background: rgba(230, 60, 60, 0.95) !important; /* red for Ultra */
        color: #fff !important;
        border-color: rgba(255,255,255,0.25) !important;
      }
      .${BTN_SO_EX_CLASS}:hover { border-color: rgba(0,0,0,0.45) !important; }
      .${BTN_SO_EX_CLASS}:active { transform: translateY(0.5px) !important; }

      /* Etsy button next to Sales order # */
      .kh-etsy-order-cell {
        display: flex !important;
        align-items: flex-end !important;
        padding-left: 12px !important;
        margin-bottom: -16px !important;
      }
      #${BTN_ETSY_ORDER_ID} {
        background: #f26a2e !important;
        color: #fff !important;
        border: 1px solid rgba(0,0,0,0.15) !important;
        border-radius: 8px !important;
        padding: 8px 14px !important;
        font: inherit !important;
        font-weight: 700 !important;
        cursor: pointer !important;
        line-height: 1.2 !important;
        white-space: nowrap !important;
        box-shadow: 0 1px 0 rgba(0,0,0,0.1) !important;
        transition: background 120ms ease, box-shadow 120ms ease, transform 80ms ease !important;
      }
      #${BTN_ETSY_ORDER_ID}:hover {
        background: #e85e22 !important;
      }
      #${BTN_ETSY_ORDER_ID}:active,
      #${BTN_ETSY_ORDER_ID}[data-kh-clicked="1"] {
        background: #d4571f !important;
        box-shadow: inset 0 1px 2px rgba(0,0,0,0.25) !important;
        transform: translateY(1px) !important;
      }

      /* HUD */
      #${HUD_ID} {
        position: fixed;
        left: 50%;
        bottom: 10px;
        transform: translateX(-50%);
        z-index: 9999;
        padding: 6px 10px;
        border-radius: 10px;
        background: rgba(0,0,0,0.35);
        color: rgba(255,255,255,0.95);
        font-size: 12px;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
        user-select: none;
        backdrop-filter: blur(2px);
        pointer-events: auto;
      }
      #${HUD_ID} .kh-hud-text { pointer-events: none; }
      #${HUD_ID} .kh-hud-total { pointer-events: auto; }
      #${HUD_ID} button {
        pointer-events: auto;
        margin-left: 8px;
        padding: 2px 8px;
        font: inherit;
        font-size: 12px;
        border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.35);
        background: rgba(255,255,255,0.12);
        color: rgba(255,255,255,0.95);
        cursor: pointer;
      }
      #${HUD_ID} button:hover {
        border-color: rgba(255,255,255,0.55);
        background: rgba(255,255,255,0.18);
      }

      /* Toast */
      #${TOAST_ID} {
        position: fixed;
        left: 50%;
        bottom: 48px; /* above HUD */
        transform: translateX(-50%);
        z-index: 10000;
        max-width: min(720px, 92vw);
        padding: 10px 12px;
        border-radius: 12px;
        background: rgba(0,0,0,0.78);
        color: rgba(255,255,255,0.96);
        font-size: 13px;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
        box-shadow: 0 6px 24px rgba(0,0,0,0.25);
        opacity: 0;
        display: none;
        transition: opacity 180ms ease;
        pointer-events: none;
      }
    `;
    document.documentElement.appendChild(style);
  }

  // ----------------------------
  // HUD
  // ----------------------------
  function ensureHud() {
    ensureStyles();

    let hud = document.getElementById(HUD_ID);
    if (!hud) {
      hud = document.createElement("div");
      hud.id = HUD_ID;

      hud.innerHTML = `
        <span class="kh-hud-text">
          <span class="kh-hud-total" title="Start date: January 3rd, 2026">Total clicks saved: <strong id="kh-total">0</strong></span> | Clicks saved today: <strong id="kh-today">0</strong>
        </span>
        <button id="kh-reset" type="button" title="Reset total + today">Reset</button>
      `;

      document.body.appendChild(hud);

      hud.querySelector("#kh-reset")?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        writeTotal(0);
        writeByDateMap({});
        updateHud();
      }, { capture: true });
    }

    updateHud();
  }

  function updateHud() {
    const hud = document.getElementById(HUD_ID);
    if (!hud) return;

    const totalEl = hud.querySelector("#kh-total");
    const todayEl = hud.querySelector("#kh-today");

    const total = readTotal();
    const ymd = getPacificYMD();
    const map = readByDateMap();
    const today = getTodayCount(map, ymd);

    if (totalEl) totalEl.textContent = String(total);
    if (todayEl) todayEl.textContent = String(today);
  }

  // ----------------------------
  // Context detection for entity status helper
  // ----------------------------
  function getEntityStatusContext() {
    const statusBtn = document.querySelector(SEL_ENTITY_STATUS_BTN);
    if (!statusBtn) return { mode: "none", state: "none", text: "" };

    const t = normText(statusBtn.textContent);

    // Sales Order
    if (t.includes("not shipped")) return { mode: "sales", state: "notShipped", text: t };
    if (t.includes("packed")) return { mode: "sales", state: "packed", text: t };

    // Manufacturing Order
    if (t.includes("not started")) return { mode: "manufacturing", state: "notStarted", text: t };
    if (t.includes("done")) return { mode: "manufacturing", state: "done", text: t };

    return { mode: "unknown", state: "unknown", text: t };
  }

  // ----------------------------
  // Sales Order Pack all flow
  // ----------------------------
  function isNotEnoughStockDialogOpen() {
    const titleEl = document.querySelector(SEL_DIALOG_TITLE);
    if (!titleEl) return false;
    return normText(titleEl.textContent).includes("not enough stock");
  }

  async function runSoPackAllFlow() {
    const statusBtn = document.querySelector(SEL_ENTITY_STATUS_BTN);
    if (!statusBtn) return false;

    dispatchRealClick(statusBtn);

    let packAllItem;
    try {
      packAllItem = await waitForSelector(SEL_SO_STATUS_PACK_ALL_ITEM, 1500);
    } catch {
      return false;
    }
    dispatchRealClick(packAllItem);

    try {
      const outcome = await waitForCondition(() => {
        if (isNotEnoughStockDialogOpen()) return "error";
        const ctx = getEntityStatusContext();
        if (ctx.mode === "sales" && ctx.state === "packed") return "packed";
        return false;
      }, 10000, 80);

      if (outcome === "error") {
        const closeBtn = document.querySelector(SEL_DIALOG_CLOSE_BTN);
        if (closeBtn) dispatchRealClick(closeBtn);
        return false; // do NOT count
      }
      return outcome === "packed";
    } catch {
      if (isNotEnoughStockDialogOpen()) {
        const closeBtn = document.querySelector(SEL_DIALOG_CLOSE_BTN);
        if (closeBtn) dispatchRealClick(closeBtn);
      }
      return false;
    }
  }

  // ----------------------------
  // Create MO flow (header button)
  // ----------------------------
  async function runCreateMoFlow() {
    if (window.location.pathname.startsWith("/add-manufacturingorder")) return;

    const createBtn = document.querySelector(SEL_CREATE_BTN);
    if (!createBtn) return;

    let moItem = document.querySelector(SEL_MO_ITEM);
    if (!moItem) {
      dispatchRealClick(createBtn);
      try {
        moItem = await waitForSelector(SEL_MO_ITEM, 1500);
      } catch {
        return;
      }
    }
    dispatchRealClick(moItem);
  }

  // ----------------------------
  // Manufacturing Order: click Done helper
  // ----------------------------
  async function runMoSetDoneFlow() {
    const statusBtn = document.querySelector(SEL_ENTITY_STATUS_BTN);
    if (!statusBtn) return false;

    dispatchRealClick(statusBtn);

    let doneItem;
    try {
      doneItem = await waitForSelector(SEL_MO_STATUS_DONE_ITEM, 1500);
    } catch {
      return false;
    }
    dispatchRealClick(doneItem);

    try {
      await waitForCondition(() => {
        const ctx = getEntityStatusContext();
        return ctx.mode === "manufacturing" && ctx.state === "done";
      }, 7000, 90);
      return true;
    } catch {
      return false;
    }
  }

  // ----------------------------
  // SO Row EX flow (Make in batch -> qty 1 -> Create and open order)
  // ----------------------------
  function getClosestAgRow(el) {
    return el?.closest?.(".ag-row") || null;
  }

  async function runSoExX1Flow(rowEl) {
    const actionsBtn = rowEl.querySelector(SEL_SO_ROW_ACTIONS_BTN);
    if (!actionsBtn) return { ok: false };

    dispatchRealClick(actionsBtn);

    let makeInBatch;
    try {
      makeInBatch = await waitForSelector(SEL_SO_MENU_MAKE_IN_BATCH, 2000);
    } catch {
      return { ok: false };
    }
    dispatchRealClick(makeInBatch);

    let qtyInput;
    try {
      qtyInput = await waitForSelector(SEL_BATCH_QTY_INPUT, 3000);
    } catch {
      return { ok: false };
    }

    dispatchRealClick(qtyInput);
    setReactInputValue(qtyInput, "1");

    try {
      await waitForCondition(() => {
        const v = (document.querySelector(SEL_BATCH_QTY_INPUT)?.value || "").trim();
        return v === "1";
      }, 1500, 50);
    } catch {
      return { ok: false };
    }

    let createAndOpen;
    try {
      createAndOpen = await waitForSelector(SEL_CREATE_AND_OPEN, 2000);
    } catch {
      return { ok: false };
    }

    const originUrl = window.location.href;
    const prevUrl = window.location.href;
    dispatchRealClick(createAndOpen);

    try {
      await waitForCondition(() => window.location.href !== prevUrl, 8000, 80);
      return { ok: true, originUrl };
    } catch {
      try {
        await waitForCondition(() => window.location.pathname.includes("manufacturing"), 5000, 100);
        return { ok: true, originUrl };
      } catch {
        return { ok: false };
      }
    }
  }

  // ----------------------------
  // Ultra EX: availability scan (AG Grid-safe)
  // Key fixes:
  //  - hard 6000ms settle
  //  - ONLY scan ingredient body rows: #ingredients-grid .ag-body .ag-center-cols-viewport
  //  - ONLY count real grid cells: [role="gridcell"][col-id="availability3"]
  // ----------------------------

  function findIngredientsBodyRoot() {
    // This matches your “all relevant rows/cells are contained here”
    return document.querySelector(`${INGREDIENTS_GRID_ID} .ag-body.ag-layout-auto-height`) ||
           document.querySelector(`${INGREDIENTS_GRID_ID} .ag-body`) ||
           null;
  }

  function findIngredientsViewport(bodyRoot) {
    if (!bodyRoot) return null;
    return bodyRoot.querySelector(".ag-body-viewport") || null;
  }

  function findCenterColsViewport(bodyRoot) {
    if (!bodyRoot) return null;
    return bodyRoot.querySelector(".ag-center-cols-viewport") || null;
  }

  function getAvailabilityCells(bodyRoot) {
    // IMPORTANT:
    // - role="gridcell" excludes header cells (role="columnheader")
    // - scoping to center-cols-viewport excludes pinned totals + other non-body areas
    const center = findCenterColsViewport(bodyRoot);
    if (!center) return [];
    return Array.from(center.querySelectorAll('[role="gridcell"][col-id="availability3"]'));
  }

  function getRowKeyFromCell(cell) {
    const row = cell.closest(".ag-row");
    if (!row) return null;

    return (
      row.getAttribute("row-id") ||
      row.getAttribute("row-index") ||
      row.getAttribute("aria-rowindex") ||
      row.dataset?.rowId ||
      row.dataset?.rowIndex ||
      row.style?.top ||
      null
    );
  }

  function classifyAvailabilityCell(cell) {
    const t = normText(cell?.innerText);
    if (!t) return "loading";
    if (t.includes("not available")) return "not_available";
    if (t.includes("in stock")) return "in_stock";
    // If Katana uses other text sometimes, we keep it "unknown" (treated as not-ready)
    return "unknown";
  }

  function mergeStatus(prev, next) {
    // Worst-case priority: not_available > unknown > loading > in_stock
    const rank = { in_stock: 0, loading: 1, unknown: 2, not_available: 3 };
    if (!prev) return next;
    return rank[next] > rank[prev] ? next : prev;
  }

  function snapshotVisibleAvailability(bodyRoot) {
    const cells = getAvailabilityCells(bodyRoot);

    const out = {
      cellsFound: 0,
      in_stock: 0,
      not_available: 0,
      loading: 0,
      unknown: 0,
      items: [], // { key, status }
    };

    for (const cell of cells) {
      // Only count cells that actually belong to a data row
      const row = cell.closest(".ag-row");
      if (!row) continue;

      const key = getRowKeyFromCell(cell);
      if (!key) continue;

      const status = classifyAvailabilityCell(cell);
      out.cellsFound += 1;
      out[status] += 1;
      out.items.push({ key, status });
    }

    return out;
  }

  async function waitForIngredientsGridHydrated({
    maxWaitMs = ULTRA_MAX_WAIT_FOR_READY_MS,
    pollMs = ULTRA_READY_POLL_MS,
  } = {}) {
    const start = Date.now();
    let lastError = null;

    const isReady = () => {
      const body = findIngredientsBodyRoot();
      if (!body) return false;
      const vp = findIngredientsViewport(body);
      const center = findCenterColsViewport(body);
      if (!vp || !center) return false;

      const cells = getAvailabilityCells(body);
      if (!cells.length) return false;

      for (const c of cells) {
        const s = classifyAvailabilityCell(c);
        if (s === "in_stock" || s === "not_available") return true;
      }
      return false;
    };

    while (Date.now() - start < maxWaitMs) {
      try {
        if (isReady()) return { ready: true, elapsedMs: Date.now() - start };
      } catch (err) {
        lastError = err;
      }
      await sleep(pollMs);
    }

    if (lastError) log("Grid readiness check error:", lastError);
    return { ready: false, elapsedMs: Date.now() - start };
  }

  async function collectAllAvailabilityWithScrolling({
    timeoutMs = ULTRA_SCAN_TIMEOUT_MS,
    passLimit = 3,
    stepFactor = 0.85,
    onUpdate,
  } = {}) {
    const start = Date.now();

    const bodyRoot = findIngredientsBodyRoot();
    if (!bodyRoot) return { ok: false, reason: "no_body_root", diag: { note: "no #ingredients-grid .ag-body" } };

    const viewport = findIngredientsViewport(bodyRoot);
    if (!viewport) return { ok: false, reason: "no_viewport", diag: { note: "no .ag-body-viewport" } };

    const originalScrollTop = viewport.scrollTop;

    const runOnePass = async (passIndex) => {
      const statusMap = new Map();

      viewport.scrollTop = 0;
      await sleep(90);

      const maxScroll = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
      const step = Math.max(220, Math.floor(viewport.clientHeight * stepFactor));

      let guard = 0;
      const emitUpdate = () => {
        const counts = { in_stock: 0, not_available: 0, loading: 0, unknown: 0 };
        for (const s of statusMap.values()) counts[s] += 1;
        const diag = {
          rowsSeen: statusMap.size,
          ...counts,
          maxScroll: Math.round(viewport.scrollHeight - viewport.clientHeight),
          scrollTop: Math.round(viewport.scrollTop),
          pass: passIndex,
        };
        onUpdate?.(diag);
      };

      while (guard++ < 900) {
        await sleep(60);

        const snap = snapshotVisibleAvailability(bodyRoot);
        for (const it of snap.items) {
          const prev = statusMap.get(it.key);
          statusMap.set(it.key, mergeStatus(prev, it.status));
        }
        emitUpdate();

        if (maxScroll <= 2) break;

        const cur = viewport.scrollTop;
        if (cur >= maxScroll - 2) break;

        const next = Math.min(maxScroll, cur + step);
        if (next === cur) break;

        viewport.scrollTop = next;
      }

      // Final bottom scan
      if (viewport.scrollHeight - viewport.clientHeight > 2) {
        viewport.scrollTop = viewport.scrollHeight;
        await sleep(140);

        const snapBottom = snapshotVisibleAvailability(bodyRoot);
        for (const it of snapBottom.items) {
          const prev = statusMap.get(it.key);
          statusMap.set(it.key, mergeStatus(prev, it.status));
        }
      }

      let counts = { in_stock: 0, not_available: 0, loading: 0, unknown: 0 };
      for (const s of statusMap.values()) counts[s] += 1;

      const diag = {
        rowsSeen: statusMap.size,
        ...counts,
        maxScroll: Math.round(viewport.scrollHeight - viewport.clientHeight),
        scrollTop: Math.round(viewport.scrollTop),
        pass: passIndex,
      };

      const ready = diag.rowsSeen > 0 && diag.loading === 0 && diag.unknown === 0;
      return { ready, diag };
    };

    let lastDiag = null;
    let stableCount = 0;

    let pass = 0;
    while (Date.now() - start <= timeoutMs) {
      pass += 1;
      if (pass > passLimit && lastDiag?.loading === 0 && lastDiag?.unknown === 0) break;

      const prevDiag = lastDiag;
      const { ready, diag } = await runOnePass(pass);
      diag.pass = pass;
      lastDiag = diag;

      if (ready && prevDiag) {
        const stableNow =
          prevDiag.rowsSeen === diag.rowsSeen &&
          diag.loading === 0 &&
          diag.unknown === 0;
        stableCount = stableNow ? stableCount + 1 : 0;
      } else {
        stableCount = 0;
      }

      if (ready && stableCount >= 1) {
        viewport.scrollTop = originalScrollTop;

        if (diag.not_available > 0) return { ok: true, allInStock: false, diag };
        if (diag.in_stock === diag.rowsSeen && diag.rowsSeen > 0) return { ok: true, allInStock: true, diag };
        return { ok: false, reason: "inconsistent", diag };
      }

      await sleep(300);
    }

    viewport.scrollTop = originalScrollTop;
    return {
      ok: false,
      reason: "timeout",
      diag: lastDiag || { note: "no diag" },
    };
  }

  async function runUltraAfterMoOpen(originUrl) {
    try {
      await waitForSelector(SEL_ENTITY_STATUS_BTN, 20000);
    } catch {
      showToast("Ultra EX stopped: couldn't find MO status control. Finish manually.", 5200);
      return { ok: false, ultraDone: false };
    }

    const ctx0 = getEntityStatusContext();
    if (ctx0.mode === "manufacturing" && ctx0.state === "done") {
      history.back();
      return { ok: true, ultraDone: true };
    }

    const stopCountdown = startCountdownToast(
      ULTRA_MAX_WAIT_FOR_READY_MS,
      ULTRA_READY_COUNTDOWN_THRESHOLD_MS,
      (remainingMs) => {
        const secs = (remainingMs / 1000).toFixed(1);
        showToast(`Ultra EX: waiting for grid… ${secs}s`, 1300);
      }
    );

    const readiness = await waitForIngredientsGridHydrated({
      maxWaitMs: ULTRA_MAX_WAIT_FOR_READY_MS,
      pollMs: ULTRA_READY_POLL_MS,
    });
    stopCountdown();

    if (!readiness.ready) {
      showToast("Ultra EX: grid still loading — scanning anyway…", 2400);
    }

    let latestDiag = {
      rowsSeen: 0,
      in_stock: 0,
      not_available: 0,
      loading: 0,
      unknown: 0,
      pass: 1,
      maxScroll: 0,
      scrollTop: 0,
    };

    const scanPassLimit = 3;
    const stopSpinner = startSpinnerToast(() => {
      const d = latestDiag;
      const passText = d.pass ? `pass ${d.pass}` : "pass 1";
      const scrollProbe = DEBUG ? ` | scroll ${d.scrollTop}/${d.maxScroll}` : "";
      return `Ultra EX: scanning… ${passText} | rows ${d.rowsSeen} (in ${d.in_stock}, not ${d.not_available}, load ${d.loading}, unk ${d.unknown})${scrollProbe}`;
    });

    const scanRes = await collectAllAvailabilityWithScrolling({
      timeoutMs: ULTRA_SCAN_TIMEOUT_MS,
      passLimit: scanPassLimit,
      stepFactor: 0.85,
      onUpdate: (diag) => {
        latestDiag = { ...latestDiag, ...diag };
      },
    });
    stopSpinner();

    if (!scanRes.ok) {
      const d = scanRes.diag || {};
      const msg =
        scanRes.reason === "timeout"
          ? `Ultra EX stopped: availability didn’t finish loading (rows=${d.rowsSeen ?? "?"}, blank=${d.loading ?? "?"}, unknown=${d.unknown ?? "?"}). Finish manually.`
          : `Ultra EX stopped: couldn't verify availability (${scanRes.reason}). Finish manually.`;
      showToast(msg, 6500);
      return { ok: false, ultraDone: false };
    }

    if (!scanRes.allInStock) {
      const d = scanRes.diag || {};
      showToast(
        `Ultra EX stopped: not all ingredients are in stock (rows=${d.rowsSeen ?? "?"}, notAvail=${d.not_available ?? "?"}). Finish this MO manually.`,
        6500
      );
      return { ok: false, ultraDone: false };
    }

    const d = scanRes.diag || {};
    showToast(
      `Ultra EX OK — rows: ${d.rowsSeen ?? "?"} (in ${d.in_stock ?? "?"}, not ${d.not_available ?? "?"}, unk ${d.unknown ?? "?"}). Marking Done…`,
      2600
    );

    const doneOk = await runMoSetDoneFlow();
    if (!doneOk) {
      showToast("Ultra EX stopped: could not mark MO as Done. Finish manually.", 5600);
      return { ok: false, ultraDone: false };
    }

    showToast("Ultra EX: marked Done. Returning to sales order…", 2200);
    history.back();

    setTimeout(() => {
      if (originUrl && window.location.href.includes("manufacturing")) {
        window.location.href = originUrl;
      }
    }, 2500);

    return { ok: true, ultraDone: true };
  }

  // ----------------------------
  // Injection: Create MO button (header)
  // ----------------------------
  function ensureCreateMoButton() {
    ensureStyles();

    const createBtn = document.querySelector(SEL_CREATE_BTN);
    if (!createBtn) return;

    if (document.getElementById(BTN_CREATE_MO_ID)) return;

    const parent = createBtn.parentElement;
    if (!parent) return;

    const btn = document.createElement("button");
    btn.id = BTN_CREATE_MO_ID;
    btn.type = "button";
    btn.textContent = "Create MO";

    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      incrementCounters(1);
      await runCreateMoFlow();
    }, { capture: true });

    parent.insertBefore(btn, createBtn);
  }

  // ----------------------------
  // Injection: Entity status helper
  //   - Manufacturing Orders: show ONLY "Done" helper when Not started; hide when Done
  //   - Sales Orders: show "Pack all" ONLY when Not shipped; hide when Packed
  // ----------------------------
  function ensureEntityStatusHelper() {
    ensureStyles();

    const statusBtn = document.querySelector(SEL_ENTITY_STATUS_BTN);
    if (!statusBtn) return;

    const parent = statusBtn.parentElement;
    if (!parent) return;

    let helper = document.getElementById(BTN_STATUS_HELPER_ID);
    if (!helper) {
      helper = document.createElement("button");
      helper.id = BTN_STATUS_HELPER_ID;
      helper.type = "button";
      helper.textContent = "";

      helper.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (helper.getAttribute("data-kh-running") === "1") return;
        helper.setAttribute("data-kh-running", "1");

        try {
          const ctx = getEntityStatusContext();

          if (ctx.mode === "manufacturing" && ctx.state === "notStarted") {
            const ok = await runMoSetDoneFlow();
            if (ok) {
              incrementCounters(1);
            }
            return;
          }

          if (ctx.mode === "sales" && ctx.state === "notShipped") {
            const ok = await runSoPackAllFlow();
            if (ok) {
              incrementCounters(1);
            }
            return;
          }
        } finally {
          helper.setAttribute("data-kh-running", "0");
        }
      }, { capture: true });

      parent.insertBefore(helper, statusBtn);
    }

    const ctx = getEntityStatusContext();
    helper.classList.remove("kh-mo-done", "kh-so-packall");
    helper.style.display = "";
    helper.title = "";

    if (ctx.mode === "manufacturing") {
      if (ctx.state === "done") {
        helper.style.display = "none";
        return;
      }
      if (ctx.state === "notStarted") {
        helper.textContent = "Done";
        helper.classList.add("kh-mo-done");
        helper.title = "Mark MO as Done";
        return;
      }
      helper.style.display = "none";
      return;
    }

    if (ctx.mode === "sales") {
      if (ctx.state === "notShipped") {
        helper.textContent = "Pack all";
        helper.classList.add("kh-so-packall");
        helper.title = "Pack all (won't count if 'Not enough stock' appears)";
        return;
      }
      helper.style.display = "none";
      return;
    }

    helper.style.display = "none";
  }

  // ----------------------------
  // Injection: SO row EX buttons (single click vs double click via 250ms timer)
  // ----------------------------
  const exTimers = new WeakMap(); // button -> timeout id

  function setExButtonUltraVisual(btn, on) {
    if (on) btn.classList.add("kh-ultra");
    else btn.classList.remove("kh-ultra");
  }

  function setRunning(btn, on) {
    btn.setAttribute("data-kh-running", on ? "1" : "0");
  }

  function ensureSoExButtons() {
    ensureStyles();

    const actionButtons = document.querySelectorAll(SEL_SO_ROW_ACTIONS_BTN);
    if (!actionButtons.length) return;

    actionButtons.forEach((plusBtn) => {
      const container = plusBtn.parentElement;
      if (!container) return;

      if (container.querySelector(`button.${BTN_SO_EX_CLASS}`)) return;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = BTN_SO_EX_CLASS;
      btn.textContent = "EX";

      btn.title =
        `EX (single-click): Make in batch (qty=1) and open the MO.\n` +
        `Ultra EX (double-click within ${DOUBLE_CLICK_WINDOW_MS}ms): Do EX, then if all ingredients are In stock → mark MO Done and return here.`;

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (btn.getAttribute("data-kh-running") === "1") return;

        const existingTimer = exTimers.get(btn);

        // Second click within window => Ultra
        if (existingTimer) {
          clearTimeout(existingTimer);
          exTimers.delete(btn);

          (async () => {
            setRunning(btn, true);
            setExButtonUltraVisual(btn, true);

            const rowEl = getClosestAgRow(btn);
            if (!rowEl) {
              setExButtonUltraVisual(btn, false);
              setRunning(btn, false);
              return;
            }

            const exRes = await runSoExX1Flow(rowEl);
            if (!exRes.ok) {
              setExButtonUltraVisual(btn, false);
              setRunning(btn, false);
              return;
            }

            incrementCounters(SAVED_CLICKS_EX_NORMAL);

            const ultraRes = await runUltraAfterMoOpen(exRes.originUrl);
            if (ultraRes.ok && ultraRes.ultraDone) {
              incrementCounters(SAVED_CLICKS_ULTRA_EXTRA);
            }

            setExButtonUltraVisual(btn, false);
            setRunning(btn, false);
          })();

          return;
        }

        // First click => schedule normal EX if no second click comes in
        const t = setTimeout(() => {
          exTimers.delete(btn);

          (async () => {
            setRunning(btn, true);
            setExButtonUltraVisual(btn, false);

            try {
              const rowEl = getClosestAgRow(btn);
              if (!rowEl) return;

              const exRes = await runSoExX1Flow(rowEl);
              if (exRes.ok) {
                incrementCounters(SAVED_CLICKS_EX_NORMAL);
              }
            } finally {
              setRunning(btn, false);
            }
          })();
        }, DOUBLE_CLICK_WINDOW_MS);

        exTimers.set(btn, t);
      }, { capture: true });

      container.insertBefore(btn, plusBtn);
    });
  }

  function findMuiGridAncestor(el, type) {
    let node = el;
    const prefix = `MuiGrid-${type}`;
    while (node && node !== document.body) {
      if (node.classList && [...node.classList].some(cls => cls.startsWith(prefix))) {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  }

  function getEtsyOrderIdFromHeader() {
    const header = document.querySelector('[data-testid="headerNameSALESORDER"]');
    const text = header?.textContent || "";
    const match = text.match(/ETSY[\s\-_]+(\d+)/i);
    return match?.[1] || "";
  }

  // ----------------------------
  // Injection: Etsy order button next to Sales order #
  // ----------------------------
  function ensureEtsyOrderButton() {
    ensureStyles();

    const soOrderField = document.querySelector(".soOrderNo");
    if (!soOrderField) return;

    const gridContainer = findMuiGridAncestor(soOrderField, "container");
    if (!gridContainer) return;

    const soOrderItem = findMuiGridAncestor(soOrderField, "item");
    if (!soOrderItem) return;

    const orderInput = soOrderField.querySelector('input[name="orderNo"]');
    const orderValue = orderInput?.value || "";
    const isEtsyOrder = orderValue.toLowerCase().includes("etsy");

    const existingBtn = document.getElementById(BTN_ETSY_ORDER_ID);
    const existingCell = document.getElementById(ETSY_ORDER_CELL_ID);
    if (!isEtsyOrder) {
      existingBtn?.remove();
      if (existingCell && !existingCell.querySelector("button")) {
        existingCell.remove();
      }
      return;
    }

    if (existingBtn) return;

    let cell = existingCell;
    if (!cell) {
      cell = document.createElement("div");
      const baseItemClasses = [...soOrderItem.classList]
        .filter(cls => cls.startsWith("MuiGrid-root") || cls.startsWith("MuiGrid-item"))
        .join(" ");
      cell.id = ETSY_ORDER_CELL_ID;
      cell.className = `${baseItemClasses} kh-etsy-order-cell`.trim();
      gridContainer.insertBefore(cell, soOrderItem.nextSibling);
    }

    const btn = document.createElement("button");
    btn.id = BTN_ETSY_ORDER_ID;
    btn.type = "button";
    btn.textContent = "Etsy";
    btn.title = "Goes to Etsy order page (opens in a new window)";

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.setAttribute("data-kh-clicked", "1");
      setTimeout(() => btn.removeAttribute("data-kh-clicked"), 220);
      const orderId = getEtsyOrderIdFromHeader();
      const url = orderId ? `${ETSY_ORDER_URL}?order_id=${orderId}` : ETSY_ORDER_URL;
      window.open(url, "_blank", "noopener,noreferrer");
    }, { capture: true });

    cell.appendChild(btn);
  }

  // ----------------------------
  // SPA resilience
  // ----------------------------
  let scheduled = false;
  let lastRun = 0;

  function ensureAll() {
    scheduled = false;
    const now = Date.now();
    if (now - lastRun < 150) return;
    lastRun = now;

    ensureHud();
    ensureCreateMoButton();
    ensureEntityStatusHelper();
    ensureSoExButtons();
    ensureEtsyOrderButton();
  }

  function scheduleEnsure() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(ensureAll);
  }

  function initObserver() {
    const obs = new MutationObserver(() => scheduleEnsure());
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  // ----------------------------
  // Init
  // ----------------------------
  function init() {
    ensureAll();
    initObserver();
  }

  init();
})();
