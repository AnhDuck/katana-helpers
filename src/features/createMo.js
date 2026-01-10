(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants, utils } = kh;

  const runCreateMoFlow = async () => {
    if (window.location.pathname.startsWith("/add-manufacturingorder")) return;

    const createBtn = document.querySelector(constants.SELECTORS.CREATE_BTN);
    if (!createBtn) return;

    let moItem = document.querySelector(constants.SELECTORS.MO_ITEM);
    if (moItem) {
      utils.dispatchRealClick(moItem);
      return;
    }

    moItem = await kh.features.statusHelper.openMenuAndSelect({
      menuButton: createBtn,
      itemSelector: constants.SELECTORS.MO_ITEM,
      timeoutMs: 1500,
    });
    if (!moItem) return;
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
        kh.ui.hud.incrementCounters(1);
        await runCreateMoFlow();
      },
    });

    parent.insertBefore(btn, createBtn);
  };

  kh.features = kh.features || {};
  kh.features.createMo = { ensureCreateMoButton, runCreateMoFlow };
})();
