(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants, utils, storage } = kh;

  const exTimers = new WeakMap();
  let manualUltraOriginUrl = null;

  const getClosestAgRow = (el) => el?.closest?.(".ag-row") || null;

  const setExButtonUltraVisual = (btn, on) => {
    if (on) btn.classList.add("kh-ultra");
    else btn.classList.remove("kh-ultra");
  };

  const setRunning = (btn, on) => {
    btn.setAttribute("data-kh-running", on ? "1" : "0");
  };

  const runSoExX1Flow = async (rowEl) => {
    const actionsBtn = rowEl.querySelector(constants.SELECTORS.SO_ROW_ACTIONS_BTN);
    if (!actionsBtn) return { ok: false };

    const makeInBatch = await kh.features.statusHelper.openMenuAndSelect({
      menuButton: actionsBtn,
      itemSelector: constants.SELECTORS.SO_MENU_MAKE_IN_BATCH,
      timeoutMs: 2000,
    });
    if (!makeInBatch) return { ok: false };

    let qtyInput;
    try {
      qtyInput = await utils.waitForSelector(constants.SELECTORS.BATCH_QTY_INPUT, 3000);
    } catch {
      return { ok: false };
    }

    utils.dispatchRealClick(qtyInput);
    utils.setReactInputValue(qtyInput, "1");

    try {
      await utils.waitForCondition(() => {
        const value = (document.querySelector(constants.SELECTORS.BATCH_QTY_INPUT)?.value || "").trim();
        return value === "1";
      }, 1500, 50);
    } catch {
      return { ok: false };
    }

    let createAndOpen;
    try {
      createAndOpen = await utils.waitForSelector(constants.SELECTORS.CREATE_AND_OPEN, 2000);
    } catch {
      return { ok: false };
    }

    const originUrl = window.location.href;
    const prevUrl = window.location.href;
    storage.storeReturnUrl(originUrl);
    utils.dispatchRealClick(createAndOpen);

    try {
      await utils.waitForCondition(() => window.location.href !== prevUrl, 8000, 80);
      return { ok: true, originUrl };
    } catch {
      try {
        await utils.waitForCondition(() => window.location.pathname.includes("manufacturing"), 5000, 100);
        return { ok: true, originUrl };
      } catch {
        return { ok: false };
      }
    }
  };

  const findMoDialog = () => {
    const content = document.querySelector(constants.SELECTORS.MO_DIALOG_CONTENT);
    return content?.closest?.(constants.SELECTORS.MO_DIALOG) || null;
  };

  const clearManualUltraOrigin = () => {
    manualUltraOriginUrl = null;
  };

  const waitForMoDialogReady = async () => {
    await utils.waitForSelector(constants.SELECTORS.BATCH_QTY_INPUT, 5000);
    await utils.waitForSelector(constants.SELECTORS.CREATE_AND_OPEN, 5000);
    return findMoDialog();
  };

  const runSoOpenMakeToStockDialogFlow = async (rowEl) => {
    const actionsBtn = rowEl.querySelector(constants.SELECTORS.SO_ROW_ACTIONS_BTN);
    if (!actionsBtn) return { ok: false, reason: "no_actions_button" };

    const makeInBatch = await kh.features.statusHelper.openMenuAndSelect({
      menuButton: actionsBtn,
      itemSelector: constants.SELECTORS.SO_MENU_MAKE_IN_BATCH,
      timeoutMs: 2000,
    });
    if (!makeInBatch) return { ok: false, reason: "no_make_to_stock_item" };

    try {
      const dialog = await waitForMoDialogReady();
      if (!dialog) return { ok: false, reason: "no_mo_dialog" };
      return { ok: true, dialog };
    } catch {
      return { ok: false, reason: "dialog_not_ready" };
    }
  };

  const setCreateUltraRunning = (btn, on) => {
    btn.setAttribute("data-kh-running", on ? "1" : "0");
    btn.disabled = !!on;
    btn.textContent = on ? "Creating..." : "Create + Ultra";
  };

  const runManualUltraCreateFlow = async (btn) => {
    const originUrl = manualUltraOriginUrl || window.location.href;
    const createAndOpen = findMoDialog()?.querySelector(constants.SELECTORS.CREATE_AND_OPEN);
    if (!createAndOpen) {
      kh.ui.toast.showToast("Create + Ultra stopped: couldn't find Katana's Create and view button.", 5200);
      return;
    }

    setCreateUltraRunning(btn, true);

    const prevUrl = window.location.href;
    storage.storeReturnUrl(originUrl);
    utils.dispatchRealClick(createAndOpen);

    try {
      await utils.waitForCondition(() => window.location.href !== prevUrl, 8000, 80);
    } catch {
      try {
        await utils.waitForCondition(() => window.location.pathname.includes("manufacturing"), 5000, 100);
      } catch {
        kh.ui.toast.showToast("Create + Ultra stopped: MO did not open. Finish manually.", 5600);
        setCreateUltraRunning(btn, false);
        return;
      }
    }

    clearManualUltraOrigin();

    try {
      const ultraRes = await kh.features.ultraEx.runUltraAfterMoOpen(originUrl);
      if (ultraRes.ok && ultraRes.ultraDone) {
        kh.ui.hud.incrementCounters(constants.CONFIG.SAVED_CLICKS_ULTRA_EXTRA);
      }
    } catch (err) {
      utils.log("Create + Ultra failed:", err);
      kh.ui.toast.showToast("Create + Ultra stopped unexpectedly. Finish manually.", 5600);
    }
  };

  const bindNativeDialogButtonClear = (dialog) => {
    const selectors = [
      constants.SELECTORS.CREATE_AND_OPEN,
      'button[data-testid="cancelButton"]',
      'button[data-testid="createAndCloseOrderButton"]',
    ];

    selectors.forEach((selector) => {
      const btn = dialog.querySelector(selector);
      if (!btn || btn.dataset.khManualUltraClearBound === "1") return;
      btn.dataset.khManualUltraClearBound = "1";
      btn.addEventListener("click", clearManualUltraOrigin, { capture: true, once: true });
    });
  };

  const ensureCreateUltraButton = () => {
    if (!manualUltraOriginUrl) return;

    const dialog = findMoDialog();
    if (!dialog) return;

    const createAndOpen = dialog.querySelector(constants.SELECTORS.CREATE_AND_OPEN);
    if (!createAndOpen) return;

    const actions = createAndOpen.parentElement;
    if (!actions) return;

    bindNativeDialogButtonClear(dialog);

    let btn = dialog.querySelector(`#${constants.IDS.BTN_CREATE_ULTRA_MO}`);
    if (!btn) {
      btn = utils.createButton({
        id: constants.IDS.BTN_CREATE_ULTRA_MO,
        text: "Create + Ultra",
        title: "Create and view this MO, verify ingredients, mark Done, and return to the sales order.",
        onClick: (event) => {
          event.preventDefault();
          event.stopPropagation();

          if (btn.getAttribute("data-kh-running") === "1") return;
          runManualUltraCreateFlow(btn);
        },
      });
    }

    if (btn.parentElement !== actions) {
      actions.appendChild(btn);
    }
  };

  const runSoManualUltraDialogFlow = async (rowEl) => {
    manualUltraOriginUrl = window.location.href;

    const res = await runSoOpenMakeToStockDialogFlow(rowEl);
    if (!res.ok) {
      manualUltraOriginUrl = null;
      kh.ui.toast.showToast(`EX stopped: couldn't open Make to stock (${res.reason}).`, 5200);
      return { ok: false };
    }

    ensureCreateUltraButton();
    kh.ui.hud.incrementCounters(constants.CONFIG.SAVED_CLICKS_EX_MANUAL_DIALOG);
    kh.ui.toast.showToast("EX: enter quantity, then click Create + Ultra.", 3600);
    return { ok: true };
  };

  const ensureSoExButtons = () => {
    kh.ui.styles.ensureStyles();
    ensureCreateUltraButton();

    const actionButtons = document.querySelectorAll(constants.SELECTORS.SO_ROW_ACTIONS_BTN);
    if (!actionButtons.length) return;

    actionButtons.forEach((plusBtn) => {
      const container = plusBtn.parentElement;
      if (!container) return;

      if (container.querySelector(`button.${constants.CLASSES.BTN_SO_EX}`)) return;

      const btn = utils.createButton({
        className: constants.CLASSES.BTN_SO_EX,
        text: "EX",
        title:
          `EX (single-click): Open Make to stock so you can choose quantity, then use Create + Ultra.\n` +
          `Ultra EX (double-click within ${constants.CONFIG.DOUBLE_CLICK_WINDOW_MS}ms): Make qty=1, verify ingredients, mark Done, and return here.`,
        onClick: (event) => {
          event.preventDefault();
          event.stopPropagation();

          if (btn.getAttribute("data-kh-running") === "1") return;

          const existingTimer = exTimers.get(btn);

          if (existingTimer) {
            clearTimeout(existingTimer);
            exTimers.delete(btn);

            (async () => {
              setRunning(btn, true);
              setExButtonUltraVisual(btn, true);

              const rowEl = getClosestAgRow(btn);
              if (!rowEl) {
                setExButtonUltraVisual(btn, false);
                setRunning(btn, false);
                return;
              }

              const exRes = await runSoExX1Flow(rowEl);
              if (!exRes.ok) {
                setExButtonUltraVisual(btn, false);
                setRunning(btn, false);
                return;
              }

              kh.ui.hud.incrementCounters(constants.CONFIG.SAVED_CLICKS_EX_NORMAL);

              const ultraRes = await kh.features.ultraEx.runUltraAfterMoOpen(exRes.originUrl);
              if (ultraRes.ok && ultraRes.ultraDone) {
                kh.ui.hud.incrementCounters(constants.CONFIG.SAVED_CLICKS_ULTRA_EXTRA);
              }

              setExButtonUltraVisual(btn, false);
              setRunning(btn, false);
            })();

            return;
          }

          const timer = setTimeout(() => {
            exTimers.delete(btn);

            (async () => {
              setRunning(btn, true);
              setExButtonUltraVisual(btn, false);

              try {
                const rowEl = getClosestAgRow(btn);
                if (!rowEl) return;

                await runSoManualUltraDialogFlow(rowEl);
              } finally {
                setRunning(btn, false);
              }
            })();
          }, constants.CONFIG.DOUBLE_CLICK_WINDOW_MS);

          exTimers.set(btn, timer);
        },
      });

      container.insertBefore(btn, plusBtn);
    });
  };

  kh.features = kh.features || {};
  kh.features.soEx = { ensureSoExButtons, runSoExX1Flow, runSoManualUltraDialogFlow };
})();
