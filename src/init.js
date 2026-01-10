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
    kh.features.createMo.ensureCreateMoButton();
    kh.features.statusHelper.ensureEntityStatusHelper();
    kh.features.doneAndReturn.ensureMoDoneReturnButton();
    kh.features.soEx.ensureSoExButtons();
    kh.features.etsyButton.ensureEtsyOrderButton();
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
  };

  init();
})();
