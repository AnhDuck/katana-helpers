// ==UserScript==
// @name         Katana Helpers
// @namespace    https://factory.katanamrp.com/
// @version      2.14.2
// @description  Workflow helpers for Katana MRP.
// @match        https://factory.katanamrp.com/*
// @updateURL    https://raw.githubusercontent.com/AnhDuck/katana-helpers/main/userscript/katana-helpers.release.user.js
// @downloadURL  https://raw.githubusercontent.com/AnhDuck/katana-helpers/main/userscript/katana-helpers.release.user.js
// @run-at       document-idle
// @grant        none
// ==/UserScript==


/* src/core/constants.js */
(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};

  kh.constants = {
    version: "2.14.2",
    DEBUG: false,
    KEYS: {
      TOTAL: "kh_clicks_total",
      BY_DATE: "kh_clicks_by_date",
      RETURN_URL: "kh_return_url",
      SO_TIMERS: "kh_so_timer_state",
      SUPPLIER_BUTTONS: "kh_supplier_buttons",
      SO_INGREDIENTS_PREVIEW_ENABLED: "kh_so_ingredients_preview_enabled",
      MO_QTY_AUTOFILL_ENABLED: "kh_mo_qty_autofill_enabled",
      SO_SHIPPING_AUTOFILL_ENABLED: "kh_so_shipping_autofill_enabled",
    },
    IDS: {
      STYLE: "kh-style",
      HUD: "kh-hud",
      HUD_SO_INGREDIENTS_TOGGLE: "kh-so-ingredients-toggle",
      HUD_MO_QTY_AUTOFILL_TOGGLE: "kh-mo-qty-autofill-toggle",
      HUD_MENU_BUTTON: "kh-hud-menu-button",
      HUD_MENU: "kh-hud-menu",
      HUD_SO_SHIPPING_AUTOFILL_TOGGLE: "kh-so-shipping-autofill-toggle",
      MO_TIMER: "kh-mo-timer",
      TOAST: "kh-toast",
      BTN_CREATE_MO: "kh-create-mo-btn",
      BTN_CREATE_ULTRA_MO: "kh-create-ultra-mo-btn",
      BTN_CREATE_EX_MO: "kh-create-ex-mo-btn",
      SO_INGREDIENTS_PANEL: "kh-so-ingredients-panel",
      BTN_CREATE_PO: "kh-create-po-btn",
      BTN_STATUS_HELPER: "kh-status-helper-btn",
      BTN_MO_DONE_RETURN: "kh-mo-done-return-btn",
      WRAP_MO_DONE_RETURN: "kh-mo-done-return-wrap",
      BTN_ETSY_ORDER: "kh-etsy-order-btn",
      ETSY_ORDER_CELL: "kh-etsy-order-cell",
      BTN_PO_SUPPLIER: "kh-po-supplier-btn",
      WRAP_PO_SUPPLIER: "kh-po-supplier-wrap",
      BTN_PO_SUPPLIER_EDIT: "kh-po-supplier-edit-btn",
      PO_SUPPLIER_MODAL: "kh-po-supplier-modal",
      BTN_SIMPLYPRINT_NAV: "kh-simplyprint-nav-btn",
    },
    CLASSES: {
      LABEL_MO_DONE_RETURN: "kh-mo-done-return-label",
      BTN_SO_EX: "kh-so-ex-btn",
      SO_INGREDIENTS_PANEL: "kh-so-ingredients-panel",
      SO_INGREDIENTS_PANEL_ROW: "kh-so-ingredients-panel-row",
      ETSY_ORDER_CELL: "kh-etsy-order-cell",
      PO_SUPPLIER_BTN: "kh-po-supplier-btn",
      PO_SUPPLIER_WRAP: "kh-po-supplier-wrap",
      PO_SUPPLIER_EDIT: "kh-po-supplier-edit",
      PO_SUPPLIER_MODAL: "kh-po-supplier-modal",
      PO_SUPPLIER_MODAL_CONTENT: "kh-po-supplier-modal-content",
      PO_SUPPLIER_MODAL_ROW: "kh-po-supplier-modal-row",
      PO_SUPPLIER_MODAL_WARNING: "kh-po-supplier-modal-warning",
      PO_SUPPLIER_MODAL_ACTIONS: "kh-po-supplier-modal-actions",
      SIMPLYPRINT_NAV: "kh-simplyprint-nav-btn",
    },
    SELECTORS: {
      CREATE_BTN: 'button[data-testid="globalAddButton"]',
      MO_ITEM: 'a[data-testid="globalAddManufacturing"]',
      PO_ITEM: 'a[data-testid="globalAddPurchase"]',
      NAV_ITEMS_BTN: '[data-testid="MainNavigationPortfolio"]',
      ENTITY_STATUS_BTN: 'button[data-testid="menuButton-entityStatus"]',
      MO_STATUS_DONE_ITEM: 'li[data-testid="menuListItem-entityStatus-done"]',
      SO_STATUS_PACK_ALL_ITEM: 'li[data-testid="menuListItem-entityStatus-packAll"]',
      DIALOG_TITLE: 'div[role="dialog"] h2',
      DIALOG_CLOSE_BTN: 'div[role="dialog"] button#closeButton',
      SO_ROW_ACTIONS_BTN: 'button[data-testid="soRowActionsMenu-button"]',
      SO_INGREDIENTS_CELL: '[role="gridcell"][col-id="materialAvailability"]',
      SO_INGREDIENTS_POPUP_DIALOG: '[role="dialog"]',
      SO_INGREDIENTS_POPUP_CLOSE: 'button[data-testid="headerCloseButton"]',
      SO_MENU_MAKE_IN_BATCH: 'li[data-testid="soRowActionsMenu-item-makeInBatch"]',
      MO_DIALOG: 'div[role="dialog"]',
      MO_DIALOG_CONTENT: '[data-testid="manufacturingOrderLayoutContent"]',
      BATCH_QTY_INPUT: 'input[data-testid="singleMOLayoutQuantityInput"]',
      CREATE_AND_OPEN: 'button[data-testid="createAndOpenOrderButton"]',
      HEADER_SALES_ORDER: '[data-testid="headerNameSALESORDER"]',
      SO_ORDER_FIELD: ".soOrderNo",
      SO_ORDER_INPUT: 'input[name="orderNo"]',
      MO_PRODUCT_INPUT: 'input[data-testid="katanaAutocompleteInput"]',
      MO_PLANNED_QTY_INPUT: 'input[data-testid="mo-planned-quantity"]',
      MO_HEADER_NAME: '[data-testid="headerNameMANUFACTURINGORDER"]',
      SO_CUSTOMER_REFERENCE: '[data-testid="soCustomerReference"] input, input[placeholder="Reference number"]',
      SO_SHIPPING_GRID: '[data-testid="additionalCostsGrid"], #additionalCostsGrid',
      SO_SHIPPING_COST_CELL: '[data-testid="additionalCostsGrid"] [role="gridcell"][col-id="totalPrice"], #additionalCostsGrid [role="gridcell"][col-id="totalPrice"]',
    },
    GRID: {
      INGREDIENTS_ID: "#ingredients-grid",
      AVAILABILITY_COL_ID: "availability3",
    },
    URLS: {
      ETSY_ORDER: "https://www.etsy.com/your/orders/sold",
      SIMPLYPRINT_PANEL: "https://simplyprint.io/panel/printers",
      SIMPLYPRINT_ICON: "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://simplyprint.io/favicon.ico&size=64",
    },
    CONFIG: {
      DOUBLE_CLICK_WINDOW_MS: 250,
      SAVED_CLICKS_EX_NORMAL: 4,
      SAVED_CLICKS_EX_MANUAL_DIALOG: 2,
      SAVED_CLICKS_ULTRA_EXTRA: 2,
      ULTRA_MAX_WAIT_FOR_READY_MS: 7000,
      ULTRA_READY_POLL_MS: 140,
      ULTRA_READY_COUNTDOWN_THRESHOLD_MS: 1500,
      ULTRA_WAIT_GRID_MS: 20000,
      ULTRA_SCAN_TIMEOUT_MS: 30000,
      PO_SUPPLIER_BUTTON_BG: "#2563eb",
      PO_SUPPLIER_BUTTON_TEXT: "#fff",
      PO_SUPPLIER_BUTTON_DISABLED_BG: "#e2e8f0",
      PO_SUPPLIER_BUTTON_DISABLED_TEXT: "#64748b",
      MO_QTY_AUTOFILL_POLL_MS: 180,
      MO_QTY_AUTOFILL_SETTLE_MS: 650,
      MO_QTY_AUTOFILL_HEADER_WAIT_MS: 2400,
      SO_SHIPPING_AUTOFILL_POLL_MS: 350,
      SO_SHIPPING_AUTOFILL_SETTLE_MS: 700,
    },
  };
})();


/* src/core/utils.js */
(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants } = kh;

  const log = (...args) => constants.DEBUG && console.log("[KatanaHelpers]", ...args);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const safeJsonParse = (value, fallback) => {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  const ensureElement = (id, tag = "div", parent = document.body) => {
    let el = document.getElementById(id);
    if (el) return { el, created: false };
    el = document.createElement(tag);
    el.id = id;
    parent.appendChild(el);
    return { el, created: true };
  };

  const createButton = ({ id, className, text, title, onClick }) => {
    const btn = document.createElement("button");
    if (id) btn.id = id;
    if (className) btn.className = className;
    btn.type = "button";
    if (text) btn.textContent = text;
    if (title) btn.title = title;
    if (onClick) btn.addEventListener("click", onClick, { capture: true });
    return btn;
  };

  const getPacificYMD = () => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Vancouver",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());

    const y = parts.find((p) => p.type === "year")?.value ?? "0000";
    const m = parts.find((p) => p.type === "month")?.value ?? "00";
    const d = parts.find((p) => p.type === "day")?.value ?? "00";
    return `${y}-${m}-${d}`;
  };

  const waitForSelector = (selector, timeoutMs = 1500, root = document) => new Promise((resolve, reject) => {
    const existing = root.querySelector(selector);
    if (existing) return resolve(existing);

    const obs = new MutationObserver(() => {
      const el = root.querySelector(selector);
      if (el) {
        clearTimeout(timer);
        obs.disconnect();
        resolve(el);
      }
    });

    obs.observe(document.body, { childList: true, subtree: true });

    const timer = setTimeout(() => {
      obs.disconnect();
      reject(new Error(`Timeout waiting for ${selector}`));
    }, timeoutMs);
  });

  const waitForCondition = (checkFn, timeoutMs = 8000, intervalMs = 80) => new Promise((resolve, reject) => {
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

  const dispatchRealClick = (el) => {
    el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window }));
    el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window }));
    el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
  };

  const setReactInputValue = (input, value) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    if (setter) setter.call(input, value);
    else input.value = value;

    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const normText = (text) => (text || "").replace(/\s+/g, " ").trim().toLowerCase();

  const findMuiGridAncestor = (el, type) => {
    let node = el;
    const prefix = `MuiGrid-${type}`;
    while (node && node !== document.body) {
      if (node.classList && [...node.classList].some((cls) => cls.startsWith(prefix))) {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  };

  kh.utils = {
    log,
    sleep,
    safeJsonParse,
    ensureElement,
    createButton,
    getPacificYMD,
    waitForSelector,
    waitForCondition,
    dispatchRealClick,
    setReactInputValue,
    normText,
    findMuiGridAncestor,
  };
})();


/* src/core/storage.js */
(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants, utils } = kh;

  const storageAvailable = () => {
    try {
      const key = "__kh_test__";
      localStorage.setItem(key, "1");
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  };

  const HAS_STORAGE = storageAvailable();
  let mem = {
    total: 0,
    byDate: {},
    supplierButtons: {},
    soIngredientsPreviewEnabled: true,
    moQtyAutofillEnabled: true,
    soShippingAutofillEnabled: true,
  };

  const normalizeCount = (value) => {
    const parsed = typeof value === "number" ? value : parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return 0;
    return Math.floor(parsed);
  };

  const readTotal = () => {
    if (!HAS_STORAGE) return normalizeCount(mem.total);
    const raw = localStorage.getItem(constants.KEYS.TOTAL);
    return normalizeCount(raw);
  };

  const writeTotal = (value) => {
    const next = normalizeCount(value);
    if (!HAS_STORAGE) {
      mem.total = next;
      return;
    }
    localStorage.setItem(constants.KEYS.TOTAL, String(next));
  };

  const readByDateMap = () => {
    if (!HAS_STORAGE) return mem.byDate;
    const raw = localStorage.getItem(constants.KEYS.BY_DATE);
    const obj = utils.safeJsonParse(raw || "{}", {});
    return obj && typeof obj === "object" ? obj : {};
  };

  const writeByDateMap = (map) => {
    const normalized = {};
    Object.entries(map || {}).forEach(([key, value]) => {
      const count = normalizeCount(value);
      if (count > 0) normalized[key] = count;
    });
    if (!HAS_STORAGE) {
      mem.byDate = normalized;
      return;
    }
    localStorage.setItem(constants.KEYS.BY_DATE, JSON.stringify(normalized));
  };

  const getTodayCount = (map, ymd) => {
    return normalizeCount(map?.[ymd]);
  };

  const normalizeSupplierName = (name) => utils.normText(name || "");

  const readSupplierButtons = () => {
    if (!HAS_STORAGE) return mem.supplierButtons;
    const raw = localStorage.getItem(constants.KEYS.SUPPLIER_BUTTONS);
    const obj = utils.safeJsonParse(raw || "{}", {});
    return obj && typeof obj === "object" ? obj : {};
  };

  const writeSupplierButtons = (map) => {
    if (!HAS_STORAGE) {
      mem.supplierButtons = map;
      return;
    }
    localStorage.setItem(constants.KEYS.SUPPLIER_BUTTONS, JSON.stringify(map));
  };

  const readSoIngredientsPreviewEnabled = () => {
    if (!HAS_STORAGE) return mem.soIngredientsPreviewEnabled;
    const raw = localStorage.getItem(constants.KEYS.SO_INGREDIENTS_PREVIEW_ENABLED);
    return raw == null ? true : raw === "1";
  };

  const writeSoIngredientsPreviewEnabled = (enabled) => {
    const next = enabled ? "1" : "0";
    if (!HAS_STORAGE) {
      mem.soIngredientsPreviewEnabled = enabled;
      return;
    }
    localStorage.setItem(constants.KEYS.SO_INGREDIENTS_PREVIEW_ENABLED, next);
  };

  const readMoQtyAutofillEnabled = () => {
    if (!HAS_STORAGE) return mem.moQtyAutofillEnabled;
    const raw = localStorage.getItem(constants.KEYS.MO_QTY_AUTOFILL_ENABLED);
    return raw == null ? true : raw === "1";
  };

  const writeMoQtyAutofillEnabled = (enabled) => {
    const next = enabled ? "1" : "0";
    if (!HAS_STORAGE) {
      mem.moQtyAutofillEnabled = enabled;
      return;
    }
    localStorage.setItem(constants.KEYS.MO_QTY_AUTOFILL_ENABLED, next);
  };

  const readSoShippingAutofillEnabled = () => {
    if (!HAS_STORAGE) return mem.soShippingAutofillEnabled;
    const raw = localStorage.getItem(constants.KEYS.SO_SHIPPING_AUTOFILL_ENABLED);
    return raw == null ? true : raw === "1";
  };

  const writeSoShippingAutofillEnabled = (enabled) => {
    const next = enabled ? "1" : "0";
    if (!HAS_STORAGE) {
      mem.soShippingAutofillEnabled = enabled;
      return;
    }
    localStorage.setItem(constants.KEYS.SO_SHIPPING_AUTOFILL_ENABLED, next);
  };

  const upsertSupplierButton = (supplierName, data) => {
    const key = normalizeSupplierName(supplierName);
    if (!key) return null;
    const map = readSupplierButtons();
    const next = {
      ...map,
      [key]: {
        ...(map[key] || {}),
        ...data,
      },
    };
    writeSupplierButtons(next);
    return next[key];
  };

  const normalizeReturnUrl = (rawUrl) => {
    if (!rawUrl) return "";
    if (rawUrl.startsWith("/")) {
      const abs = new URL(rawUrl, window.location.origin);
      return abs.href;
    }
    try {
      const parsed = new URL(rawUrl);
      if (parsed.origin !== window.location.origin) return "";
      return parsed.href;
    } catch {
      return "";
    }
  };

  const isSameUrl = (a, b) => {
    if (!a || !b) return false;
    try {
      return new URL(a).href === new URL(b).href;
    } catch {
      return false;
    }
  };

  const getStoredReturnUrl = () => {
    try {
      return sessionStorage.getItem(constants.KEYS.RETURN_URL) || "";
    } catch {
      return "";
    }
  };

  const storeReturnUrl = (rawUrl) => {
    if (!rawUrl) return;
    const normalized = normalizeReturnUrl(rawUrl);
    if (!normalized) return;
    try {
      sessionStorage.setItem(constants.KEYS.RETURN_URL, normalized);
    } catch {
      // ignore
    }
  };

  const maybeStoreReturnUrlFromReferrer = () => {
    const existing = normalizeReturnUrl(getStoredReturnUrl());
    if (existing && !isSameUrl(existing, window.location.href)) return;

    if (!document.referrer) return;

    let refUrl = "";
    try {
      const ref = new URL(document.referrer);
      if (ref.origin !== window.location.origin) return;
      refUrl = ref.href;
    } catch {
      return;
    }

    const current = window.location.href;
    if (isSameUrl(refUrl, current)) return;
    storeReturnUrl(refUrl);
  };

  kh.storage = {
    readTotal,
    writeTotal,
    readByDateMap,
    writeByDateMap,
    getTodayCount,
    normalizeSupplierName,
    readSupplierButtons,
    writeSupplierButtons,
    readSoIngredientsPreviewEnabled,
    writeSoIngredientsPreviewEnabled,
    readMoQtyAutofillEnabled,
    writeMoQtyAutofillEnabled,
    readSoShippingAutofillEnabled,
    writeSoShippingAutofillEnabled,
    upsertSupplierButton,
    normalizeReturnUrl,
    isSameUrl,
    getStoredReturnUrl,
    storeReturnUrl,
    maybeStoreReturnUrlFromReferrer,
  };
})();


