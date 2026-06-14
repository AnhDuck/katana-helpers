(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants, utils, storage } = kh;

  const ensureHud = () => {
    kh.ui.styles.ensureStyles();
    const { el: hud, created } = utils.ensureElement(constants.IDS.HUD);
    if (created) {
      hud.innerHTML = `
        <button id="kh-reset" type="button" title="Reset total + today">Reset</button>
        <label class="kh-hud-toggle" title="Show missing ingredients beside single-click EX dialogs">
          <input id="${constants.IDS.HUD_SO_INGREDIENTS_TOGGLE}" type="checkbox">
          <span>Ingredient preview</span>
        </label>
        <span class="kh-hud-text">
          <span class="kh-hud-total" title="Start date: January 3rd, 2026">Total clicks saved: <strong id="kh-total">0</strong></span> | Clicks saved today: <strong id="kh-today">0</strong>
        </span>
      `;

      hud.querySelector("#kh-reset")?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        storage.writeTotal(0);
        storage.writeByDateMap({});
        updateHud();
      }, { capture: true });

      hud.querySelector(`#${constants.IDS.HUD_SO_INGREDIENTS_TOGGLE}`)?.addEventListener("change", (event) => {
        storage.writeSoIngredientsPreviewEnabled(event.target.checked);
        kh.features?.soEx?.ensureSoExButtons?.();
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

    const total = storage.readTotal();
    const ymd = utils.getPacificYMD();
    const map = storage.readByDateMap();
    const today = storage.getTodayCount(map, ymd);

    if (totalEl) totalEl.textContent = String(total);
    if (todayEl) todayEl.textContent = String(today);
    if (previewToggle) previewToggle.checked = storage.readSoIngredientsPreviewEnabled();
  };

  const incrementCounters = (delta = 1) => {
    const ymd = utils.getPacificYMD();

    const total = storage.readTotal() + delta;
    storage.writeTotal(total);

    const map = storage.readByDateMap();
    map[ymd] = storage.getTodayCount(map, ymd) + delta;
    storage.writeByDateMap(map);

    updateHud();
  };

  kh.ui = kh.ui || {};
  kh.ui.hud = { ensureHud, updateHud, incrementCounters };
})();
