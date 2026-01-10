(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants, utils, storage } = kh;

  const exTimers = new WeakMap();

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

  const ensureSoExButtons = () => {
    kh.ui.styles.ensureStyles();

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
          `EX (single-click): Make in batch (qty=1) and open the MO.\n` +
          `Ultra EX (double-click within ${constants.CONFIG.DOUBLE_CLICK_WINDOW_MS}ms): Do EX, then if all ingredients are In stock → mark MO Done and return here.`,
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

                const exRes = await runSoExX1Flow(rowEl);
                if (exRes.ok) {
                  kh.ui.hud.incrementCounters(constants.CONFIG.SAVED_CLICKS_EX_NORMAL);
                }
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
  kh.features.soEx = { ensureSoExButtons, runSoExX1Flow };
})();