/* src/ui/styles.js */
(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants } = kh;

  const ensureStyles = () => {
    if (document.getElementById(constants.IDS.STYLE)) return;

    const style = document.createElement("style");
    style.id = constants.IDS.STYLE;
    style.textContent = `
      #${constants.IDS.BTN_CREATE_MO} {
        background: #7c3aed !important;
        color: #fff !important;
        border: 1px solid #6d28d9 !important;
        border-radius: 6px !important;
        padding: 6px 10.8px !important;
        margin-right: 10px !important;
        font: inherit !important;
        cursor: pointer !important;
        line-height: 1.2 !important;
        white-space: nowrap !important;
      }
      #${constants.IDS.BTN_CREATE_MO}:hover { background: #6d28d9 !important; border-color: #5b21b6 !important; }
      #${constants.IDS.BTN_CREATE_MO}:active { background: #5b21b6 !important; transform: translateY(0.5px) !important; }

      #${constants.IDS.BTN_CREATE_ULTRA_MO},
      #${constants.IDS.BTN_CREATE_EX_MO} {
        background: #dc2626 !important;
        color: #fff !important;
        border: 1px solid #b91c1c !important;
        border-radius: 6px !important;
        padding: 6px 10.8px !important;
        margin-left: 8px !important;
        font: inherit !important;
        font-weight: 800 !important;
        cursor: pointer !important;
        line-height: 1.2 !important;
        white-space: nowrap !important;
      }
      #${constants.IDS.BTN_CREATE_ULTRA_MO}:hover,
      #${constants.IDS.BTN_CREATE_EX_MO}:hover { background: #b91c1c !important; border-color: #991b1b !important; }
      #${constants.IDS.BTN_CREATE_ULTRA_MO}:active,
      #${constants.IDS.BTN_CREATE_EX_MO}:active { background: #991b1b !important; transform: translateY(0.5px) !important; }
      #${constants.IDS.BTN_CREATE_ULTRA_MO}[data-kh-running="1"],
      #${constants.IDS.BTN_CREATE_ULTRA_MO}:disabled,
      #${constants.IDS.BTN_CREATE_EX_MO}[data-kh-running="1"],
      #${constants.IDS.BTN_CREATE_EX_MO}:disabled {
        opacity: 0.68 !important;
        cursor: progress !important;
      }

      #${constants.IDS.BTN_CREATE_PO} {
        background: #0f172a !important;
        color: #fff !important;
        border: 1px solid #1e293b !important;
        border-radius: 6px !important;
        padding: 6px 10.8px !important;
        margin-right: 10px !important;
        font: inherit !important;
        cursor: pointer !important;
        line-height: 1.2 !important;
        white-space: nowrap !important;
      }
      #${constants.IDS.BTN_CREATE_PO}:hover { background: #1e293b !important; border-color: #334155 !important; }
      #${constants.IDS.BTN_CREATE_PO}:active { background: #020617 !important; transform: translateY(0.5px) !important; }

      #${constants.IDS.BTN_STATUS_HELPER} {
        margin-right: 10px !important;
        background: #e2e8f0 !important;
        color: #0f172a !important;
        border: 1px solid #cbd5e1 !important;
        border-radius: 6px !important;
        padding: 6px 12px !important;
        font: inherit !important;
        cursor: pointer !important;
        line-height: 1.2 !important;
        white-space: nowrap !important;
        font-weight: 800 !important;
      }
      #${constants.IDS.BTN_STATUS_HELPER}[data-kh-running="1"] {
        opacity: 0.6 !important;
        cursor: progress !important;
      }

      #${constants.IDS.BTN_STATUS_HELPER}.kh-mo-done {
        background: #16a34a !important;
        color: #fff !important;
        border-color: #15803d !important;
      }

      #${constants.IDS.BTN_STATUS_HELPER}.kh-so-packall {
        background: #f59e0b !important;
        color: #1f2937 !important;
        border-color: #d97706 !important;
      }

      #${constants.IDS.BTN_STATUS_HELPER}:hover { background: #cbd5e1 !important; border-color: #94a3b8 !important; }
      #${constants.IDS.BTN_STATUS_HELPER}.kh-mo-done:hover { background: #15803d !important; border-color: #166534 !important; }
      #${constants.IDS.BTN_STATUS_HELPER}.kh-so-packall:hover { background: #d97706 !important; border-color: #b45309 !important; }
      #${constants.IDS.BTN_STATUS_HELPER}:active { transform: translateY(0.5px) !important; }

      #${constants.IDS.WRAP_MO_DONE_RETURN} {
        display: inline-flex !important;
        flex-direction: column !important;
        align-items: center !important;
        margin-right: 10px !important;
        line-height: 1.1 !important;
      }
      #${constants.IDS.BTN_MO_DONE_RETURN} {
        border: 1px solid #1d4ed8 !important;
        border-radius: 6px !important;
        padding: 6px 12px !important;
        font: inherit !important;
        cursor: pointer !important;
        line-height: 1.2 !important;
        white-space: nowrap !important;
        font-weight: 800 !important;
        background: #2563eb !important;
        color: #fff !important;
      }
      #${constants.IDS.BTN_MO_DONE_RETURN}[data-kh-running="1"] {
        opacity: 0.6 !important;
        cursor: not-allowed !important;
      }
      #${constants.IDS.BTN_MO_DONE_RETURN}:hover { background: #1d4ed8 !important; border-color: #1e40af !important; }
      #${constants.IDS.BTN_MO_DONE_RETURN}:active { background: #1e40af !important; transform: translateY(0.5px) !important; }
      .${constants.CLASSES.LABEL_MO_DONE_RETURN} {
        margin-top: 4px !important;
        font-size: 11px !important;
        color: rgba(0,0,0,0.6) !important;
        white-space: nowrap !important;
        text-align: center !important;
        width: 100% !important;
      }

      .${constants.CLASSES.BTN_SO_EX} {
        background: #e0e7ff !important;
        color: #312e81 !important;
        border: 1px solid #c7d2fe !important;
        border-radius: 6px !important;
        font: inherit !important;
        font-weight: 900 !important;
        width: 32px !important;
        height: 32px !important;
        padding: 0 !important;
        margin-right: 6px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 12px !important;
        line-height: 1 !important;
        white-space: nowrap !important;
        cursor: pointer !important;
      }
      .${constants.CLASSES.BTN_SO_EX}[data-kh-running="1"] {
        opacity: 0.7 !important;
        cursor: progress !important;
      }
      .${constants.CLASSES.BTN_SO_EX}.kh-ultra {
        background: #dc2626 !important;
        color: #fff !important;
        border-color: #b91c1c !important;
      }
      .${constants.CLASSES.BTN_SO_EX}:hover { background: #c7d2fe !important; border-color: #a5b4fc !important; }
      .${constants.CLASSES.BTN_SO_EX}.kh-ultra:hover { background: #b91c1c !important; border-color: #991b1b !important; }
      .${constants.CLASSES.BTN_SO_EX}:active { transform: translateY(0.5px) !important; }

      #${constants.IDS.SO_INGREDIENTS_PANEL} {
        position: fixed !important;
        left: var(--kh-so-ingredients-left, 0px) !important;
        top: var(--kh-so-ingredients-top, 0px) !important;
        width: var(--kh-so-ingredients-width, 360px) !important;
        max-height: var(--kh-so-ingredients-max-height, 520px) !important;
        z-index: 10001 !important;
        display: flex !important;
        flex-direction: column !important;
        overflow: hidden !important;
        background: #f8fafc !important;
        color: #0f172a !important;
        border: 1px solid #cbd5e1 !important;
        border-radius: 8px !important;
        box-shadow: 0 12px 32px rgba(15, 23, 42, 0.3) !important;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif !important;
      }
      #${constants.IDS.SO_INGREDIENTS_PANEL} .kh-so-ingredients-panel-header {
        padding: 12px 14px 10px !important;
        border-bottom: 1px solid #e2e8f0 !important;
        background: #fff !important;
      }
      #${constants.IDS.SO_INGREDIENTS_PANEL} h3 {
        margin: 0 !important;
        font-size: 15px !important;
        line-height: 1.25 !important;
        font-weight: 800 !important;
        color: #0f172a !important;
      }
      #${constants.IDS.SO_INGREDIENTS_PANEL} .kh-so-ingredients-panel-product {
        margin-top: 5px !important;
        font-size: 12px !important;
        line-height: 1.35 !important;
        color: #475569 !important;
        word-break: break-word !important;
      }
      #${constants.IDS.SO_INGREDIENTS_PANEL} .kh-so-ingredients-panel-body {
        overflow: auto !important;
        padding: 0 !important;
      }
      .${constants.CLASSES.SO_INGREDIENTS_PANEL_ROW} {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) auto !important;
        gap: 10px !important;
        align-items: start !important;
        padding: 10px 14px !important;
        border-bottom: 1px solid #e2e8f0 !important;
        background: #f8fafc !important;
      }
      .${constants.CLASSES.SO_INGREDIENTS_PANEL_ROW}:last-child {
        border-bottom: 0 !important;
      }
      .${constants.CLASSES.SO_INGREDIENTS_PANEL_ROW} .kh-so-ingredients-name {
        font-size: 13px !important;
        line-height: 1.35 !important;
        color: #0f172a !important;
        word-break: break-word !important;
      }
      .${constants.CLASSES.SO_INGREDIENTS_PANEL_ROW} .kh-so-ingredients-missing {
        color: #b42318 !important;
        font-size: 13px !important;
        line-height: 1.25 !important;
        font-weight: 800 !important;
        white-space: nowrap !important;
      }
      #${constants.IDS.SO_INGREDIENTS_PANEL} .kh-so-ingredients-panel-empty,
      #${constants.IDS.SO_INGREDIENTS_PANEL} .kh-so-ingredients-panel-note {
        padding: 12px 14px !important;
        font-size: 13px !important;
        line-height: 1.35 !important;
        color: #475569 !important;
      }

      .${constants.CLASSES.ETSY_ORDER_CELL} {
        display: flex !important;
        align-items: flex-end !important;
        padding-left: 12px !important;
        margin-bottom: -16px !important;
      }
      #${constants.IDS.BTN_ETSY_ORDER} {
        background: #f97316 !important;
        color: #fff !important;
        border: 1px solid #ea580c !important;
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
      #${constants.IDS.BTN_ETSY_ORDER}:hover {
        background: #ea580c !important;
        border-color: #c2410c !important;
      }
      #${constants.IDS.BTN_ETSY_ORDER}:active,
      #${constants.IDS.BTN_ETSY_ORDER}[data-kh-clicked="1"] {
        background: #c2410c !important;
        border-color: #9a3412 !important;
        box-shadow: inset 0 1px 2px rgba(0,0,0,0.25) !important;
        transform: translateY(1px) !important;
      }

      #${constants.IDS.WRAP_PO_SUPPLIER} {
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
        margin-right: 10px !important;
      }
      #${constants.IDS.BTN_PO_SUPPLIER} {
        border: 1px solid #1d4ed8 !important;
        border-radius: 6px !important;
        padding: 6px 12px !important;
        font: inherit !important;
        cursor: pointer !important;
        line-height: 1.2 !important;
        white-space: nowrap !important;
        font-weight: 700 !important;
        background: var(--kh-supplier-btn-bg, ${constants.CONFIG.PO_SUPPLIER_BUTTON_BG}) !important;
        color: var(--kh-supplier-btn-color, ${constants.CONFIG.PO_SUPPLIER_BUTTON_TEXT}) !important;
      }
      #${constants.IDS.BTN_PO_SUPPLIER}:hover { border-color: #1e40af !important; filter: brightness(0.96) !important; }
      #${constants.IDS.BTN_PO_SUPPLIER}:active { transform: translateY(0.5px) !important; filter: brightness(0.92) !important; }
      #${constants.IDS.BTN_PO_SUPPLIER}:disabled,
      #${constants.IDS.BTN_PO_SUPPLIER}[data-kh-disabled="1"] {
        cursor: not-allowed !important;
        opacity: 0.65 !important;
        background: var(--kh-supplier-btn-disabled-bg, ${constants.CONFIG.PO_SUPPLIER_BUTTON_DISABLED_BG}) !important;
        color: var(--kh-supplier-btn-disabled-color, ${constants.CONFIG.PO_SUPPLIER_BUTTON_DISABLED_TEXT}) !important;
        border-color: transparent !important;
      }

      #${constants.IDS.BTN_PO_SUPPLIER_EDIT} {
        border: 1px solid #cbd5e1 !important;
        border-radius: 6px !important;
        background: #f8fafc !important;
        color: #0f172a !important;
        width: 28px !important;
        height: 28px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        font: inherit !important;
        font-size: 13px !important;
        line-height: 1 !important;
        padding: 0 !important;
        cursor: pointer !important;
      }
      #${constants.IDS.BTN_PO_SUPPLIER_EDIT}:hover {
        border-color: #94a3b8 !important;
        background: #e2e8f0 !important;
      }

      #${constants.IDS.PO_SUPPLIER_MODAL} {
        position: fixed !important;
        inset: 0 !important;
        z-index: 10002 !important;
        background: rgba(0,0,0,0.45) !important;
        display: none;
        align-items: center !important;
        justify-content: center !important;
        padding: 16px !important;
      }
      #${constants.IDS.PO_SUPPLIER_MODAL}[data-open="1"] {
        display: flex !important;
      }
      .${constants.CLASSES.PO_SUPPLIER_MODAL_CONTENT} {
        background: #fff !important;
        border-radius: 12px !important;
        padding: 16px 18px !important;
        width: min(420px, 92vw) !important;
        box-shadow: 0 12px 28px rgba(0,0,0,0.25) !important;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif !important;
      }
      .${constants.CLASSES.PO_SUPPLIER_MODAL_CONTENT} h3 {
        margin: 0 0 12px 0 !important;
        font-size: 16px !important;
      }
      .${constants.CLASSES.PO_SUPPLIER_MODAL_ROW} {
        display: flex !important;
        flex-direction: column !important;
        gap: 6px !important;
        margin-bottom: 12px !important;
        font-size: 13px !important;
      }
      .${constants.CLASSES.PO_SUPPLIER_MODAL_ROW} input {
        border: 1px solid rgba(0,0,0,0.2) !important;
        border-radius: 6px !important;
        padding: 6px 8px !important;
        font: inherit !important;
      }
      .${constants.CLASSES.PO_SUPPLIER_MODAL_ROW} input[type="color"] {
        padding: 0 !important;
        width: 48px !important;
        height: 32px !important;
      }
      .${constants.CLASSES.PO_SUPPLIER_MODAL_WARNING} {
        margin: 0 0 12px 0 !important;
        font-size: 12px !important;
        color: #b00020 !important;
      }
      .${constants.CLASSES.PO_SUPPLIER_MODAL_ACTIONS} {
        display: flex !important;
        justify-content: flex-end !important;
        gap: 8px !important;
      }
      .${constants.CLASSES.PO_SUPPLIER_MODAL_ACTIONS} button {
        background: #f1f5f9 !important;
        color: #0f172a !important;
        border-color: #cbd5e1 !important;
        border-radius: 6px !important;
        border: 1px solid #cbd5e1 !important;
        padding: 6px 10px !important;
        font: inherit !important;
        cursor: pointer !important;
      }
      .${constants.CLASSES.PO_SUPPLIER_MODAL_ACTIONS} button:hover {
        background: #e2e8f0 !important;
        border-color: #94a3b8 !important;
      }
      .${constants.CLASSES.PO_SUPPLIER_MODAL_ACTIONS} button:last-child {
        background: #2563eb !important;
        color: #fff !important;
        border-color: #1d4ed8 !important;
      }
      .${constants.CLASSES.PO_SUPPLIER_MODAL_ACTIONS} button:last-child:hover {
        background: #1d4ed8 !important;
        border-color: #1e40af !important;
      }

      #${constants.IDS.BTN_SIMPLYPRINT_NAV} {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      #${constants.IDS.BTN_SIMPLYPRINT_NAV}.${constants.CLASSES.SIMPLYPRINT_NAV} .kh-simplyprint-label {
        display: inline-flex !important;
        flex-direction: column !important;
        align-items: center !important;
        gap: 4px !important;
      }
      #${constants.IDS.BTN_SIMPLYPRINT_NAV}.${constants.CLASSES.SIMPLYPRINT_NAV} .kh-simplyprint-icon {
        width: 18px !important;
        height: 18px !important;
        display: inline-block !important;
      }

      #${constants.IDS.HUD} {
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
      #${constants.IDS.HUD} .kh-hud-text { pointer-events: none; }
      #${constants.IDS.HUD} .kh-hud-total { pointer-events: auto; }
      #${constants.IDS.HUD} .kh-hud-menu {
        position: absolute;
        left: 0;
        bottom: calc(100% + 8px);
        display: none;
        min-width: 210px;
        padding: 8px;
        border: 1px solid rgba(148, 163, 184, 0.45);
        border-radius: 8px;
        background: rgba(15, 23, 42, 0.96);
        color: rgba(255,255,255,0.95);
        box-shadow: 0 10px 28px rgba(0,0,0,0.32);
      }
      #${constants.IDS.HUD}[data-menu-open="1"] .kh-hud-menu {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      #${constants.IDS.HUD} .kh-hud-toggle {
        pointer-events: auto;
        display: flex;
        align-items: center;
        gap: 7px;
        margin-right: 0;
        color: rgba(255,255,255,0.92);
        font: inherit;
        font-size: 12px;
        user-select: none;
        cursor: pointer;
        white-space: nowrap;
      }
      #${constants.IDS.HUD} .kh-hud-toggle input {
        margin: 0;
        width: 13px;
        height: 13px;
        accent-color: #38bdf8;
        cursor: pointer;
      }
      #${constants.IDS.MO_TIMER} {
        pointer-events: auto;
        cursor: pointer;
        margin-left: 6px;
      }
      #${constants.IDS.MO_TIMER}[data-state="paused"] {
        opacity: 0.6;
      }
      #${constants.IDS.HUD} button {
        pointer-events: auto;
        margin-right: 8px;
        padding: 2px 8px;
        font: inherit;
        font-size: 12px;
        border-radius: 8px;
        border: 1px solid rgba(148, 163, 184, 0.55);
        background: rgba(148, 163, 184, 0.2);
        color: #f8fafc;
        cursor: pointer;
      }
      #${constants.IDS.HUD} button:hover {
        border-color: rgba(148, 163, 184, 0.85);
        background: rgba(148, 163, 184, 0.3);
      }
      #${constants.IDS.HUD} .kh-hud-menu button {
        width: 100%;
        margin-right: 0;
        text-align: left;
      }
      #${constants.IDS.HUD} .kh-hud-menu-button {
        font-weight: 700;
      }

      #${constants.IDS.TOAST} {
        position: fixed;
        left: 50%;
        bottom: 48px;
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
  };

  kh.ui = kh.ui || {};
  kh.ui.styles = { ensureStyles };
})();


/* src/ui/toast.js */
(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants, utils } = kh;

  const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

  const showToast = (msg, ms = 2800) => {
    const { el } = utils.ensureElement(constants.IDS.TOAST);
    el.textContent = msg;
    el.style.display = "block";
    el.style.opacity = "1";

    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      if (!el) return;
      el.style.opacity = "0";
      setTimeout(() => { if (el) el.style.display = "none"; }, 250);
    }, ms);
  };

  const startSpinnerToast = (getMessage, intervalMs = 140) => {
    let i = 0;
    const tick = () => {
      const frame = SPINNER_FRAMES[i++ % SPINNER_FRAMES.length];
      showToast(`${frame} ${getMessage()}`, 1600);
    };
    tick();
    const timer = setInterval(tick, intervalMs);
    return () => clearInterval(timer);
  };

  const startCountdownToast = (maxWaitMs, thresholdMs, onMessage) => {
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
    const timer = setInterval(tick, 250);
    return () => clearInterval(timer);
  };

  kh.ui = kh.ui || {};
  kh.ui.toast = { showToast, startSpinnerToast, startCountdownToast };
})();


/* src/ui/hud.js */
(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants, utils, storage } = kh;

  const ensureHud = () => {
    kh.ui.styles.ensureStyles();
    const { el: hud, created } = utils.ensureElement(constants.IDS.HUD);
    if (created) {
      hud.innerHTML = `
        <button id="${constants.IDS.HUD_MENU_BUTTON}" class="kh-hud-menu-button" type="button" title="Katana Helpers menu" aria-haspopup="true" aria-expanded="false">Helpers</button>
        <div id="${constants.IDS.HUD_MENU}" class="kh-hud-menu" role="menu" aria-label="Katana Helpers menu">
          <button id="kh-reset" type="button" role="menuitem" title="Reset total + today">Reset clicks</button>
          <label class="kh-hud-toggle" title="Show missing ingredients beside single-click EX dialogs">
            <input id="${constants.IDS.HUD_SO_INGREDIENTS_TOGGLE}" type="checkbox">
            <span>Ingredient preview</span>
          </label>
          <label class="kh-hud-toggle" title="Auto-fill planned quantity on manufacturing orders from product labels like 15pcs-STD or 28 pcs-STD">
            <input id="${constants.IDS.HUD_MO_QTY_AUTOFILL_TOGGLE}" type="checkbox">
            <span>MO qty autofill</span>
          </label>
          <label class="kh-hud-toggle" title="Auto-fill the sales order shipping fee from customer reference text like SHIPPING COST: 3.99">
            <input id="${constants.IDS.HUD_SO_SHIPPING_AUTOFILL_TOGGLE}" type="checkbox">
            <span>Shipping autofill</span>
          </label>
        </div>
        <span class="kh-hud-text">
          <span class="kh-hud-total" title="Start date: January 3rd, 2026">Total clicks saved: <strong id="kh-total">0</strong></span> | Clicks saved today: <strong id="kh-today">0</strong>
        </span>
      `;

      const closeMenu = () => {
        hud.dataset.menuOpen = "0";
        hud.querySelector(`#${constants.IDS.HUD_MENU_BUTTON}`)?.setAttribute("aria-expanded", "false");
      };

      hud.querySelector(`#${constants.IDS.HUD_MENU_BUTTON}`)?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const open = hud.dataset.menuOpen === "1";
        hud.dataset.menuOpen = open ? "0" : "1";
        event.currentTarget.setAttribute("aria-expanded", open ? "false" : "true");
      }, { capture: true });

      hud.querySelector("#kh-reset")?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        storage.writeTotal(0);
        storage.writeByDateMap({});
        updateHud();
        closeMenu();
      }, { capture: true });

      hud.querySelector(`#${constants.IDS.HUD_SO_INGREDIENTS_TOGGLE}`)?.addEventListener("change", (event) => {
        storage.writeSoIngredientsPreviewEnabled(event.target.checked);
        kh.features?.soEx?.ensureSoExButtons?.();
      }, { capture: true });

      hud.querySelector(`#${constants.IDS.HUD_MO_QTY_AUTOFILL_TOGGLE}`)?.addEventListener("change", (event) => {
        storage.writeMoQtyAutofillEnabled(event.target.checked);
        kh.features?.moQuantityAutofill?.handleSettingChange?.();
      }, { capture: true });

      hud.querySelector(`#${constants.IDS.HUD_SO_SHIPPING_AUTOFILL_TOGGLE}`)?.addEventListener("change", (event) => {
        storage.writeSoShippingAutofillEnabled(event.target.checked);
        kh.features?.soShippingAutofill?.handleSettingChange?.();
      }, { capture: true });

      document.addEventListener("click", (event) => {
        if (!hud.contains(event.target)) closeMenu();
      }, { capture: true });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
      }, { capture: true });
    }

    updateHud();
  };

  const updateHud = () => {
    const hud = document.getElementById(constants.IDS.HUD);
    if (!hud) return;

    const totalEl = hud.querySelector("#kh-total");
    const todayEl = hud.querySelector("#kh-today");
    const previewToggle = hud.querySelector(`#${constants.IDS.HUD_SO_INGREDIENTS_TOGGLE}`);
    const moQtyAutofillToggle = hud.querySelector(`#${constants.IDS.HUD_MO_QTY_AUTOFILL_TOGGLE}`);
    const soShippingAutofillToggle = hud.querySelector(`#${constants.IDS.HUD_SO_SHIPPING_AUTOFILL_TOGGLE}`);

    const total = storage.readTotal();
    const ymd = utils.getPacificYMD();
    const map = storage.readByDateMap();
    const today = storage.getTodayCount(map, ymd);

    if (totalEl) totalEl.textContent = String(total);
    if (todayEl) todayEl.textContent = String(today);
    if (previewToggle) previewToggle.checked = storage.readSoIngredientsPreviewEnabled();
    if (moQtyAutofillToggle) moQtyAutofillToggle.checked = storage.readMoQtyAutofillEnabled();
    if (soShippingAutofillToggle) soShippingAutofillToggle.checked = storage.readSoShippingAutofillEnabled();
  };

  const incrementCounters = (delta = 1) => {
    const count = Math.floor(Number(delta));
    if (!Number.isFinite(count) || count <= 0) return;

    const ymd = utils.getPacificYMD();

    const total = storage.readTotal() + count;
    storage.writeTotal(total);

    const map = storage.readByDateMap();
    map[ymd] = storage.getTodayCount(map, ymd) + count;
    storage.writeByDateMap(map);

    updateHud();
  };

  kh.ui = kh.ui || {};
  kh.ui.hud = { ensureHud, updateHud, incrementCounters };
})();


