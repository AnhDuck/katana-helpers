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

  const getReferrerSalesOrderId = () => {
    if (!document.referrer) return null;
    try {
      const ref = new URL(document.referrer);
      if (ref.origin !== window.location.origin) return null;
      const match = ref.pathname.match(/^\/salesorder\/(\d+)/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
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
    const refSoId = getReferrerSalesOrderId();
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

    if (refSoId && store.timers?.[refSoId]) {
      const refEntry = store.timers[refSoId];
      if (isSoPage) {
        const currentSoId = getSalesOrderId();
        if (currentSoId && currentSoId !== refSoId) {
          pauseSoEntry(refEntry, true);
        }
      } else if (isMoPage) {
        refEntry.carryOver = true;
        refEntry.autoResume = false;
        refEntry.updatedAt = Date.now();
        store.activeId = refSoId;
        storeChanged = true;
      } else {
        pauseSoEntry(refEntry, true);
      }
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
