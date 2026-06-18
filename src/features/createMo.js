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