/* src/ui/moTimer.js */
(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants, utils } = kh;

  const TIMER_STATE = {
    state: "idle",
    accumulatedMs: 0,
    lastTickTs: null,
    intervalId: null,
  };

  let lastStatusState = null;
  let lastStatusMode = null;
  let activeMode = null;
  let activeSoId = null;
  let lastUrl = window.location.href;
  let devWarned = false;
  let unloadBound = false;
  let soStoreMem = { activeId: null, timers: {} };

  const SO_TIMER_CACHE_LIMIT = 25;
  const SO_STORAGE_KEY = constants.KEYS.SO_TIMERS;

  const isManufacturingOrderPage = () => window.location.pathname.startsWith("/manufacturingorder/");
  const isSalesOrderPage = () => window.location.pathname.startsWith("/salesorder/");
  const getSalesOrderId = () => {
    const match = window.location.pathname.match(/^\/salesorder\/(\d+)/);
    return match ? match[1] : null;
  };

  const getSalesOrderIdFromPath = (pathname) => {
    if (!pathname) return null;
    const match = pathname.match(/^\/salesorder\/(\d+)/);
    return match ? match[1] : null;
  };

  const readSoTimerStore = () => {
    try {
      const raw = sessionStorage.getItem(SO_STORAGE_KEY);
      const parsed = utils.safeJsonParse(raw || "{}", {});
      if (!parsed || typeof parsed !== "object") return soStoreMem;
      const timers = parsed.timers && typeof parsed.timers === "object" ? parsed.timers : {};
      return { activeId: parsed.activeId || null, timers };
    } catch {
      return soStoreMem;
    }
  };

  const writeSoTimerStore = (store) => {
    soStoreMem = store;
    try {
      sessionStorage.setItem(SO_STORAGE_KEY, JSON.stringify(store));
    } catch {
      // ignore
    }
  };

  const trimSoTimerStore = (store) => {
    const ids = Object.keys(store.timers || {});
    if (ids.length <= SO_TIMER_CACHE_LIMIT) return;
    const sorted = ids
      .map((id) => ({ id, updatedAt: store.timers[id]?.updatedAt || 0 }))
      .sort((a, b) => a.updatedAt - b.updatedAt);
    const toRemove = sorted.slice(0, ids.length - SO_TIMER_CACHE_LIMIT);
    toRemove.forEach(({ id }) => {
      delete store.timers[id];
    });
  };

  const ensureSoEntry = (store, soId) => {
    if (!store.timers[soId]) {
      store.timers[soId] = {
        accumulatedMs: 0,
        lastTickTs: null,
        state: "idle",
        autoResume: false,
        carryOver: false,
        updatedAt: Date.now(),
      };
    }
    return store.timers[soId];
  };

  const hydrateTimerFromSoEntry = (entry) => {
    resetTimerState();
    TIMER_STATE.accumulatedMs = entry.accumulatedMs || 0;
    TIMER_STATE.state = entry.state || "idle";
    TIMER_STATE.lastTickTs = entry.lastTickTs ?? null;
    if (TIMER_STATE.state === "running") {
      const now = Date.now();
      if (TIMER_STATE.lastTickTs) {
        TIMER_STATE.accumulatedMs += Math.max(0, now - TIMER_STATE.lastTickTs);
      }
      TIMER_STATE.lastTickTs = now;
      TIMER_STATE.intervalId = setInterval(tick, 1000);
    }
  };

  const persistSoEntryFromTimer = (options = {}) => {
    if (!activeSoId) return;
    const store = readSoTimerStore();
    const entry = ensureSoEntry(store, activeSoId);
    entry.accumulatedMs = TIMER_STATE.accumulatedMs;
    entry.lastTickTs = TIMER_STATE.lastTickTs;
    entry.state = TIMER_STATE.state;
    if (typeof options.autoResume === "boolean") {
      entry.autoResume = options.autoResume;
    }
    if (typeof options.carryOver === "boolean") {
      entry.carryOver = options.carryOver;
    }
    entry.updatedAt = Date.now();
    store.activeId = activeSoId;
    trimSoTimerStore(store);
    writeSoTimerStore(store);
  };

  const isDevMode = () => Boolean(document.getElementById("kh-dev-banner"));

  const warnDevMode = () => {
    if (devWarned || !isDevMode()) return;
    devWarned = true;
    const msg = "⚠️ MO TIMER DEV MODE ACTIVE";
    console.warn(`%c${msg}`, "color: red; font-weight: bold;");
    kh.ui?.toast?.showToast?.(msg, 3200);
  };

  const stopInterval = () => {
    if (TIMER_STATE.intervalId !== null) {
      clearInterval(TIMER_STATE.intervalId);
      TIMER_STATE.intervalId = null;
    }
  };

  const resetTimerState = () => {
    stopInterval();
    TIMER_STATE.state = "idle";
    TIMER_STATE.accumulatedMs = 0;
    TIMER_STATE.lastTickTs = null;
  };

  const formatElapsed = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  const getElapsedMs = () => {
    if (TIMER_STATE.state !== "running" || TIMER_STATE.lastTickTs === null) {
      return TIMER_STATE.accumulatedMs;
    }
    const now = Date.now();
    return TIMER_STATE.accumulatedMs + Math.max(0, now - TIMER_STATE.lastTickTs);
  };

  const updateTimerDisplay = () => {
    const timerEl = document.getElementById(constants.IDS.MO_TIMER);
    if (!timerEl) return;
    timerEl.dataset.state = TIMER_STATE.state;
    const timeEl = timerEl.querySelector("strong");
    if (timeEl) {
      timeEl.textContent = formatElapsed(getElapsedMs());
    } else {
      const label = timerEl.dataset.label || "Timer";
      timerEl.textContent = ` | ${label}: ${formatElapsed(getElapsedMs())}`;
    }
  };

  const tick = () => {
    if (TIMER_STATE.state !== "running") return;
    const now = Date.now();
    const last = TIMER_STATE.lastTickTs ?? now;
    TIMER_STATE.accumulatedMs += Math.max(0, now - last);
    TIMER_STATE.lastTickTs = now;
    updateTimerDisplay();
    if (activeMode === "sales") {
      persistSoEntryFromTimer();
    }
  };

  const startTimer = () => {
    if (TIMER_STATE.state === "running") return;
    stopInterval();
    TIMER_STATE.state = "running";
    TIMER_STATE.lastTickTs = Date.now();
    TIMER_STATE.intervalId = setInterval(tick, 1000);
    updateTimerDisplay();
    if (activeMode === "sales") {
      persistSoEntryFromTimer({ autoResume: false });
    }
  };

  const pauseTimer = ({ autoResume = false } = {}) => {
    if (TIMER_STATE.state !== "running") return;
    const now = Date.now();
    if (TIMER_STATE.lastTickTs !== null) {
      TIMER_STATE.accumulatedMs += Math.max(0, now - TIMER_STATE.lastTickTs);
    }
    TIMER_STATE.lastTickTs = null;
    stopInterval();
    TIMER_STATE.state = "paused";
    updateTimerDisplay();
    if (activeMode === "sales") {
      persistSoEntryFromTimer({ autoResume });
    }
  };

  const removeTimerElement = () => {
    const timerEl = document.getElementById(constants.IDS.MO_TIMER);
    if (timerEl) timerEl.remove();
  };

  const onTimerClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.shiftKey) {
      resetTimerState();
      if (activeMode === "sales") {
        persistSoEntryFromTimer({ autoResume: false });
      }
      startTimer();
      return;
    }

    if (TIMER_STATE.state === "running") {
      pauseTimer({ autoResume: false });
    } else {
      startTimer();
    }
  };

  const ensureTimerElement = (label) => {
    const hud = document.getElementById(constants.IDS.HUD);
    if (!hud) return null;
    const todayEl = hud.querySelector("#kh-today");
    if (!todayEl) return null;

    let timerEl = document.getElementById(constants.IDS.MO_TIMER);
    if (!timerEl) {
      timerEl = document.createElement("span");
      timerEl.id = constants.IDS.MO_TIMER;
      timerEl.dataset.state = TIMER_STATE.state;
      timerEl.dataset.label = label;
      timerEl.innerHTML = ` | ${label}: <strong>0:00</strong>`;
      timerEl.title = `${label}: click to pause/resume. Shift+click to reset & start.`;
      timerEl.addEventListener("click", onTimerClick, { capture: true });
      todayEl.insertAdjacentElement("afterend", timerEl);
    } else if (timerEl.dataset.label !== label) {
      timerEl.dataset.label = label;
      timerEl.innerHTML = ` | ${label}: <strong>${formatElapsed(getElapsedMs())}</strong>`;
      timerEl.title = `${label}: click to pause/resume. Shift+click to reset & start.`;
    }
    return timerEl;
  };

  const cleanupTimer = () => {
    removeTimerElement();
    resetTimerState();
    lastStatusState = null;
    lastStatusMode = null;
    activeMode = null;
    activeSoId = null;
  };

  const ensureMoTimer = () => {
    const isMoPage = isManufacturingOrderPage();
    const isSoPage = isSalesOrderPage();

    const store = readSoTimerStore();
    let storeChanged = false;

    const pauseSoEntry = (entry, autoResume) => {
      if (entry.state === "running" && entry.lastTickTs) {
        entry.accumulatedMs += Math.max(0, Date.now() - entry.lastTickTs);
      }
      entry.lastTickTs = null;
      entry.state = "paused";
      entry.autoResume = autoResume;
      entry.carryOver = false;
      entry.updatedAt = Date.now();
      storeChanged = true;
    };

    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      const prevPath = new URL(lastUrl, window.location.origin).pathname;
      const prevSoId = getSalesOrderIdFromPath(prevPath);
      const nextPath = window.location.pathname;
      const nextIsMo = nextPath.startsWith("/manufacturingorder/");
      const nextSoId = getSalesOrderIdFromPath(nextPath);

      if (prevSoId && prevSoId !== nextSoId) {
        const refEntry = ensureSoEntry(store, prevSoId);
        if (nextIsMo) {
          refEntry.carryOver = true;
          refEntry.autoResume = false;
          refEntry.updatedAt = Date.now();
          store.activeId = prevSoId;
          storeChanged = true;
        } else {
          pauseSoEntry(refEntry, true);
        }
      }

      lastUrl = currentUrl;
    }

    if (!isMoPage && !isSoPage && store.activeId) {
      const activeEntry = store.timers?.[store.activeId];
      if (activeEntry?.carryOver) {
        pauseSoEntry(activeEntry, true);
      }
    }

    if (storeChanged) {
      trimSoTimerStore(store);
      writeSoTimerStore(store);
    }

    if (!isMoPage && !isSoPage) {
      cleanupTimer();
      return;
    }

    warnDevMode();

    const getCtx = kh.features?.statusHelper?.getEntityStatusContext;
    if (typeof getCtx !== "function") return;

    let config = null;
    let useStatusHelper = false;

    if (isSoPage) {
      const soId = getSalesOrderId();
      if (!soId) {
        cleanupTimer();
        return;
      }
      activeMode = "sales";
      activeSoId = soId;
      const entry = ensureSoEntry(store, soId);
      if (entry.state === "paused" && entry.autoResume) {
        entry.state = "running";
        entry.lastTickTs = Date.now();
        entry.autoResume = false;
      }
      entry.carryOver = false;
      entry.updatedAt = Date.now();
      store.activeId = soId;
      trimSoTimerStore(store);
      writeSoTimerStore(store);
      hydrateTimerFromSoEntry(entry);
      config = { label: "SO Timer", startState: "notShipped", stopState: "packed" };
      useStatusHelper = true;
    } else if (isMoPage) {
      const activeEntry = store.activeId ? store.timers?.[store.activeId] : null;
      if (activeEntry && activeEntry.carryOver) {
        activeMode = "sales";
        activeSoId = store.activeId;
        if (activeEntry.state === "paused" && activeEntry.autoResume) {
          activeEntry.state = "running";
          activeEntry.lastTickTs = Date.now();
          activeEntry.autoResume = false;
        }
        activeEntry.updatedAt = Date.now();
        store.activeId = activeSoId;
        writeSoTimerStore(store);
        hydrateTimerFromSoEntry(activeEntry);
        config = { label: "SO Timer", startState: "notShipped", stopState: "packed" };
        lastStatusState = null;
        lastStatusMode = null;
      } else {
        activeMode = "manufacturing";
        activeSoId = null;
        if (lastStatusMode && lastStatusMode !== "manufacturing") {
          resetTimerState();
          lastStatusState = null;
        }
        config = { label: "MO Timer", startState: "notStarted", stopState: "done" };
        useStatusHelper = true;
      }
    }

    if (!config) {
      cleanupTimer();
      return;
    }

    const ctx = useStatusHelper ? getCtx() : { mode: "none", state: "none" };
    const eligible = useStatusHelper
      ? (ctx.state === config.startState || ctx.state === config.stopState)
      : true;

    if (!eligible) {
      removeTimerElement();
      resetTimerState();
      lastStatusState = null;
      lastStatusMode = null;
      return;
    }

    const timerEl = ensureTimerElement(config.label);
    if (!timerEl) {
      if (TIMER_STATE.state === "running") pauseTimer({ autoResume: false });
      return;
    }

    if (TIMER_STATE.state === "idle") startTimer();

    if (useStatusHelper) {
      const modeChanged = lastStatusMode && lastStatusMode !== ctx.mode;
      if (modeChanged) {
        resetTimerState();
        lastStatusState = null;
      }

      if (lastStatusState && lastStatusState !== ctx.state) {
        if (ctx.state === config.stopState) pauseTimer({ autoResume: false });
        if (ctx.state === config.startState) startTimer();
      } else if (!lastStatusState && ctx.state === config.stopState && TIMER_STATE.state === "running") {
        pauseTimer({ autoResume: false });
      }
      lastStatusState = ctx.state;
      lastStatusMode = ctx.mode;
    } else {
      lastStatusState = null;
      lastStatusMode = activeMode;
    }

    updateTimerDisplay();

    if (!unloadBound) {
      window.addEventListener("beforeunload", cleanupTimer, { once: true });
      unloadBound = true;
    }
  };

  kh.ui = kh.ui || {};
  kh.ui.moTimer = {
    ensureMoTimer,
    isManufacturingOrderPage,
    isSalesOrderPage,
  };
})();


