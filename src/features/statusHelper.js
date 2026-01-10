(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants, utils } = kh;

  const STATUS_HELPER_CONFIG = {
    manufacturing: {
      notStarted: { text: "Done", className: "kh-mo-done", title: "Mark MO as Done" },
      done: { hidden: true },
    },
    sales: {
      notShipped: {
        text: "Pack all",
        className: "kh-so-packall",
        title: "Pack all (won't count if 'Not enough stock' appears)",
      },
      packed: { hidden: true },
    },
  };

  const getEntityStatusContext = () => {
    const statusBtn = document.querySelector(constants.SELECTORS.ENTITY_STATUS_BTN);
    if (!statusBtn) return { mode: "none", state: "none", text: "" };

    const text = utils.normText(statusBtn.textContent);

    if (text.includes("not shipped")) return { mode: "sales", state: "notShipped", text };
    if (text.includes("packed")) return { mode: "sales", state: "packed", text };

    if (text.includes("not started")) return { mode: "manufacturing", state: "notStarted", text };
    if (text.includes("done")) return { mode: "manufacturing", state: "done", text };

    return { mode: "unknown", state: "unknown", text };
  };

  const openMenuAndSelect = async ({ menuButton, itemSelector, timeoutMs = 1500 }) => {
    if (menuButton) utils.dispatchRealClick(menuButton);
    const item = await utils.waitForSelector(itemSelector, timeoutMs).catch(() => null);
    if (!item) return null;
    utils.dispatchRealClick(item);
    return item;
  };

  const isNotEnoughStockDialogOpen = () => {
    const titleEl = document.querySelector(constants.SELECTORS.DIALOG_TITLE);
    if (!titleEl) return false;
    return utils.normText(titleEl.textContent).includes("not enough stock");
  };

  const runSoPackAllFlow = async () => {
    const statusBtn = document.querySelector(constants.SELECTORS.ENTITY_STATUS_BTN);
    if (!statusBtn) return false;
    const packAllItem = await openMenuAndSelect({
      menuButton: statusBtn,
      itemSelector: constants.SELECTORS.SO_STATUS_PACK_ALL_ITEM,
      timeoutMs: 1500,
    });
    if (!packAllItem) return false;

    try {
      const outcome = await utils.waitForCondition(() => {
        if (isNotEnoughStockDialogOpen()) return "error";
        const ctx = getEntityStatusContext();
        if (ctx.mode === "sales" && ctx.state === "packed") return "packed";
        return false;
      }, 10000, 80);

      if (outcome === "error") {
        const closeBtn = document.querySelector(constants.SELECTORS.DIALOG_CLOSE_BTN);
        if (closeBtn) utils.dispatchRealClick(closeBtn);
        return false;
      }
      return outcome === "packed";
    } catch {
      if (isNotEnoughStockDialogOpen()) {
        const closeBtn = document.querySelector(constants.SELECTORS.DIALOG_CLOSE_BTN);
        if (closeBtn) utils.dispatchRealClick(closeBtn);
      }
      return false;
    }
  };

  const runMoSetDoneFlow = async () => {
    const statusBtn = document.querySelector(constants.SELECTORS.ENTITY_STATUS_BTN);
    if (!statusBtn) return false;
    const doneItem = await openMenuAndSelect({
      menuButton: statusBtn,
      itemSelector: constants.SELECTORS.MO_STATUS_DONE_ITEM,
      timeoutMs: 1500,
    });
    if (!doneItem) return false;

    try {
      await utils.waitForCondition(() => {
        const ctx = getEntityStatusContext();
        return ctx.mode === "manufacturing" && ctx.state === "done";
      }, 7000, 90);
      return true;
    } catch {
      return false;
    }
  };

  const ensureEntityStatusHelper = () => {
    kh.ui.styles.ensureStyles();

    const statusBtn = document.querySelector(constants.SELECTORS.ENTITY_STATUS_BTN);
    if (!statusBtn) return;

    const parent = statusBtn.parentElement;
    if (!parent) return;

    let helper = document.getElementById(constants.IDS.BTN_STATUS_HELPER);
    if (!helper) {
      helper = utils.createButton({
        id: constants.IDS.BTN_STATUS_HELPER,
        onClick: async (event) => {
          event.preventDefault();
          event.stopPropagation();

          if (helper.getAttribute("data-kh-running") === "1") return;
          helper.setAttribute("data-kh-running", "1");

          try {
            const ctx = getEntityStatusContext();

            if (ctx.mode === "manufacturing" && ctx.state === "notStarted") {
              const ok = await runMoSetDoneFlow();
              if (ok) {
                kh.ui.hud.incrementCounters(1);
              }
              return;
            }

            if (ctx.mode === "sales" && ctx.state === "notShipped") {
              const ok = await runSoPackAllFlow();
              if (ok) {
                kh.ui.hud.incrementCounters(1);
              }
            }
          } finally {
            helper.setAttribute("data-kh-running", "0");
          }
        },
      });

      parent.insertBefore(helper, statusBtn);
    }

    const ctx = getEntityStatusContext();
    const config = STATUS_HELPER_CONFIG[ctx.mode]?.[ctx.state];
    helper.classList.remove("kh-mo-done", "kh-so-packall");
    helper.style.display = "none";
    helper.title = "";

    if (config && !config.hidden) {
      helper.textContent = config.text;
      helper.classList.add(config.className);
      helper.title = config.title || "";
      helper.style.display = "";
    }
  };

  kh.features = kh.features || {};
  kh.features.statusHelper = {
    getEntityStatusContext,
    openMenuAndSelect,
    runMoSetDoneFlow,
    runSoPackAllFlow,
    ensureEntityStatusHelper,
  };
})();
