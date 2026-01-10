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