/* src/features/statusHelper.js */
(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants, utils } = kh;

  const STATUS_HELPER_CONFIG = {
    manufacturing: {
      notStarted: { text: "Done", className: "kh-mo-done", title: "Mark MO as Done" },
      done: { hidden: true },
    },
    sales: {
      notShipped: {
        text: "Pack all",
        className: "kh-so-packall",
        title: "Pack all (won't count if 'Not enough stock' appears)",
      },
      packed: { hidden: true },
    },
  };

  const getEntityStatusContext = () => {
    const statusBtn = document.querySelector(constants.SELECTORS.ENTITY_STATUS_BTN);
    if (!statusBtn) return { mode: "none", state: "none", text: "" };

    const text = utils.normText(statusBtn.textContent);

    if (text.includes("not shipped")) return { mode: "sales", state: "notShipped", text };
    if (text.includes("packed")) return { mode: "sales", state: "packed", text };

    if (text.includes("not started")) return { mode: "manufacturing", state: "notStarted", text };
    if (text.includes("done")) return { mode: "manufacturing", state: "done", text };

    return { mode: "unknown", state: "unknown", text };
  };

  const openMenuAndSelect = async ({ menuButton, itemSelector, timeoutMs = 1500 }) => {
    if (menuButton) utils.dispatchRealClick(menuButton);
    const item = await utils.waitForSelector(itemSelector, timeoutMs).catch(() => null);
    if (!item) return null;
    utils.dispatchRealClick(item);
    return item;
  };

  const isNotEnoughStockDialogOpen = () => {
    const titleEl = document.querySelector(constants.SELECTORS.DIALOG_TITLE);
    if (!titleEl) return false;
    return utils.normText(titleEl.textContent).includes("not enough stock");
  };

  const runSoPackAllFlow = async () => {
    const statusBtn = document.querySelector(constants.SELECTORS.ENTITY_STATUS_BTN);
    if (!statusBtn) return false;
    const packAllItem = await openMenuAndSelect({
      menuButton: statusBtn,
      itemSelector: constants.SELECTORS.SO_STATUS_PACK_ALL_ITEM,
      timeoutMs: 1500,
    });
    if (!packAllItem) return false;

    try {
      const outcome = await utils.waitForCondition(() => {
        if (isNotEnoughStockDialogOpen()) return "error";
        const ctx = getEntityStatusContext();
        if (ctx.mode === "sales" && ctx.state === "packed") return "packed";
        return false;
      }, 10000, 80);

      if (outcome === "error") {
        const closeBtn = document.querySelector(constants.SELECTORS.DIALOG_CLOSE_BTN);
        if (closeBtn) utils.dispatchRealClick(closeBtn);
        return false;
      }
      return outcome === "packed";
    } catch {
      if (isNotEnoughStockDialogOpen()) {
        const closeBtn = document.querySelector(constants.SELECTORS.DIALOG_CLOSE_BTN);
        if (closeBtn) utils.dispatchRealClick(closeBtn);
      }
      return false;
    }
  };

  const runMoSetDoneFlow = async () => {
    const statusBtn = document.querySelector(constants.SELECTORS.ENTITY_STATUS_BTN);
    if (!statusBtn) return false;
    const doneItem = await openMenuAndSelect({
      menuButton: statusBtn,
      itemSelector: constants.SELECTORS.MO_STATUS_DONE_ITEM,
      timeoutMs: 1500,
    });
    if (!doneItem) return false;

    try {
      await utils.waitForCondition(() => {
        const ctx = getEntityStatusContext();
        return ctx.mode === "manufacturing" && ctx.state === "done";
      }, 7000, 90);
      return true;
    } catch {
      return false;
    }
  };

  const ensureEntityStatusHelper = () => {
    kh.ui.styles.ensureStyles();

    const statusBtn = document.querySelector(constants.SELECTORS.ENTITY_STATUS_BTN);
    if (!statusBtn) return;

    const parent = statusBtn.parentElement;
    if (!parent) return;

    let helper = document.getElementById(constants.IDS.BTN_STATUS_HELPER);
    if (!helper) {
      helper = utils.createButton({
        id: constants.IDS.BTN_STATUS_HELPER,
        onClick: async (event) => {
          event.preventDefault();
          event.stopPropagation();

          if (helper.getAttribute("data-kh-running") === "1") return;
          helper.setAttribute("data-kh-running", "1");

          try {
            const ctx = getEntityStatusContext();

            if (ctx.mode === "manufacturing" && ctx.state === "notStarted") {
              const ok = await runMoSetDoneFlow();
              if (ok) {
                kh.ui.hud.incrementCounters(1);
              }
              return;
            }

            if (ctx.mode === "sales" && ctx.state === "notShipped") {
              const ok = await runSoPackAllFlow();
              if (ok) {
                kh.ui.hud.incrementCounters(1);
              }
            }
          } finally {
            helper.setAttribute("data-kh-running", "0");
          }
        },
      });

      parent.insertBefore(helper, statusBtn);
    }

    const ctx = getEntityStatusContext();
    const config = STATUS_HELPER_CONFIG[ctx.mode]?.[ctx.state];
    helper.classList.remove("kh-mo-done", "kh-so-packall");
    helper.style.display = "none";
    helper.title = "";

    if (config && !config.hidden) {
      helper.textContent = config.text;
      helper.classList.add(config.className);
      helper.title = config.title || "";
      helper.style.display = "";
    }
  };

  kh.features = kh.features || {};
  kh.features.statusHelper = {
    getEntityStatusContext,
    openMenuAndSelect,
    runMoSetDoneFlow,
    runSoPackAllFlow,
    ensureEntityStatusHelper,
  };
})();


