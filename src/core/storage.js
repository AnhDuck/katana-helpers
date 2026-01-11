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
  let mem = { total: 0, byDate: {}, supplierButtons: {} };

  const readTotal = () => {
    if (!HAS_STORAGE) return mem.total;
    const raw = localStorage.getItem(constants.KEYS.TOTAL);
    const parsed = raw == null ? 0 : parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const writeTotal = (value) => {
    if (!HAS_STORAGE) {
      mem.total = value;
      return;
    }
    localStorage.setItem(constants.KEYS.TOTAL, String(value));
  };

  const readByDateMap = () => {
    if (!HAS_STORAGE) return mem.byDate;
    const raw = localStorage.getItem(constants.KEYS.BY_DATE);
    const obj = utils.safeJsonParse(raw || "{}", {});
    return obj && typeof obj === "object" ? obj : {};
  };

  const writeByDateMap = (map) => {
    if (!HAS_STORAGE) {
      mem.byDate = map;
      return;
    }
    localStorage.setItem(constants.KEYS.BY_DATE, JSON.stringify(map));
  };

  const getTodayCount = (map, ymd) => {
    const value = map?.[ymd];
    return Number.isFinite(value) ? value : 0;
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
    upsertSupplierButton,
    normalizeReturnUrl,
    isSameUrl,
    getStoredReturnUrl,
    storeReturnUrl,
    maybeStoreReturnUrlFromReferrer,
  };
})();
