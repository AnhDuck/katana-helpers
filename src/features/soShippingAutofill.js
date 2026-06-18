(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants, storage, utils } = kh;

  const state = {
    intervalId: 0,
    lastReference: "",
    lastSeenAt: 0,
    lastAppliedAmount: "",
    lastAppliedReference: "",
    isEditing: false,
  };

  const isSoPage = () => window.location.pathname.startsWith("/salesorder");

  const normalizeReference = (raw) => String(raw || "").replace(/\s+/g, " ").trim();

  const extractShippingCost = (rawReference) => {
    const reference = normalizeReference(rawReference);
    if (!reference) return null;

    const match = reference.match(/\bshipping\s*(?:cost|fee|charge)\b\s*[:#=-]?\s*\$?\s*([0-9]+(?:[.,][0-9]{1,2})?)/i);
    if (!match) return null;

    const amount = Number.parseFloat(match[1].replace(",", "."));
    if (!Number.isFinite(amount) || amount < 0) return null;
    return amount.toFixed(2).replace(/\.00$/, "");
  };

  const parseMoneyValue = (text) => {
    const match = String(text || "").replace(/\u00a0/g, " ").match(/-?[0-9]+(?:[.,][0-9]+)?/);
    if (!match) return null;
    const value = Number.parseFloat(match[0].replace(",", "."));
    return Number.isFinite(value) ? value : null;
  };

  const getReferenceInput = () => document.querySelector(constants.SELECTORS.SO_CUSTOMER_REFERENCE);
  const getShippingCostCell = () => document.querySelector(constants.SELECTORS.SO_SHIPPING_COST_CELL);

  const shouldApplyToCell = (cell, amount, reference) => {
    const current = parseMoneyValue(cell?.textContent || "");
    const next = Number.parseFloat(amount);
    if (!Number.isFinite(next)) return false;
    if (current == null || current === 0) return true;
    if (Math.abs(current - next) < 0.005) return false;
    return state.lastAppliedReference && state.lastAppliedReference !== reference && state.lastAppliedAmount && Math.abs(current - Number.parseFloat(state.lastAppliedAmount)) < 0.005;
  };

  const findEditorInput = () => {
    const grid = document.querySelector(constants.SELECTORS.SO_SHIPPING_GRID);
    const candidates = [
      ...(grid ? Array.from(grid.querySelectorAll('input:not([type="checkbox"]), textarea')) : []),
      ...Array.from(document.querySelectorAll('.ag-popup-editor input:not([type="checkbox"]), .ag-cell-inline-editing input:not([type="checkbox"])')),
    ];
    return candidates.find((input) => input.offsetParent !== null && !input.disabled && !input.readOnly) || null;
  };

  const applyShippingCost = async (cell, amount, reference) => {
    if (state.isEditing) return;
    state.isEditing = true;
    try {
      utils.dispatchRealClick(cell);
      cell.dispatchEvent(new MouseEvent("dblclick", { bubbles: true, cancelable: true, view: window }));

      const input = await utils.waitForCondition(findEditorInput, 1200, 40);
      utils.setReactInputValue(input, amount);
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true, cancelable: true }));
      input.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", code: "Enter", bubbles: true, cancelable: true }));
      input.blur();

      state.lastAppliedAmount = amount;
      state.lastAppliedReference = reference;
      cell.dataset.khShippingAutofillValue = amount;
      kh.ui.toast.showToast(`Shipping fee filled: ${amount}`, 2200);
    } catch (error) {
      utils.log("Shipping autofill failed", error);
    } finally {
      state.isEditing = false;
    }
  };

  const resetState = () => {
    state.lastReference = "";
    state.lastSeenAt = 0;
    state.lastAppliedAmount = "";
    state.lastAppliedReference = "";
    state.isEditing = false;
  };

  const tick = () => {
    if (!isSoPage()) {
      resetState();
      return;
    }
    if (!storage.readSoShippingAutofillEnabled()) return;
    if (state.isEditing) return;

    const referenceInput = getReferenceInput();
    const costCell = getShippingCostCell();
    if (!referenceInput || !costCell) return;
    if (document.activeElement === referenceInput) return;

    const reference = normalizeReference(referenceInput.value);
    const now = Date.now();
    if (reference !== state.lastReference) {
      state.lastReference = reference;
      state.lastSeenAt = now;
    }

    if (now - state.lastSeenAt < constants.CONFIG.SO_SHIPPING_AUTOFILL_SETTLE_MS) return;

    const amount = extractShippingCost(reference);
    if (!amount) return;
    if (!shouldApplyToCell(costCell, amount, reference)) return;

    applyShippingCost(costCell, amount, reference);
  };

  const start = () => {
    if (state.intervalId) return;
    state.intervalId = window.setInterval(tick, constants.CONFIG.SO_SHIPPING_AUTOFILL_POLL_MS);
  };

  const handleSettingChange = () => {
    if (!storage.readSoShippingAutofillEnabled()) resetState();
    else state.lastSeenAt = 0;
  };

  const ensureSoShippingAutofill = () => {
    start();
    tick();
  };

  kh.features = kh.features || {};
  kh.features.soShippingAutofill = {
    ensureSoShippingAutofill,
    handleSettingChange,
    extractShippingCost,
  };
})();