/* src/features/createMo.js */
(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants, utils } = kh;

  const runCreateMoFlow = async () => {
    if (window.location.pathname.startsWith("/add-manufacturingorder")) return false;

    const createBtn = document.querySelector(constants.SELECTORS.CREATE_BTN);
    if (!createBtn) return false;

    let moItem = document.querySelector(constants.SELECTORS.MO_ITEM);
    if (moItem) {
      utils.dispatchRealClick(moItem);
      return true;
    }

    moItem = await kh.features.statusHelper.openMenuAndSelect({
      menuButton: createBtn,
      itemSelector: constants.SELECTORS.MO_ITEM,
      timeoutMs: 1500,
    });
    return !!moItem;
  };

  const ensureCreateMoButton = () => {
    kh.ui.styles.ensureStyles();

    const createBtn = document.querySelector(constants.SELECTORS.CREATE_BTN);
    if (!createBtn) return;

    if (document.getElementById(constants.IDS.BTN_CREATE_MO)) return;

    const parent = createBtn.parentElement;
    if (!parent) return;

    const btn = utils.createButton({
      id: constants.IDS.BTN_CREATE_MO,
      text: "Create MO",
      onClick: async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const ok = await runCreateMoFlow();
        if (ok) kh.ui.hud.incrementCounters(1);
      },
    });

    parent.insertBefore(btn, createBtn);
  };

  kh.features = kh.features || {};
  kh.features.createMo = { ensureCreateMoButton, runCreateMoFlow };
})();


/* src/features/createPo.js */
(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants, utils } = kh;

  const runCreatePoFlow = async () => {
    if (window.location.pathname.startsWith("/purchaseorder")) return false;

    const createBtn = document.querySelector(constants.SELECTORS.CREATE_BTN);
    if (!createBtn) return false;

    let poItem = document.querySelector(constants.SELECTORS.PO_ITEM);
    if (poItem) {
      utils.dispatchRealClick(poItem);
      return true;
    }

    poItem = await kh.features.statusHelper.openMenuAndSelect({
      menuButton: createBtn,
      itemSelector: constants.SELECTORS.PO_ITEM,
      timeoutMs: 1500,
    });
    return !!poItem;
  };

  const ensureCreatePoButton = () => {
    kh.ui.styles.ensureStyles();

    const createBtn = document.querySelector(constants.SELECTORS.CREATE_BTN);
    if (!createBtn) return;

    if (document.getElementById(constants.IDS.BTN_CREATE_PO)) return;

    const parent = createBtn.parentElement;
    if (!parent) return;

    const btn = utils.createButton({
      id: constants.IDS.BTN_CREATE_PO,
      text: "Make PO",
      onClick: async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const ok = await runCreatePoFlow();
        if (ok) kh.ui.hud.incrementCounters(1);
      },
    });

    const createMoBtn = document.getElementById(constants.IDS.BTN_CREATE_MO);
    if (createMoBtn) {
      parent.insertBefore(btn, createMoBtn);
    } else {
      parent.insertBefore(btn, createBtn);
    }
  };

  kh.features = kh.features || {};
  kh.features.createPo = { ensureCreatePoButton, runCreatePoFlow };
})();


/* src/features/doneAndReturn.js */
(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants, utils, storage } = kh;

  const ensureMoDoneReturnButton = () => {
    kh.ui.styles.ensureStyles();

    const statusBtn = document.querySelector(constants.SELECTORS.ENTITY_STATUS_BTN);
    if (!statusBtn) return;

    const parent = statusBtn.parentElement;
    if (!parent) return;

    let wrap = document.getElementById(constants.IDS.WRAP_MO_DONE_RETURN);
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = constants.IDS.WRAP_MO_DONE_RETURN;

      const btn = utils.createButton({
        id: constants.IDS.BTN_MO_DONE_RETURN,
        text: "Done & Return",
        title: "Mark Done, then return to the previous page.",
        onClick: async (event) => {
          event.preventDefault();
          event.stopPropagation();

          if (btn.getAttribute("data-kh-running") === "1") return;
          btn.setAttribute("data-kh-running", "1");
          btn.disabled = true;

          try {
            kh.ui.toast.showToast("Done & Return: marking Done...");
            const ok = await kh.features.statusHelper.runMoSetDoneFlow();
            if (!ok) {
              kh.ui.toast.showToast("Couldn't set Done - not returning.");
              return;
            }

            if (history.length > 1) {
              kh.ui.hud.incrementCounters(2);
              kh.ui.toast.showToast("Done & Return: returning to previous page");
              history.back();
              return;
            }

            const storedUrl = storage.getStoredReturnUrl();
            const normalizedStored = storage.normalizeReturnUrl(storedUrl);
            if (normalizedStored && !storage.isSameUrl(normalizedStored, window.location.href)) {
              kh.ui.hud.incrementCounters(2);
              kh.ui.toast.showToast("Done & Return: returning to previous page");
              window.location.href = normalizedStored;
              return;
            }

            kh.ui.hud.incrementCounters(1);
            kh.ui.toast.showToast("No previous page found - stayed on this MO.");
          } finally {
            btn.setAttribute("data-kh-running", "0");
            btn.disabled = false;
          }
        },
      });

      const label = document.createElement("div");
      label.className = constants.CLASSES.LABEL_MO_DONE_RETURN;
      label.textContent = "Returns to: Previous page";

      wrap.appendChild(btn);
      wrap.appendChild(label);

      const helper = document.getElementById(constants.IDS.BTN_STATUS_HELPER);
      if (helper) {
        parent.insertBefore(wrap, helper);
      } else {
        parent.insertBefore(wrap, statusBtn);
      }
    }

    const ctx = kh.features.statusHelper.getEntityStatusContext();
    wrap.style.display = "none";
    if (ctx.mode === "manufacturing" && ctx.state === "notStarted") {
      wrap.style.display = "";
      storage.maybeStoreReturnUrlFromReferrer();
      const label = wrap.querySelector(`.${constants.CLASSES.LABEL_MO_DONE_RETURN}`);
      if (label) {
        label.textContent = "Returns to: Previous page";
      }
    } else {
      wrap.remove();
    }
  };

  kh.features = kh.features || {};
  kh.features.doneAndReturn = { ensureMoDoneReturnButton };
})();


/* src/features/moQuantityAutofill.js */
(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants, storage, utils } = kh;

  const state = {
    intervalId: 0,
    productInput: null,
    qtyInput: null,
    lastSeenLabel: "",
    lastSeenAt: 0,
    lastHeaderMismatchAt: 0,
    lastAppliedLabel: "",
    lastAppliedQty: "",
    manualOverrideLabel: "",
    internalWriteDepth: 0,
  };

  const isMoPage = () => window.location.pathname.startsWith("/manufacturingorder");

  const getProductInput = () => document.querySelector(constants.SELECTORS.MO_PRODUCT_INPUT);
  const getQtyInput = () => document.querySelector(constants.SELECTORS.MO_PLANNED_QTY_INPUT);
  const getHeaderName = () => document.querySelector(constants.SELECTORS.MO_HEADER_NAME);

  const normalizeProductLabel = (raw) => {
    const text = String(raw || "").replace(/\s+/g, " ").trim();
    return text;
  };

  const extractBatchQty = (rawLabel) => {
    const label = normalizeProductLabel(rawLabel);
    if (!label) return null;

    const namePortion = label.includes("]") ? label.split("]").slice(1).join("]").trim() : label;

    const stdMatch = namePortion.match(/(^|[\s(/-])(\d+)\s*pcs-std\b/i);
    if (stdMatch) return parseInt(stdMatch[2], 10);

    const leadingQtyMatch = namePortion.match(/^(\d+)\s+/);
    if (leadingQtyMatch) return parseInt(leadingQtyMatch[1], 10);

    return null;
  };

  const getCurrentSelectedLabel = () => normalizeProductLabel(getProductInput()?.value || "");

  const markManualOverride = () => {
    if (state.internalWriteDepth > 0) return;
    const label = getCurrentSelectedLabel();
    if (!label) return;
    state.manualOverrideLabel = label;
  };

  const ensureQtyListeners = (qtyInput) => {
    if (!qtyInput || qtyInput.dataset.khMoQtyAutofillBound === "1") return;
    qtyInput.dataset.khMoQtyAutofillBound = "1";
    qtyInput.addEventListener("input", markManualOverride, { capture: true });
    qtyInput.addEventListener("change", markManualOverride, { capture: true });
  };

  const resetAutofillState = () => {
    state.lastSeenLabel = "";
    state.lastSeenAt = 0;
    state.lastHeaderMismatchAt = 0;
    state.lastAppliedLabel = "";
    state.lastAppliedQty = "";
    state.manualOverrideLabel = "";
  };

  const shouldApplyToValue = (currentValue, nextQty) => {
    const nextText = String(nextQty);
    const current = String(currentValue || "").trim();

    if (!current) return true;
    if (current === nextText) return false;
    if (current === "1") return true;
    if (state.lastAppliedQty && current === state.lastAppliedQty) return true;
    return false;
  };

  const applyQty = (qtyInput, qty, label) => {
    const nextText = String(qty);
    state.internalWriteDepth += 1;
    try {
      utils.setReactInputValue(qtyInput, nextText);
    } finally {
      state.internalWriteDepth = Math.max(0, state.internalWriteDepth - 1);
    }
    state.lastAppliedLabel = label;
    state.lastAppliedQty = nextText;
    qtyInput.dataset.khMoQtyAutofillLabel = label;
    qtyInput.dataset.khMoQtyAutofillValue = nextText;
  };

  const tick = () => {
    if (!isMoPage()) {
      resetAutofillState();
      return;
    }
    if (!storage.readMoQtyAutofillEnabled()) return;

    const productInput = getProductInput();
    const qtyInput = getQtyInput();
    if (!productInput || !qtyInput) return;

    state.productInput = productInput;
    state.qtyInput = qtyInput;
    ensureQtyListeners(qtyInput);

    const label = normalizeProductLabel(productInput.value);
    const now = Date.now();

    if (label !== state.lastSeenLabel) {
      state.lastSeenLabel = label;
      state.lastSeenAt = now;
      state.lastHeaderMismatchAt = 0;
      if (state.manualOverrideLabel && state.manualOverrideLabel !== label) {
        state.manualOverrideLabel = "";
      }
    }

    const batchQty = extractBatchQty(label);
    if (!batchQty || !Number.isFinite(batchQty) || batchQty <= 0) return;
    if (now - state.lastSeenAt < constants.CONFIG.MO_QTY_AUTOFILL_SETTLE_MS) return;
    if (document.activeElement === qtyInput) return;
    if (state.manualOverrideLabel === label) return;

    const headerText = normalizeProductLabel(getHeaderName()?.textContent || "");
    if (headerText && !utils.normText(headerText).includes(utils.normText(label))) {
      if (!state.lastHeaderMismatchAt) state.lastHeaderMismatchAt = now;
      if (now - state.lastHeaderMismatchAt < constants.CONFIG.MO_QTY_AUTOFILL_HEADER_WAIT_MS) return;
    } else {
      state.lastHeaderMismatchAt = 0;
    }

    const currentValue = String(qtyInput.value || "").trim();
    if (!shouldApplyToValue(currentValue, batchQty)) return;

    applyQty(qtyInput, batchQty, label);
  };

  const start = () => {
    if (state.intervalId) return;
    state.intervalId = window.setInterval(tick, constants.CONFIG.MO_QTY_AUTOFILL_POLL_MS);
  };

  const handleSettingChange = () => {
    if (!storage.readMoQtyAutofillEnabled()) {
      resetAutofillState();
      return;
    }
    state.lastSeenAt = 0;
    state.lastHeaderMismatchAt = 0;
  };

  const ensureMoQuantityAutofill = () => {
    start();
    tick();
  };

  kh.features = kh.features || {};
  kh.features.moQuantityAutofill = {
    ensureMoQuantityAutofill,
    handleSettingChange,
    extractBatchQty,
  };
})();


/* src/features/soShippingAutofill.js */
(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants, storage, utils } = kh;

  const state = {
    intervalId: 0,
    lastReference: "",
    lastSeenAt: 0,
    lastAppliedAmount: "",
    lastAppliedReference: "",
    isEditing: false,
  };

  const isSoPage = () => window.location.pathname.startsWith("/salesorder");

  const normalizeReference = (raw) => String(raw || "").replace(/\s+/g, " ").trim();

  const extractShippingCost = (rawReference) => {
    const reference = normalizeReference(rawReference);
    if (!reference) return null;

    const match = reference.match(/\bshipping\s*(?:cost|fee|charge)\b\s*[:#=-]?\s*\$?\s*([0-9]+(?:[.,][0-9]{1,2})?)/i);
    if (!match) return null;

    const amount = Number.parseFloat(match[1].replace(",", "."));
    if (!Number.isFinite(amount) || amount < 0) return null;
    return amount.toFixed(2).replace(/\.00$/, "");
  };

  const parseMoneyValue = (text) => {
    const match = String(text || "").replace(/\u00a0/g, " ").match(/-?[0-9]+(?:[.,][0-9]+)?/);
    if (!match) return null;
    const value = Number.parseFloat(match[0].replace(",", "."));
    return Number.isFinite(value) ? value : null;
  };

  const getReferenceInput = () => document.querySelector(constants.SELECTORS.SO_CUSTOMER_REFERENCE);
  const getShippingCostCell = () => document.querySelector(constants.SELECTORS.SO_SHIPPING_COST_CELL);

  const shouldApplyToCell = (cell, amount, reference) => {
    const current = parseMoneyValue(cell?.textContent || "");
    const next = Number.parseFloat(amount);
    if (!Number.isFinite(next)) return false;
    if (current == null || current === 0) return true;
    if (Math.abs(current - next) < 0.005) return false;
    return state.lastAppliedReference && state.lastAppliedReference !== reference && state.lastAppliedAmount && Math.abs(current - Number.parseFloat(state.lastAppliedAmount)) < 0.005;
  };

  const findEditorInput = () => {
    const grid = document.querySelector(constants.SELECTORS.SO_SHIPPING_GRID);
    const candidates = [
      ...(grid ? Array.from(grid.querySelectorAll('input:not([type="checkbox"]), textarea')) : []),
      ...Array.from(document.querySelectorAll('.ag-popup-editor input:not([type="checkbox"]), .ag-cell-inline-editing input:not([type="checkbox"])')),
    ];
    return candidates.find((input) => input.offsetParent !== null && !input.disabled && !input.readOnly) || null;
  };

  const applyShippingCost = async (cell, amount, reference) => {
    if (state.isEditing) return;
    state.isEditing = true;
    try {
      utils.dispatchRealClick(cell);
      cell.dispatchEvent(new MouseEvent("dblclick", { bubbles: true, cancelable: true, view: window }));

      const input = await utils.waitForCondition(findEditorInput, 1200, 40);
      utils.setReactInputValue(input, amount);
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true, cancelable: true }));
      input.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", code: "Enter", bubbles: true, cancelable: true }));
      input.blur();

      state.lastAppliedAmount = amount;
      state.lastAppliedReference = reference;
      cell.dataset.khShippingAutofillValue = amount;
      kh.ui.toast.showToast(`Shipping fee filled: ${amount}`, 2200);
    } catch (error) {
      utils.log("Shipping autofill failed", error);
    } finally {
      state.isEditing = false;
    }
  };

  const resetState = () => {
    state.lastReference = "";
    state.lastSeenAt = 0;
    state.lastAppliedAmount = "";
    state.lastAppliedReference = "";
    state.isEditing = false;
  };

  const tick = () => {
    if (!isSoPage()) {
      resetState();
      return;
    }
    if (!storage.readSoShippingAutofillEnabled()) return;
    if (state.isEditing) return;

    const referenceInput = getReferenceInput();
    const costCell = getShippingCostCell();
    if (!referenceInput || !costCell) return;
    if (document.activeElement === referenceInput) return;

    const reference = normalizeReference(referenceInput.value);
    const now = Date.now();
    if (reference !== state.lastReference) {
      state.lastReference = reference;
      state.lastSeenAt = now;
    }

    if (now - state.lastSeenAt < constants.CONFIG.SO_SHIPPING_AUTOFILL_SETTLE_MS) return;

    const amount = extractShippingCost(reference);
    if (!amount) return;
    if (!shouldApplyToCell(costCell, amount, reference)) return;

    applyShippingCost(costCell, amount, reference);
  };

  const start = () => {
    if (state.intervalId) return;
    state.intervalId = window.setInterval(tick, constants.CONFIG.SO_SHIPPING_AUTOFILL_POLL_MS);
  };

  const handleSettingChange = () => {
    if (!storage.readSoShippingAutofillEnabled()) resetState();
    else state.lastSeenAt = 0;
  };

  const ensureSoShippingAutofill = () => {
    start();
    tick();
  };

  kh.features = kh.features || {};
  kh.features.soShippingAutofill = {
    ensureSoShippingAutofill,
    handleSettingChange,
    extractShippingCost,
  };
})();


