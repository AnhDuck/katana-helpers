(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants, utils, storage } = kh;

  const exTimers = new WeakMap();
  let manualUltraOriginUrl = null;
  let manualIngredientsPreview = null;

  const getClosestAgRow = (el) => el?.closest?.(".ag-row") || null;

  const setExButtonUltraVisual = (btn, on) => {
    if (on) btn.classList.add("kh-ultra");
    else btn.classList.remove("kh-ultra");
  };

  const setRunning = (btn, on) => {
    btn.setAttribute("data-kh-running", on ? "1" : "0");
  };

  const isIngredientsPreviewEnabled = () => storage.readSoIngredientsPreviewEnabled?.() !== false;

  const findIngredientsPopupDialog = () => (
    Array.from(document.querySelectorAll(constants.SELECTORS.SO_INGREDIENTS_POPUP_DIALOG))
      .find((dialog) => utils.normText(dialog.textContent).includes("missing and expected ingredients for"))
    || null
  );

  const closeIngredientsPopupDialog = async () => {
    const dialog = findIngredientsPopupDialog();
    const closeBtn = dialog?.querySelector(constants.SELECTORS.SO_INGREDIENTS_POPUP_CLOSE);
    if (!closeBtn) return;

    utils.dispatchRealClick(closeBtn);
    await utils.waitForCondition(() => !findIngredientsPopupDialog(), 2000, 80).catch(() => null);
  };

  const waitForIngredientsPopupReady = async () => utils.waitForCondition(() => {
    const dialog = findIngredientsPopupDialog();
    if (!dialog) return false;

    const rows = Array.from(dialog.querySelectorAll(".ag-row"));
    const hasReadableRow = rows.some((row) => {
      const name = utils.normText(row.querySelector('[role="gridcell"][col-id="name"]')?.textContent);
      const missing = utils.normText(row.querySelector('[role="gridcell"][col-id="missingQuantity"]')?.textContent);
      return name && missing;
    });
    if (hasReadableRow) return dialog;

    const text = utils.normText(dialog.textContent);
    if (!text.includes("loading")) return dialog;
    return false;
  }, 5000, 90);

  const parseIngredientsPopup = (dialog) => {
    const product =
      dialog.querySelector('[data-testid="cardHeaderName"]')?.textContent
      || dialog.querySelector('[data-testid="headerNameUNDEFINED"]')?.textContent
      || "";

    const seen = new Set();
    const rows = [];

    Array.from(dialog.querySelectorAll(".ag-row")).forEach((row) => {
      const nameCell = row.querySelector('[role="gridcell"][col-id="name"]');
      const missingCell = row.querySelector('[role="gridcell"][col-id="missingQuantity"]');
      const expectedCell = row.querySelector('[role="gridcell"][col-id="make-buy-button"]');

      const name = (nameCell?.textContent || "").replace(/\s+/g, " ").trim();
      const missing = (missingCell?.textContent || "").replace(/\s+/g, " ").trim();
      if (!name || !missing) return;

      const key = `${name}||${missing}`;
      if (seen.has(key)) return;
      seen.add(key);

      rows.push({
        name,
        missing,
        missingValue: (missingCell?.querySelector('[data-testid="number-renderer-value-missingQuantity"]')?.textContent || "").trim(),
        missingSuffix: (missingCell?.querySelector('[data-testid="number-renderer-suffix-missingQuantity"]')?.textContent || "").trim(),
        canMake: !!expectedCell?.querySelector('button[data-testid="makeOrderButton"]'),
      });
    });

    return {
      key: `${Date.now()}-${rows.length}-${utils.normText(product).slice(0, 32)}`,
      product: product.replace(/\s+/g, " ").trim(),
      rows,
    };
  };

  const readIngredientsPreviewFromRow = async (rowEl) => {
    const ingredientsCell = rowEl?.querySelector(constants.SELECTORS.SO_INGREDIENTS_CELL);
    if (!ingredientsCell) return { ok: false, reason: "no_ingredients_cell" };

    const statusText = utils.normText(ingredientsCell.textContent);
    if (!statusText.includes("not available")) return { ok: false, reason: "ingredients_not_unavailable" };

    try {
      utils.dispatchRealClick(ingredientsCell);
      const dialog = await waitForIngredientsPopupReady();
      const data = parseIngredientsPopup(dialog);
      await closeIngredientsPopupDialog();

      if (!data.rows.length) return { ok: false, reason: "no_missing_rows" };
      return { ok: true, data };
    } catch (err) {
      utils.log("Ingredients preview read failed:", err);
      await closeIngredientsPopupDialog().catch(() => null);
      return { ok: false, reason: "popup_read_failed" };
    }
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

  const findNativeIngredientsMakeMoDialog = () => {
    if (manualUltraOriginUrl) return null;
    const dialog = findMoDialog();
    if (!dialog) return null;
    if (!findIngredientsPopupDialog()) return null;
    return dialog;
  };

  const clearManualUltraOrigin = () => {
    manualUltraOriginUrl = null;
    manualIngredientsPreview = null;
    removeIngredientsPreviewPanel();
  };

  const waitForMoDialogReady = async () => {
    await utils.waitForSelector(constants.SELECTORS.BATCH_QTY_INPUT, 5000);
    await utils.waitForSelector(constants.SELECTORS.CREATE_AND_OPEN, 5000);
    return findMoDialog();
  };

  const positionIngredientsPreviewPanel = (panel, dialog) => {
    const rect = dialog.getBoundingClientRect();
    const margin = 12;
    const gap = 12;
    const rightSpace = window.innerWidth - rect.right - gap - margin;

    let width;
    let left;
    let top;
    let maxHeight;

    if (rightSpace >= 300) {
      width = Math.min(420, rightSpace);
      left = rect.right + gap;
      top = Math.max(margin, rect.top);
      maxHeight = Math.max(220, Math.min(rect.height, window.innerHeight - top - margin));
    } else {
      width = Math.min(Math.max(300, rect.width), window.innerWidth - margin * 2);
      left = Math.max(margin, Math.min(rect.left, window.innerWidth - width - margin));
      top = Math.min(rect.bottom + gap, window.innerHeight - 240);
      top = Math.max(margin, top);
      maxHeight = Math.max(220, window.innerHeight - top - margin);
    }

    panel.style.setProperty("--kh-so-ingredients-left", `${Math.round(left)}px`);
    panel.style.setProperty("--kh-so-ingredients-top", `${Math.round(top)}px`);
    panel.style.setProperty("--kh-so-ingredients-width", `${Math.round(width)}px`);
    panel.style.setProperty("--kh-so-ingredients-max-height", `${Math.round(maxHeight)}px`);
  };

  function removeIngredientsPreviewPanel() {
    document.getElementById(constants.IDS.SO_INGREDIENTS_PANEL)?.remove();
  }

  const renderIngredientsPreviewPanel = (panel, preview) => {
    panel.textContent = "";

    const header = document.createElement("div");
    header.className = "kh-so-ingredients-panel-header";

    const title = document.createElement("h3");
    title.textContent = "Missing ingredients";
    header.appendChild(title);

    if (preview.product) {
      const product = document.createElement("div");
      product.className = "kh-so-ingredients-panel-product";
      product.textContent = preview.product;
      header.appendChild(product);
    }

    const body = document.createElement("div");
    body.className = "kh-so-ingredients-panel-body";

    if (!preview.rows.length) {
      const empty = document.createElement("div");
      empty.className = "kh-so-ingredients-panel-empty";
      empty.textContent = "No missing ingredients found.";
      body.appendChild(empty);
    } else {
      preview.rows.forEach((item) => {
        const row = document.createElement("div");
        row.className = constants.CLASSES.SO_INGREDIENTS_PANEL_ROW;

        const name = document.createElement("div");
        name.className = "kh-so-ingredients-name";
        name.textContent = item.name;

        const missing = document.createElement("div");
        missing.className = "kh-so-ingredients-missing";
        missing.textContent = item.missing;

        row.appendChild(name);
        row.appendChild(missing);
        body.appendChild(row);
      });
    }

    panel.appendChild(header);
    panel.appendChild(body);
    panel.dataset.khPreviewKey = preview.key;
  };

  const ensureIngredientsPreviewPanel = () => {
    if (!isIngredientsPreviewEnabled() || !manualUltraOriginUrl || !manualIngredientsPreview) {
      removeIngredientsPreviewPanel();
      return;
    }

    const dialog = findMoDialog();
    if (!dialog) {
      removeIngredientsPreviewPanel();
      return;
    }

    let panel = document.getElementById(constants.IDS.SO_INGREDIENTS_PANEL);
    if (!panel) {
      panel = document.createElement("aside");
      panel.id = constants.IDS.SO_INGREDIENTS_PANEL;
      panel.className = constants.CLASSES.SO_INGREDIENTS_PANEL;
      panel.setAttribute("aria-label", "Missing ingredients");
      document.documentElement.appendChild(panel);
    }

    if (panel.dataset.khPreviewKey !== manualIngredientsPreview.key) {
      renderIngredientsPreviewPanel(panel, manualIngredientsPreview);
    }

    positionIngredientsPreviewPanel(panel, dialog);
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
    btn.textContent = on ? "Creating..." : (btn.dataset.khIdleText || "Create + Ultra");
  };

  const runCreateAndUltraFlow = async ({ btn, originUrl, label, afterMoOpen }) => {
    const createAndOpen = findMoDialog()?.querySelector(constants.SELECTORS.CREATE_AND_OPEN);
    if (!createAndOpen) {
      kh.ui.toast.showToast(`${label} stopped: couldn't find Katana's Create and view button.`, 5200);
      return;
    }

    setCreateUltraRunning(btn, true);
    removeIngredientsPreviewPanel();

    const prevUrl = window.location.href;
    storage.storeReturnUrl(originUrl);
    utils.dispatchRealClick(createAndOpen);

    try {
      await utils.waitForCondition(() => window.location.href !== prevUrl, 8000, 80);
    } catch {
      try {
        await utils.waitForCondition(() => window.location.pathname.includes("manufacturing"), 5000, 100);
      } catch {
        kh.ui.toast.showToast(`${label} stopped: MO did not open. Finish manually.`, 5600);
        setCreateUltraRunning(btn, false);
        return;
      }
    }

    afterMoOpen?.();

    try {
      const ultraRes = await kh.features.ultraEx.runUltraAfterMoOpen(originUrl);
      if (ultraRes.ok && ultraRes.ultraDone) {
        kh.ui.hud.incrementCounters(constants.CONFIG.SAVED_CLICKS_ULTRA_EXTRA);
      }
    } catch (err) {
      utils.log(`${label} failed:`, err);
      kh.ui.toast.showToast(`${label} stopped unexpectedly. Finish manually.`, 5600);
    }
  };

  const runManualUltraCreateFlow = async (btn) => {
    await runCreateAndUltraFlow({
      btn,
      originUrl: manualUltraOriginUrl || window.location.href,
      label: "Create + Ultra",
      afterMoOpen: clearManualUltraOrigin,
    });
  };

  const runNativeMakeCreateExFlow = async (btn) => {
    await runCreateAndUltraFlow({
      btn,
      originUrl: window.location.href,
      label: "Create + EX",
    });
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
    const dialog = findMoDialog();
    if (!dialog) return;

    const createAndOpen = dialog.querySelector(constants.SELECTORS.CREATE_AND_OPEN);
    if (!createAndOpen) return;

    const actions = createAndOpen.parentElement;
    if (!actions) return;

    if (manualUltraOriginUrl) {
      dialog.querySelector(`#${constants.IDS.BTN_CREATE_EX_MO}`)?.remove();
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
        btn.dataset.khIdleText = "Create + Ultra";
      }

      if (btn.parentElement !== actions) {
        actions.appendChild(btn);
      }
      return;
    }

    dialog.querySelector(`#${constants.IDS.BTN_CREATE_ULTRA_MO}`)?.remove();

    if (!findNativeIngredientsMakeMoDialog()) {
      dialog.querySelector(`#${constants.IDS.BTN_CREATE_EX_MO}`)?.remove();
      return;
    }

    let btn = dialog.querySelector(`#${constants.IDS.BTN_CREATE_EX_MO}`);
    if (!btn) {
      btn = utils.createButton({
        id: constants.IDS.BTN_CREATE_EX_MO,
        text: "Create + EX",
        title: "Create and view this ingredient MO, verify ingredients, mark Done, and return to the sales order.",
        onClick: (event) => {
          event.preventDefault();
          event.stopPropagation();

          if (btn.getAttribute("data-kh-running") === "1") return;
          runNativeMakeCreateExFlow(btn);
        },
      });
      btn.dataset.khIdleText = "Create + EX";
    }

    if (btn.parentElement !== actions) {
      actions.appendChild(btn);
    }
  };

  const runSoManualUltraDialogFlow = async (rowEl) => {
    manualUltraOriginUrl = window.location.href;
    manualIngredientsPreview = null;
    removeIngredientsPreviewPanel();

    if (isIngredientsPreviewEnabled()) {
      const preview = await readIngredientsPreviewFromRow(rowEl);
      if (preview.ok) {
        manualIngredientsPreview = preview.data;
      }
    }

    const res = await runSoOpenMakeToStockDialogFlow(rowEl);
    if (!res.ok) {
      clearManualUltraOrigin();
      kh.ui.toast.showToast(`EX stopped: couldn't open Make to stock (${res.reason}).`, 5200);
      return { ok: false };
    }

    ensureCreateUltraButton();
    ensureIngredientsPreviewPanel();
    kh.ui.hud.incrementCounters(constants.CONFIG.SAVED_CLICKS_EX_MANUAL_DIALOG);
    kh.ui.toast.showToast("EX: enter quantity, then click Create + Ultra.", 3600);
    return { ok: true };
  };

  const ensureSoExButtons = () => {
    kh.ui.styles.ensureStyles();
    ensureCreateUltraButton();
    ensureIngredientsPreviewPanel();

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
  kh.features.soEx = {
    ensureSoExButtons,
    runSoExX1Flow,
    runSoManualUltraDialogFlow,
    readIngredientsPreviewFromRow,
  };
})();
