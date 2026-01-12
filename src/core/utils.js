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
    const baseClass = constants.CLASSES.BTN_BASE || "kh-btn";
    btn.className = [baseClass, className].filter(Boolean).join(" ");
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