/* src/features/ultraEx.js */
(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants, utils } = kh;

  const findIngredientsBodyRoot = () => (
    document.querySelector(`${constants.GRID.INGREDIENTS_ID} .ag-body.ag-layout-auto-height`)
    || document.querySelector(`${constants.GRID.INGREDIENTS_ID} .ag-body`)
    || null
  );

  const findIngredientsViewport = (bodyRoot) => {
    if (!bodyRoot) return null;
    return bodyRoot.querySelector(".ag-body-viewport") || null;
  };

  const findCenterColsViewport = (bodyRoot) => {
    if (!bodyRoot) return null;
    return bodyRoot.querySelector(".ag-center-cols-viewport") || null;
  };

  const getAvailabilityCells = (bodyRoot) => {
    const center = findCenterColsViewport(bodyRoot);
    if (!center) return [];
    return Array.from(center.querySelectorAll(`[role="gridcell"][col-id="${constants.GRID.AVAILABILITY_COL_ID}"]`));
  };

  const getRowKeyFromCell = (cell) => {
    const row = cell.closest(".ag-row");
    if (!row) return null;

    return (
      row.getAttribute("row-id")
      || row.getAttribute("row-index")
      || row.getAttribute("aria-rowindex")
      || row.dataset?.rowId
      || row.dataset?.rowIndex
      || row.style?.top
      || null
    );
  };

  const classifyAvailabilityCell = (cell) => {
    const text = utils.normText(cell?.innerText);
    if (!text) return "loading";
    if (text.includes("not available")) return "not_available";
    if (text.includes("in stock")) return "in_stock";
    return "unknown";
  };

  const mergeStatus = (prev, next) => {
    const rank = { in_stock: 0, loading: 1, unknown: 2, not_available: 3 };
    if (!prev) return next;
    return rank[next] > rank[prev] ? next : prev;
  };

  const snapshotVisibleAvailability = (bodyRoot) => {
    const cells = getAvailabilityCells(bodyRoot);

    const out = {
      cellsFound: 0,
      in_stock: 0,
      not_available: 0,
      loading: 0,
      unknown: 0,
      items: [],
    };

    for (const cell of cells) {
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
  };

  const waitForIngredientsGridHydrated = async ({
    maxWaitMs = constants.CONFIG.ULTRA_MAX_WAIT_FOR_READY_MS,
    pollMs = constants.CONFIG.ULTRA_READY_POLL_MS,
  } = {}) => {
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
        const status = classifyAvailabilityCell(c);
        if (status === "in_stock" || status === "not_available") return true;
      }
      return false;
    };

    while (Date.now() - start < maxWaitMs) {
      try {
        if (isReady()) return { ready: true, elapsedMs: Date.now() - start };
      } catch (err) {
        lastError = err;
      }
      await utils.sleep(pollMs);
    }

    if (lastError) utils.log("Grid readiness check error:", lastError);
    return { ready: false, elapsedMs: Date.now() - start };
  };

  const collectAllAvailabilityWithScrolling = async ({
    timeoutMs = constants.CONFIG.ULTRA_SCAN_TIMEOUT_MS,
    passLimit = 3,
    stepFactor = 0.85,
    onUpdate,
  } = {}) => {
    const start = Date.now();

    const bodyRoot = findIngredientsBodyRoot();
    if (!bodyRoot) return { ok: false, reason: "no_body_root", diag: { note: "no #ingredients-grid .ag-body" } };

    const viewport = findIngredientsViewport(bodyRoot);
    if (!viewport) return { ok: false, reason: "no_viewport", diag: { note: "no .ag-body-viewport" } };

    const originalScrollTop = viewport.scrollTop;

    const runOnePass = async (passIndex) => {
      const statusMap = new Map();

      viewport.scrollTop = 0;
      await utils.sleep(90);

      const maxScroll = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
      const step = Math.max(220, Math.floor(viewport.clientHeight * stepFactor));

      let guard = 0;
      const emitUpdate = () => {
        const counts = { in_stock: 0, not_available: 0, loading: 0, unknown: 0 };
        for (const status of statusMap.values()) counts[status] += 1;
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
        await utils.sleep(60);

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

      if (viewport.scrollHeight - viewport.clientHeight > 2) {
        viewport.scrollTop = viewport.scrollHeight;
        await utils.sleep(140);

        const snapBottom = snapshotVisibleAvailability(bodyRoot);
        for (const it of snapBottom.items) {
          const prev = statusMap.get(it.key);
          statusMap.set(it.key, mergeStatus(prev, it.status));
        }
      }

      let counts = { in_stock: 0, not_available: 0, loading: 0, unknown: 0 };
      for (const status of statusMap.values()) counts[status] += 1;

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
          prevDiag.rowsSeen === diag.rowsSeen
          && diag.loading === 0
          && diag.unknown === 0;
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

      await utils.sleep(300);
    }

    viewport.scrollTop = originalScrollTop;
    return {
      ok: false,
      reason: "timeout",
      diag: lastDiag || { note: "no diag" },
    };
  };

  const runUltraAfterMoOpen = async (originUrl) => {
    try {
      await utils.waitForSelector(constants.SELECTORS.ENTITY_STATUS_BTN, 20000);
    } catch {
      kh.ui.toast.showToast("Ultra EX stopped: couldn't find MO status control. Finish manually.", 5200);
      return { ok: false, ultraDone: false };
    }

    const ctx0 = kh.features.statusHelper.getEntityStatusContext();
    if (ctx0.mode === "manufacturing" && ctx0.state === "done") {
      history.back();
      return { ok: true, ultraDone: true };
    }

    const stopCountdown = kh.ui.toast.startCountdownToast(
      constants.CONFIG.ULTRA_MAX_WAIT_FOR_READY_MS,
      constants.CONFIG.ULTRA_READY_COUNTDOWN_THRESHOLD_MS,
      (remainingMs) => {
        const secs = (remainingMs / 1000).toFixed(1);
        kh.ui.toast.showToast(`Ultra EX: waiting for grid… ${secs}s`, 1300);
      }
    );

    const readiness = await waitForIngredientsGridHydrated({
      maxWaitMs: constants.CONFIG.ULTRA_MAX_WAIT_FOR_READY_MS,
      pollMs: constants.CONFIG.ULTRA_READY_POLL_MS,
    });
    stopCountdown();

    if (!readiness.ready) {
      kh.ui.toast.showToast("Ultra EX: grid still loading — scanning anyway…", 2400);
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
    const stopSpinner = kh.ui.toast.startSpinnerToast(() => {
      const d = latestDiag;
      const passText = d.pass ? `pass ${d.pass}` : "pass 1";
      const scrollProbe = constants.DEBUG ? ` | scroll ${d.scrollTop}/${d.maxScroll}` : "";
      return `Ultra EX: scanning… ${passText} | rows ${d.rowsSeen} (in ${d.in_stock}, not ${d.not_available}, load ${d.loading}, unk ${d.unknown})${scrollProbe}`;
    });

    const scanRes = await collectAllAvailabilityWithScrolling({
      timeoutMs: constants.CONFIG.ULTRA_SCAN_TIMEOUT_MS,
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
      kh.ui.toast.showToast(msg, 6500);
      return { ok: false, ultraDone: false };
    }

    if (!scanRes.allInStock) {
      const d = scanRes.diag || {};
      kh.ui.toast.showToast(
        `Ultra EX stopped: not all ingredients are in stock (rows=${d.rowsSeen ?? "?"}, notAvail=${d.not_available ?? "?"}). Finish this MO manually.`,
        6500
      );
      return { ok: false, ultraDone: false };
    }

    const d = scanRes.diag || {};
    kh.ui.toast.showToast(
      `Ultra EX OK — rows: ${d.rowsSeen ?? "?"} (in ${d.in_stock ?? "?"}, not ${d.not_available ?? "?"}, unk ${d.unknown ?? "?"}). Marking Done…`,
      2600
    );

    const doneOk = await kh.features.statusHelper.runMoSetDoneFlow();
    if (!doneOk) {
      kh.ui.toast.showToast("Ultra EX stopped: could not mark MO as Done. Finish manually.", 5600);
      return { ok: false, ultraDone: false };
    }

    kh.ui.toast.showToast("Ultra EX: marked Done. Returning to sales order…", 2200);
    history.back();

    setTimeout(() => {
      if (originUrl && window.location.href.includes("manufacturing")) {
        window.location.href = originUrl;
      }
    }, 2500);

    return { ok: true, ultraDone: true };
  };

  kh.features = kh.features || {};
  kh.features.ultraEx = {
    runUltraAfterMoOpen,
    collectAllAvailabilityWithScrolling,
  };
})();


/* src/features/soEx.js */
(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants, utils, storage } = kh;

  const exTimers = new WeakMap();
  let manualUltraOriginUrl = null;
  let manualIngredientsPreview = null;

  const getClosestAgRow = (el) => el?.closest?.(".ag-row") || null;

  const setExButtonUltraVisual = (btn, on) => {
    if (on) btn.classList.add("kh-ultra");
    else btn.classList.remove("kh-ultra");
  };

  const setRunning = (btn, on) => {
    btn.setAttribute("data-kh-running", on ? "1" : "0");
  };

  const isIngredientsPreviewEnabled = () => storage.readSoIngredientsPreviewEnabled?.() !== false;

  const findIngredientsPopupDialog = () => (
    Array.from(document.querySelectorAll(constants.SELECTORS.SO_INGREDIENTS_POPUP_DIALOG))
      .find((dialog) => utils.normText(dialog.textContent).includes("missing and expected ingredients for"))
    || null
  );

  const closeIngredientsPopupDialog = async () => {
    const dialog = findIngredientsPopupDialog();
    const closeBtn = dialog?.querySelector(constants.SELECTORS.SO_INGREDIENTS_POPUP_CLOSE);
    if (!closeBtn) return;

    utils.dispatchRealClick(closeBtn);
    await utils.waitForCondition(() => !findIngredientsPopupDialog(), 2000, 80).catch(() => null);
  };

  const waitForIngredientsPopupReady = async () => utils.waitForCondition(() => {
    const dialog = findIngredientsPopupDialog();
    if (!dialog) return false;

    const rows = Array.from(dialog.querySelectorAll(".ag-row"));
    const hasReadableRow = rows.some((row) => {
      const name = utils.normText(row.querySelector('[role="gridcell"][col-id="name"]')?.textContent);
      const missing = utils.normText(row.querySelector('[role="gridcell"][col-id="missingQuantity"]')?.textContent);
      return name && missing;
    });
    if (hasReadableRow) return dialog;

    const text = utils.normText(dialog.textContent);
    if (!text.includes("loading")) return dialog;
    return false;
  }, 5000, 90);

  const parseIngredientsPopup = (dialog) => {
    const product =
      dialog.querySelector('[data-testid="cardHeaderName"]')?.textContent
      || dialog.querySelector('[data-testid="headerNameUNDEFINED"]')?.textContent
      || "";

    const seen = new Set();
    const rows = [];

    Array.from(dialog.querySelectorAll(".ag-row")).forEach((row) => {
      const nameCell = row.querySelector('[role="gridcell"][col-id="name"]');
      const missingCell = row.querySelector('[role="gridcell"][col-id="missingQuantity"]');
      const expectedCell = row.querySelector('[role="gridcell"][col-id="make-buy-button"]');

      const name = (nameCell?.textContent || "").replace(/\s+/g, " ").trim();
      const missing = (missingCell?.textContent || "").replace(/\s+/g, " ").trim();
      if (!name || !missing) return;

      const key = `${name}||${missing}`;
      if (seen.has(key)) return;
      seen.add(key);

      rows.push({
        name,
        missing,
        missingValue: (missingCell?.querySelector('[data-testid="number-renderer-value-missingQuantity"]')?.textContent || "").trim(),
        missingSuffix: (missingCell?.querySelector('[data-testid="number-renderer-suffix-missingQuantity"]')?.textContent || "").trim(),
        canMake: !!expectedCell?.querySelector('button[data-testid="makeOrderButton"]'),
      });
    });

    return {
      key: `${Date.now()}-${rows.length}-${utils.normText(product).slice(0, 32)}`,
      product: product.replace(/\s+/g, " ").trim(),
      rows,
    };
  };

  const readIngredientsPreviewFromRow = async (rowEl) => {
    const ingredientsCell = rowEl?.querySelector(constants.SELECTORS.SO_INGREDIENTS_CELL);
    if (!ingredientsCell) return { ok: false, reason: "no_ingredients_cell" };

    const statusText = utils.normText(ingredientsCell.textContent);
    if (!statusText.includes("not available")) return { ok: false, reason: "ingredients_not_unavailable" };

    try {
      utils.dispatchRealClick(ingredientsCell);
      const dialog = await waitForIngredientsPopupReady();
      const data = parseIngredientsPopup(dialog);
      await closeIngredientsPopupDialog();

      if (!data.rows.length) return { ok: false, reason: "no_missing_rows" };
      return { ok: true, data };
    } catch (err) {
      utils.log("Ingredients preview read failed:", err);
      await closeIngredientsPopupDialog().catch(() => null);
      return { ok: false, reason: "popup_read_failed" };
    }
  };

  const runSoExX1Flow = async (rowEl) => {
    const actionsBtn = rowEl.querySelector(constants.SELECTORS.SO_ROW_ACTIONS_BTN);
    if (!actionsBtn) return { ok: false };

    const makeInBatch = await kh.features.statusHelper.openMenuAndSelect({
      menuButton: actionsBtn,
      itemSelector: constants.SELECTORS.SO_MENU_MAKE_IN_BATCH,
      timeoutMs: 2000,
    });
    if (!makeInBatch) return { ok: false };

    let qtyInput;
    try {
      qtyInput = await utils.waitForSelector(constants.SELECTORS.BATCH_QTY_INPUT, 3000);
    } catch {
      return { ok: false };
    }

    utils.dispatchRealClick(qtyInput);
    utils.setReactInputValue(qtyInput, "1");

    try {
      await utils.waitForCondition(() => {
        const value = (document.querySelector(constants.SELECTORS.BATCH_QTY_INPUT)?.value || "").trim();
        return value === "1";
      }, 1500, 50);
    } catch {
      return { ok: false };
    }

    let createAndOpen;
    try {
      createAndOpen = await utils.waitForSelector(constants.SELECTORS.CREATE_AND_OPEN, 2000);
    } catch {
      return { ok: false };
    }

    const originUrl = window.location.href;
    const prevUrl = window.location.href;
    storage.storeReturnUrl(originUrl);
    utils.dispatchRealClick(createAndOpen);

    try {
      await utils.waitForCondition(() => window.location.href !== prevUrl, 8000, 80);
      return { ok: true, originUrl };
    } catch {
      try {
        await utils.waitForCondition(() => window.location.pathname.includes("manufacturing"), 5000, 100);
        return { ok: true, originUrl };
      } catch {
        return { ok: false };
      }
    }
  };

  const findMoDialog = () => {
    const content = document.querySelector(constants.SELECTORS.MO_DIALOG_CONTENT);
    return content?.closest?.(constants.SELECTORS.MO_DIALOG) || null;
  };

  const findNativeIngredientsMakeMoDialog = () => {
    if (manualUltraOriginUrl) return null;
    const dialog = findMoDialog();
    if (!dialog) return null;
    if (!findIngredientsPopupDialog()) return null;
    return dialog;
  };

  const clearManualUltraOrigin = () => {
    manualUltraOriginUrl = null;
    manualIngredientsPreview = null;
    removeIngredientsPreviewPanel();
  };

  const waitForMoDialogReady = async () => {
    await utils.waitForSelector(constants.SELECTORS.BATCH_QTY_INPUT, 5000);
    await utils.waitForSelector(constants.SELECTORS.CREATE_AND_OPEN, 5000);
    return findMoDialog();
  };

  const positionIngredientsPreviewPanel = (panel, dialog) => {
    const rect = dialog.getBoundingClientRect();
    const margin = 12;
    const gap = 12;
    const rightSpace = window.innerWidth - rect.right - gap - margin;

    let width;
    let left;
    let top;
    let maxHeight;

    if (rightSpace >= 300) {
      width = Math.min(420, rightSpace);
      left = rect.right + gap;
      top = Math.max(margin, rect.top);
      maxHeight = Math.max(220, Math.min(rect.height, window.innerHeight - top - margin));
    } else {
      width = Math.min(Math.max(300, rect.width), window.innerWidth - margin * 2);
      left = Math.max(margin, Math.min(rect.left, window.innerWidth - width - margin));
      top = Math.min(rect.bottom + gap, window.innerHeight - 240);
      top = Math.max(margin, top);
      maxHeight = Math.max(220, window.innerHeight - top - margin);
    }

    panel.style.setProperty("--kh-so-ingredients-left", `${Math.round(left)}px`);
    panel.style.setProperty("--kh-so-ingredients-top", `${Math.round(top)}px`);
    panel.style.setProperty("--kh-so-ingredients-width", `${Math.round(width)}px`);
    panel.style.setProperty("--kh-so-ingredients-max-height", `${Math.round(maxHeight)}px`);
  };

  function removeIngredientsPreviewPanel() {
    document.getElementById(constants.IDS.SO_INGREDIENTS_PANEL)?.remove();
  }

  const renderIngredientsPreviewPanel = (panel, preview) => {
    panel.textContent = "";

    const header = document.createElement("div");
    header.className = "kh-so-ingredients-panel-header";

    const title = document.createElement("h3");
    title.textContent = "Missing ingredients";
    header.appendChild(title);

    if (preview.product) {
      const product = document.createElement("div");
      product.className = "kh-so-ingredients-panel-product";
      product.textContent = preview.product;
      header.appendChild(product);
    }

    const body = document.createElement("div");
    body.className = "kh-so-ingredients-panel-body";

    if (!preview.rows.length) {
      const empty = document.createElement("div");
      empty.className = "kh-so-ingredients-panel-empty";
      empty.textContent = "No missing ingredients found.";
      body.appendChild(empty);
    } else {
      preview.rows.forEach((item) => {
        const row = document.createElement("div");
        row.className = constants.CLASSES.SO_INGREDIENTS_PANEL_ROW;

        const name = document.createElement("div");
        name.className = "kh-so-ingredients-name";
        name.textContent = item.name;

        const missing = document.createElement("div");
        missing.className = "kh-so-ingredients-missing";
        missing.textContent = item.missing;

        row.appendChild(name);
        row.appendChild(missing);
        body.appendChild(row);
      });
    }

    panel.appendChild(header);
    panel.appendChild(body);
    panel.dataset.khPreviewKey = preview.key;
  };

  const ensureIngredientsPreviewPanel = () => {
    if (!isIngredientsPreviewEnabled() || !manualUltraOriginUrl || !manualIngredientsPreview) {
      removeIngredientsPreviewPanel();
      return;
    }

    const dialog = findMoDialog();
    if (!dialog) {
      removeIngredientsPreviewPanel();
      return;
    }

    let panel = document.getElementById(constants.IDS.SO_INGREDIENTS_PANEL);
    if (!panel) {
      panel = document.createElement("aside");
      panel.id = constants.IDS.SO_INGREDIENTS_PANEL;
      panel.className = constants.CLASSES.SO_INGREDIENTS_PANEL;
      panel.setAttribute("aria-label", "Missing ingredients");
      document.documentElement.appendChild(panel);
    }

    if (panel.dataset.khPreviewKey !== manualIngredientsPreview.key) {
      renderIngredientsPreviewPanel(panel, manualIngredientsPreview);
    }

    positionIngredientsPreviewPanel(panel, dialog);
  };

  const runSoOpenMakeToStockDialogFlow = async (rowEl) => {
    const actionsBtn = rowEl.querySelector(constants.SELECTORS.SO_ROW_ACTIONS_BTN);
    if (!actionsBtn) return { ok: false, reason: "no_actions_button" };

    const makeInBatch = await kh.features.statusHelper.openMenuAndSelect({
      menuButton: actionsBtn,
      itemSelector: constants.SELECTORS.SO_MENU_MAKE_IN_BATCH,
      timeoutMs: 2000,
    });
    if (!makeInBatch) return { ok: false, reason: "no_make_to_stock_item" };

    try {
      const dialog = await waitForMoDialogReady();
      if (!dialog) return { ok: false, reason: "no_mo_dialog" };
      return { ok: true, dialog };
    } catch {
      return { ok: false, reason: "dialog_not_ready" };
    }
  };

  const setCreateUltraRunning = (btn, on) => {
    btn.setAttribute("data-kh-running", on ? "1" : "0");
    btn.disabled = !!on;
    btn.textContent = on ? "Creating..." : (btn.dataset.khIdleText || "Create + Ultra");
  };

  const runCreateAndUltraFlow = async ({ btn, originUrl, label, afterMoOpen }) => {
    const createAndOpen = findMoDialog()?.querySelector(constants.SELECTORS.CREATE_AND_OPEN);
    if (!createAndOpen) {
      kh.ui.toast.showToast(`${label} stopped: couldn't find Katana's Create and view button.`, 5200);
      return;
    }

    setCreateUltraRunning(btn, true);
    removeIngredientsPreviewPanel();

    const prevUrl = window.location.href;
    storage.storeReturnUrl(originUrl);
    utils.dispatchRealClick(createAndOpen);

    try {
      await utils.waitForCondition(() => window.location.href !== prevUrl, 8000, 80);
    } catch {
      try {
        await utils.waitForCondition(() => window.location.pathname.includes("manufacturing"), 5000, 100);
      } catch {
        kh.ui.toast.showToast(`${label} stopped: MO did not open. Finish manually.`, 5600);
        setCreateUltraRunning(btn, false);
        return;
      }
    }

    afterMoOpen?.();

    try {
      const ultraRes = await kh.features.ultraEx.runUltraAfterMoOpen(originUrl);
      if (ultraRes.ok && ultraRes.ultraDone) {
        kh.ui.hud.incrementCounters(constants.CONFIG.SAVED_CLICKS_ULTRA_EXTRA);
      }
    } catch (err) {
      utils.log(`${label} failed:`, err);
      kh.ui.toast.showToast(`${label} stopped unexpectedly. Finish manually.`, 5600);
    }
  };

  const runManualUltraCreateFlow = async (btn) => {
    await runCreateAndUltraFlow({
      btn,
      originUrl: manualUltraOriginUrl || window.location.href,
      label: "Create + Ultra",
      afterMoOpen: clearManualUltraOrigin,
    });
  };

  const runNativeMakeCreateExFlow = async (btn) => {
    await runCreateAndUltraFlow({
      btn,
      originUrl: window.location.href,
      label: "Create + EX",
    });
  };

  const bindNativeDialogButtonClear = (dialog) => {
    const selectors = [
      constants.SELECTORS.CREATE_AND_OPEN,
      'button[data-testid="cancelButton"]',
      'button[data-testid="createAndCloseOrderButton"]',
    ];

    selectors.forEach((selector) => {
      const btn = dialog.querySelector(selector);
      if (!btn || btn.dataset.khManualUltraClearBound === "1") return;
      btn.dataset.khManualUltraClearBound = "1";
      btn.addEventListener("click", clearManualUltraOrigin, { capture: true, once: true });
    });
  };

  const ensureCreateUltraButton = () => {
    const dialog = findMoDialog();
    if (!dialog) return;

    const createAndOpen = dialog.querySelector(constants.SELECTORS.CREATE_AND_OPEN);
    if (!createAndOpen) return;

    const actions = createAndOpen.parentElement;
    if (!actions) return;

    if (manualUltraOriginUrl) {
      dialog.querySelector(`#${constants.IDS.BTN_CREATE_EX_MO}`)?.remove();
      bindNativeDialogButtonClear(dialog);

      let btn = dialog.querySelector(`#${constants.IDS.BTN_CREATE_ULTRA_MO}`);
      if (!btn) {
        btn = utils.createButton({
          id: constants.IDS.BTN_CREATE_ULTRA_MO,
          text: "Create + Ultra",
          title: "Create and view this MO, verify ingredients, mark Done, and return to the sales order.",
          onClick: (event) => {
            event.preventDefault();
            event.stopPropagation();

            if (btn.getAttribute("data-kh-running") === "1") return;
            runManualUltraCreateFlow(btn);
          },
        });
        btn.dataset.khIdleText = "Create + Ultra";
      }

      if (btn.parentElement !== actions) {
        actions.appendChild(btn);
      }
      return;
    }

    dialog.querySelector(`#${constants.IDS.BTN_CREATE_ULTRA_MO}`)?.remove();

    if (!findNativeIngredientsMakeMoDialog()) {
      dialog.querySelector(`#${constants.IDS.BTN_CREATE_EX_MO}`)?.remove();
      return;
    }

    let btn = dialog.querySelector(`#${constants.IDS.BTN_CREATE_EX_MO}`);
    if (!btn) {
      btn = utils.createButton({
        id: constants.IDS.BTN_CREATE_EX_MO,
        text: "Create + EX",
        title: "Create and view this ingredient MO, verify ingredients, mark Done, and return to the sales order.",
        onClick: (event) => {
          event.preventDefault();
          event.stopPropagation();

          if (btn.getAttribute("data-kh-running") === "1") return;
          runNativeMakeCreateExFlow(btn);
        },
      });
      btn.dataset.khIdleText = "Create + EX";
    }

    if (btn.parentElement !== actions) {
      actions.appendChild(btn);
    }
  };

  const runSoManualUltraDialogFlow = async (rowEl) => {
    manualUltraOriginUrl = window.location.href;
    manualIngredientsPreview = null;
    removeIngredientsPreviewPanel();

    if (isIngredientsPreviewEnabled()) {
      const preview = await readIngredientsPreviewFromRow(rowEl);
      if (preview.ok) {
        manualIngredientsPreview = preview.data;
      }
    }

    const res = await runSoOpenMakeToStockDialogFlow(rowEl);
    if (!res.ok) {
      clearManualUltraOrigin();
      kh.ui.toast.showToast(`EX stopped: couldn't open Make to stock (${res.reason}).`, 5200);
      return { ok: false };
    }

    ensureCreateUltraButton();
    ensureIngredientsPreviewPanel();
    kh.ui.hud.incrementCounters(constants.CONFIG.SAVED_CLICKS_EX_MANUAL_DIALOG);
    kh.ui.toast.showToast("EX: enter quantity, then click Create + Ultra.", 3600);
    return { ok: true };
  };

  const ensureSoExButtons = () => {
    kh.ui.styles.ensureStyles();
    ensureCreateUltraButton();
    ensureIngredientsPreviewPanel();

    const actionButtons = document.querySelectorAll(constants.SELECTORS.SO_ROW_ACTIONS_BTN);
    if (!actionButtons.length) return;

    actionButtons.forEach((plusBtn) => {
      const container = plusBtn.parentElement;
      if (!container) return;

      if (container.querySelector(`button.${constants.CLASSES.BTN_SO_EX}`)) return;

      const btn = utils.createButton({
        className: constants.CLASSES.BTN_SO_EX,
        text: "EX",
        title:
          `EX (single-click): Open Make to stock so you can choose quantity, then use Create + Ultra.\n` +
          `Ultra EX (double-click within ${constants.CONFIG.DOUBLE_CLICK_WINDOW_MS}ms): Make qty=1, verify ingredients, mark Done, and return here.`,
        onClick: (event) => {
          event.preventDefault();
          event.stopPropagation();

          if (btn.getAttribute("data-kh-running") === "1") return;

          const existingTimer = exTimers.get(btn);

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

              kh.ui.hud.incrementCounters(constants.CONFIG.SAVED_CLICKS_EX_NORMAL);

              const ultraRes = await kh.features.ultraEx.runUltraAfterMoOpen(exRes.originUrl);
              if (ultraRes.ok && ultraRes.ultraDone) {
                kh.ui.hud.incrementCounters(constants.CONFIG.SAVED_CLICKS_ULTRA_EXTRA);
              }

              setExButtonUltraVisual(btn, false);
              setRunning(btn, false);
            })();

            return;
          }

          const timer = setTimeout(() => {
            exTimers.delete(btn);

            (async () => {
              setRunning(btn, true);
              setExButtonUltraVisual(btn, false);

              try {
                const rowEl = getClosestAgRow(btn);
                if (!rowEl) return;

                await runSoManualUltraDialogFlow(rowEl);
              } finally {
                setRunning(btn, false);
              }
            })();
          }, constants.CONFIG.DOUBLE_CLICK_WINDOW_MS);

          exTimers.set(btn, timer);
        },
      });

      container.insertBefore(btn, plusBtn);
    });
  };

  kh.features = kh.features || {};
  kh.features.soEx = {
    ensureSoExButtons,
    runSoExX1Flow,
    runSoManualUltraDialogFlow,
    readIngredientsPreviewFromRow,
  };
})();


