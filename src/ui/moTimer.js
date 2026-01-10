(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants } = kh;

  const TIMER_STATE = {
    state: "idle",
    accumulatedMs: 0,
    lastTickTs: null,
    intervalId: null,
  };

  let lastStatusState = null;
  let devWarned = false;
  let unloadBound = false;

  const isManufacturingOrderPage = () => window.location.pathname.startsWith("/manufacturingorder/");

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
    timerEl.textContent = ` | MO Timer: ${formatElapsed(getElapsedMs())}`;
  };

  const tick = () => {
    if (TIMER_STATE.state !== "running") return;
    const now = Date.now();
    const last = TIMER_STATE.lastTickTs ?? now;
    TIMER_STATE.accumulatedMs += Math.max(0, now - last);
    TIMER_STATE.lastTickTs = now;
    updateTimerDisplay();
  };

  const startTimer = () => {
    if (TIMER_STATE.state === "running") return;
    stopInterval();
    TIMER_STATE.state = "running";
    TIMER_STATE.lastTickTs = Date.now();
    TIMER_STATE.intervalId = setInterval(tick, 1000);
    updateTimerDisplay();
  };

  const pauseTimer = () => {
    if (TIMER_STATE.state !== "running") return;
    const now = Date.now();
    if (TIMER_STATE.lastTickTs !== null) {
      TIMER_STATE.accumulatedMs += Math.max(0, now - TIMER_STATE.lastTickTs);
    }
    TIMER_STATE.lastTickTs = null;
    stopInterval();
    TIMER_STATE.state = "paused";
    updateTimerDisplay();
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
      startTimer();
      return;
    }

    if (TIMER_STATE.state === "running") {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  const onTimerHover = (event) => {
    event.preventDefault();
    event.stopPropagation();
    kh.ui?.toast?.showToast?.("MO Timer: click to pause/resume • Shift+click to reset & start", 3600);
  };

  const ensureTimerElement = () => {
    const hud = document.getElementById(constants.IDS.HUD);
    if (!hud) return null;
    const todayEl = hud.querySelector("#kh-today");
    if (!todayEl) return null;

    let timerEl = document.getElementById(constants.IDS.MO_TIMER);
    if (!timerEl) {
      timerEl = document.createElement("span");
      timerEl.id = constants.IDS.MO_TIMER;
      timerEl.dataset.state = TIMER_STATE.state;
      timerEl.textContent = " | MO Timer: 0:00";
      timerEl.addEventListener("click", onTimerClick, { capture: true });
      timerEl.addEventListener("mouseenter", onTimerHover, { capture: true });
      todayEl.insertAdjacentElement("afterend", timerEl);
    }
    return timerEl;
  };

  const cleanupTimer = () => {
    removeTimerElement();
    resetTimerState();
    lastStatusState = null;
  };

  const ensureMoTimer = () => {
    if (!isManufacturingOrderPage()) {
      cleanupTimer();
      return;
    }

    warnDevMode();

    const getCtx = kh.features?.statusHelper?.getEntityStatusContext;
    if (typeof getCtx !== "function") return;

    const ctx = getCtx();
    const eligible = ctx.mode === "manufacturing" && (ctx.state === "notStarted" || ctx.state === "done");

    if (!eligible) {
      removeTimerElement();
      resetTimerState();
      lastStatusState = null;
      return;
    }

    const timerEl = ensureTimerElement();
    if (!timerEl) {
      if (TIMER_STATE.state === "running") pauseTimer();
      return;
    }

    if (TIMER_STATE.state === "idle") startTimer();

    if (lastStatusState && lastStatusState !== ctx.state) {
      if (ctx.state === "done") pauseTimer();
      if (ctx.state === "notStarted") startTimer();
    } else if (!lastStatusState && ctx.state === "done" && TIMER_STATE.state === "running") {
      pauseTimer();
    }

    lastStatusState = ctx.state;
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
  };
})();
