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