/* src/features/etsyButton.js */
(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants, utils } = kh;

  const getEtsyOrderIdFromHeader = () => {
    const header = document.querySelector(constants.SELECTORS.HEADER_SALES_ORDER);
    const text = header?.textContent || "";
    const match = text.match(/ETSY[\s\-_]+(\d+)/i);
    return match?.[1] || "";
  };

  const ensureEtsyOrderButton = () => {
    kh.ui.styles.ensureStyles();

    const soOrderField = document.querySelector(constants.SELECTORS.SO_ORDER_FIELD);
    if (!soOrderField) return;

    const gridContainer = utils.findMuiGridAncestor(soOrderField, "container");
    if (!gridContainer) return;

    const soOrderItem = utils.findMuiGridAncestor(soOrderField, "item");
    if (!soOrderItem) return;

    const orderInput = soOrderField.querySelector(constants.SELECTORS.SO_ORDER_INPUT);
    const orderValue = orderInput?.value || "";
    const isEtsyOrder = orderValue.toLowerCase().includes("etsy");

    const existingBtn = document.getElementById(constants.IDS.BTN_ETSY_ORDER);
    const existingCell = document.getElementById(constants.IDS.ETSY_ORDER_CELL);
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
        .filter((cls) => cls.startsWith("MuiGrid-root") || cls.startsWith("MuiGrid-item"))
        .join(" ");
      cell.id = constants.IDS.ETSY_ORDER_CELL;
      cell.className = `${baseItemClasses} ${constants.CLASSES.ETSY_ORDER_CELL}`.trim();
      gridContainer.insertBefore(cell, soOrderItem.nextSibling);
    }

    const btn = utils.createButton({
      id: constants.IDS.BTN_ETSY_ORDER,
      text: "Etsy",
      title: "Goes to Etsy order page (opens in a new window)",
      onClick: (event) => {
        event.preventDefault();
        event.stopPropagation();
        btn.setAttribute("data-kh-clicked", "1");
        setTimeout(() => btn.removeAttribute("data-kh-clicked"), 220);
        const orderId = getEtsyOrderIdFromHeader();
        const url = orderId ? `${constants.URLS.ETSY_ORDER}?order_id=${orderId}` : constants.URLS.ETSY_ORDER;
        kh.ui.hud.incrementCounters(3);
        const win = window.open(url, "_blank", "noopener,noreferrer");
        win.focus?.();
      },
    });

    cell.appendChild(btn);
  };

  kh.features = kh.features || {};
  kh.features.etsyButton = { ensureEtsyOrderButton };
})();


/* src/features/poSupplierShortcut.js */
(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants, utils, storage } = kh;

  const SUPPLIER_SELECTORS = [
    'input[name="supplierId"]',
    'input[name="supplier"]',
    'input[data-testid*="supplier" i]',
    'input[placeholder*="Supplier" i]',
    'input[aria-label*="Supplier" i]',
  ];

  let lastInput = null;
  let activePreviewLabel = null;
  let activePreviewSupplierKey = null;

  const isPurchaseOrderPage = () => window.location.pathname.startsWith("/purchaseorder/");

  const findSupplierInput = () => {
    for (const selector of SUPPLIER_SELECTORS) {
      const input = document.querySelector(selector);
      if (input) return input;
    }

    const labels = [...document.querySelectorAll("label")];
    for (const label of labels) {
      if (!utils.normText(label.textContent).includes("supplier")) continue;
      if (label.htmlFor) {
        const target = document.getElementById(label.htmlFor);
        if (target) return target;
      }
      const container = label.closest("div");
      const nestedInput = container?.querySelector("input, textarea");
      if (nestedInput) return nestedInput;
    }

    return null;
  };

  const removeSupplierButton = () => {
    const wrap = document.getElementById(constants.IDS.WRAP_PO_SUPPLIER);
    if (wrap) wrap.remove();
  };

  const handleSupplierInput = () => {
    ensureSupplierShortcutButton();
  };

  const wireSupplierInput = (input) => {
    if (lastInput === input) return;
    if (lastInput) {
      lastInput.removeEventListener("input", handleSupplierInput);
      lastInput.removeEventListener("change", handleSupplierInput);
    }
    lastInput = input;
    input.addEventListener("input", handleSupplierInput);
    input.addEventListener("change", handleSupplierInput);
  };

  const getSupplierState = (supplierName) => {
    const trimmed = (supplierName || "").trim();
    const key = storage.normalizeSupplierName(trimmed);
    if (!key) return null;
    const map = storage.readSupplierButtons();
    const stored = map[key] || {};
    const label = (stored.label || trimmed).trim() || "Supplier";
    const url = (stored.url || "").trim();
    const color = (stored.color || constants.CONFIG.PO_SUPPLIER_BUTTON_BG).trim();
    return {
      key,
      name: trimmed,
      label,
      url,
      color,
    };
  };

  const ensureEditModal = () => {
    let modal = document.getElementById(constants.IDS.PO_SUPPLIER_MODAL);
    if (!modal) {
      modal = document.createElement("div");
      modal.id = constants.IDS.PO_SUPPLIER_MODAL;
      modal.className = constants.CLASSES.PO_SUPPLIER_MODAL;
      document.body.appendChild(modal);
    }
    return modal;
  };

  const closeEditModal = (modal) => {
    if (!modal) return;
    modal.removeAttribute("data-open");
  };

  const openEditModal = (state, { onSave, onPreview } = {}) => {
    const modal = ensureEditModal();
    modal.innerHTML = "";
    activePreviewLabel = state.label;
    activePreviewSupplierKey = state.key;

    const content = document.createElement("div");
    content.className = constants.CLASSES.PO_SUPPLIER_MODAL_CONTENT;

    const title = document.createElement("h3");
    title.textContent = `Edit supplier shortcut`;

    const labelRow = document.createElement("label");
    labelRow.className = constants.CLASSES.PO_SUPPLIER_MODAL_ROW;
    labelRow.textContent = "Button label";
    const labelInput = document.createElement("input");
    labelInput.type = "text";
    labelInput.value = state.label;
    labelRow.appendChild(labelInput);

    const urlRow = document.createElement("label");
    urlRow.className = constants.CLASSES.PO_SUPPLIER_MODAL_ROW;
    urlRow.textContent = "Supplier URL";
    const urlInput = document.createElement("input");
    urlInput.type = "text";
    urlInput.placeholder = "https://";
    urlInput.value = state.url;
    urlRow.appendChild(urlInput);

    const colorRow = document.createElement("label");
    colorRow.className = constants.CLASSES.PO_SUPPLIER_MODAL_ROW;
    colorRow.textContent = "Button color";
    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = state.color;
    colorRow.appendChild(colorInput);

    const buildNextState = () => ({
      ...state,
      label: labelInput.value.trim() || state.name,
      url: urlInput.value.trim(),
      color: colorInput.value || constants.CONFIG.PO_SUPPLIER_BUTTON_BG,
    });

    const handlePreviewUpdate = () => {
      const nextState = buildNextState();
      activePreviewLabel = nextState.label;
      if (!onPreview) return;
      onPreview({
        ...state,
        label: nextState.label,
        url: nextState.url,
      });
    };

    const warning = document.createElement("p");
    warning.className = constants.CLASSES.PO_SUPPLIER_MODAL_WARNING;
    warning.textContent = "Warning: Clicking Save will refresh the page.";

    const actions = document.createElement("div");
    actions.className = constants.CLASSES.PO_SUPPLIER_MODAL_ACTIONS;
    const cancelBtn = utils.createButton({
      text: "Cancel",
      onClick: (event) => {
        event.preventDefault();
        const savedState = getSupplierState(state.name);
        if (savedState && onPreview) onPreview(savedState);
        activePreviewLabel = null;
        activePreviewSupplierKey = null;
        closeEditModal(modal);
      },
    });
    const saveBtn = utils.createButton({
      text: "Save",
      onClick: (event) => {
        event.preventDefault();
        const nextState = buildNextState();
        storage.upsertSupplierButton(state.name, {
          label: nextState.label,
          url: nextState.url,
          color: nextState.color,
        });
        if (onPreview) onPreview(nextState);
        activePreviewLabel = null;
        activePreviewSupplierKey = null;
        closeEditModal(modal);
        if (onSave) onSave(nextState);
        window.location.reload();
      },
    });
    actions.append(cancelBtn, saveBtn);

    content.append(title, labelRow, urlRow, colorRow, warning, actions);
    modal.appendChild(content);

    labelInput.addEventListener("input", handlePreviewUpdate);
    urlInput.addEventListener("input", handlePreviewUpdate);

    modal.addEventListener("click", (event) => {
      if (event.target !== modal) return;
      activePreviewLabel = null;
      activePreviewSupplierKey = null;
      closeEditModal(modal);
    }, { once: true });

    modal.addEventListener("click", (event) => {
      if (event.target === colorInput) return;
      if (document.activeElement === colorInput) colorInput.blur();
    });

    modal.setAttribute("data-open", "1");
  };

  const applySupplierState = (btn, state) => {
    if (!btn || !state) return;
    btn.textContent = state.label;
    btn.title = state.url
      ? "Open supplier order page in new window"
      : "Set a supplier URL to enable";
    btn.style.setProperty("--kh-supplier-btn-bg", state.color);
    btn.style.setProperty("--kh-supplier-btn-color", constants.CONFIG.PO_SUPPLIER_BUTTON_TEXT);
    if (state.url) {
      btn.removeAttribute("data-kh-disabled");
    } else {
      btn.setAttribute("data-kh-disabled", "1");
    }
    btn.setAttribute("data-supplier-key", state.key);
    btn.setAttribute("data-supplier-name", state.name);
  };

  const ensureSupplierShortcutButton = () => {
    if (!isPurchaseOrderPage()) {
      removeSupplierButton();
      if (lastInput) {
        lastInput.removeEventListener("input", handleSupplierInput);
        lastInput.removeEventListener("change", handleSupplierInput);
        lastInput = null;
      }
      return;
    }

    kh.ui.styles.ensureStyles();

    const statusBtn = document.querySelector(constants.SELECTORS.ENTITY_STATUS_BTN);
    if (!statusBtn) {
      removeSupplierButton();
      return;
    }

    const parent = statusBtn.parentElement;
    if (!parent) {
      removeSupplierButton();
      return;
    }

    const supplierInput = findSupplierInput();
    if (!supplierInput) {
      removeSupplierButton();
      if (lastInput) {
        lastInput.removeEventListener("input", handleSupplierInput);
        lastInput.removeEventListener("change", handleSupplierInput);
        lastInput = null;
      }
      return;
    }

    wireSupplierInput(supplierInput);

    const supplierValue = supplierInput.value || "";
    const state = getSupplierState(supplierValue);
    if (!state) {
      removeSupplierButton();
      return;
    }

    let wrap = document.getElementById(constants.IDS.WRAP_PO_SUPPLIER);
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = constants.IDS.WRAP_PO_SUPPLIER;
      wrap.className = constants.CLASSES.PO_SUPPLIER_WRAP;
      parent.insertBefore(wrap, statusBtn);
    }

    let btn = document.getElementById(constants.IDS.BTN_PO_SUPPLIER);
    if (!btn) {
      btn = utils.createButton({
        id: constants.IDS.BTN_PO_SUPPLIER,
        className: constants.CLASSES.PO_SUPPLIER_BTN,
        onClick: (event) => {
          event.preventDefault();
          event.stopPropagation();
          const currentSupplier = btn.getAttribute("data-supplier-name") || "";
          const currentState = getSupplierState(currentSupplier);
          if (!currentState) return;
          if (!currentState.url) {
            openEditModal(currentState, {
              onSave: ensureSupplierShortcutButton,
              onPreview: (nextState) => applySupplierState(btn, nextState),
            });
            return;
          }
          kh.ui.hud.incrementCounters(3);
          const win = window.open(currentState.url, "_blank", "noopener,noreferrer");
          win.focus?.();
        },
      });
      wrap.appendChild(btn);
    }

    let editBtn = document.getElementById(constants.IDS.BTN_PO_SUPPLIER_EDIT);
    if (!editBtn) {
      editBtn = utils.createButton({
        id: constants.IDS.BTN_PO_SUPPLIER_EDIT,
        className: constants.CLASSES.PO_SUPPLIER_EDIT,
        text: "✎",
        title: "Edit supplier shortcut",
        onClick: (event) => {
          event.preventDefault();
          event.stopPropagation();
          const currentSupplier = btn.getAttribute("data-supplier-name") || "";
          const currentState = getSupplierState(currentSupplier);
          if (!currentState) return;
          openEditModal(currentState, {
            onSave: ensureSupplierShortcutButton,
            onPreview: (nextState) => applySupplierState(btn, nextState),
          });
        },
      });
      wrap.appendChild(editBtn);
    }

    applySupplierState(btn, state);
    if (activePreviewSupplierKey && activePreviewSupplierKey === state.key && activePreviewLabel !== null) {
      btn.textContent = activePreviewLabel;
    }
  };

  kh.features = kh.features || {};
  kh.features.poSupplierShortcut = { ensureSupplierShortcutButton };
})();


/* src/features/simplyPrintNav.js */
(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants } = kh;

  const ensureSimplyPrintNavButton = () => {
    kh.ui.styles.ensureStyles();

    const itemsBtn = document.querySelector(constants.SELECTORS.NAV_ITEMS_BTN);
    if (!itemsBtn) return;

    const parent = itemsBtn.parentElement;
    if (!parent) return;

    let btn = document.getElementById(constants.IDS.BTN_SIMPLYPRINT_NAV);
    const isNew = !btn;
    if (!btn) {
      btn = document.createElement("a");
      btn.id = constants.IDS.BTN_SIMPLYPRINT_NAV;
      btn.href = constants.URLS.SIMPLYPRINT_PANEL;
      btn.setAttribute("role", "button");
      btn.setAttribute("aria-disabled", "false");
      btn.title = "Open SimplyPrint in a new window";
    }
    btn.className = `${itemsBtn.className} ${constants.CLASSES.SIMPLYPRINT_NAV}`.trim();

    if (isNew) {
      const itemsLabel = itemsBtn.querySelector(".MuiButton-label");
      const labelClass = itemsLabel?.className || "";

      const label = document.createElement("span");
      label.className = `${labelClass} kh-simplyprint-label`.trim();

      const icon = document.createElement("img");
      icon.src = constants.URLS.SIMPLYPRINT_ICON;
      icon.alt = "SimplyPrint";
      icon.className = "kh-simplyprint-icon";

      const text = document.createElement("span");
      text.textContent = "SimplyPrint ↗";

      label.appendChild(icon);
      label.appendChild(text);

      btn.appendChild(label);

      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        kh.ui.hud.incrementCounters(3);
        const win = window.open(constants.URLS.SIMPLYPRINT_PANEL, "_blank", "noopener,noreferrer");
        win.focus?.();
      }, { capture: true });
    }

    if (btn.parentElement !== parent) {
      parent.insertBefore(btn, itemsBtn.nextSibling);
      return;
    }
    if (itemsBtn.nextSibling !== btn) {
      parent.insertBefore(btn, itemsBtn.nextSibling);
    }
  };

  kh.features = kh.features || {};
  kh.features.simplyPrintNav = { ensureSimplyPrintNavButton };
})();


/* src/init.js */
(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};

  let scheduled = false;
  let lastRun = 0;

  const ensureAll = () => {
    scheduled = false;
    const now = Date.now();
    if (now - lastRun < 150) return;
    lastRun = now;

    kh.ui.hud.ensureHud();
    kh.ui.moTimer.ensureMoTimer();
    kh.features.createMo.ensureCreateMoButton();
    kh.features.createPo.ensureCreatePoButton();
    kh.features.statusHelper.ensureEntityStatusHelper();
    kh.features.doneAndReturn.ensureMoDoneReturnButton();
    kh.features.moQuantityAutofill.ensureMoQuantityAutofill();
    kh.features.soShippingAutofill.ensureSoShippingAutofill();
    kh.features.soEx.ensureSoExButtons();
    kh.features.etsyButton.ensureEtsyOrderButton();
    kh.features.poSupplierShortcut.ensureSupplierShortcutButton();
    kh.features.simplyPrintNav.ensureSimplyPrintNavButton();
  };

  const scheduleEnsure = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(ensureAll);
  };

  const initObserver = () => {
    const obs = new MutationObserver(() => scheduleEnsure());
    obs.observe(document.documentElement, { childList: true, subtree: true });
  };

  const init = () => {
    ensureAll();
    initObserver();
    window.addEventListener("resize", scheduleEnsure);
    document.documentElement.dataset.katanaHelpersReadyVersion = kh.constants.version || "unknown";
    document.documentElement.dataset.katanaHelpersReadyAt = new Date().toISOString();
    window.dispatchEvent(new CustomEvent("katana-helpers:ready", {
      detail: {
        version: document.documentElement.dataset.katanaHelpersReadyVersion,
        at: document.documentElement.dataset.katanaHelpersReadyAt,
      },
    }));
  };

  init();
})();
