(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants, storage, utils } = kh;

  const state = {
    intervalId: 0,
    productInput: null,
    qtyInput: null,
    lastSeenLabel: "",
    lastSeenAt: 0,
    lastHeaderMismatchAt: 0,
    lastAppliedLabel: "",
    lastAppliedQty: "",
    manualOverrideLabel: "",
    internalWriteDepth: 0,
  };

  const isMoPage = () => window.location.pathname.startsWith("/manufacturingorder");

  const getProductInput = () => document.querySelector(constants.SELECTORS.MO_PRODUCT_INPUT);
  const getQtyInput = () => document.querySelector(constants.SELECTORS.MO_PLANNED_QTY_INPUT);
  const getHeaderName = () => document.querySelector(constants.SELECTORS.MO_HEADER_NAME);

  const normalizeProductLabel = (raw) => {
    const text = String(raw || "").replace(/\s+/g, " ").trim();
    return text;
  };

  const extractBatchQty = (rawLabel) => {
    const label = normalizeProductLabel(rawLabel);
    if (!label) return null;

    const namePortion = label.includes("]") ? label.split("]").slice(1).join("]").trim() : label;

    const stdMatch = namePortion.match(/(^|[\s(/-])(\d+)\s*pcs-std\b/i);
    if (stdMatch) return parseInt(stdMatch[2], 10);

    const leadingQtyMatch = namePortion.match(/^(\d+)\s+/);
    if (leadingQtyMatch) return parseInt(leadingQtyMatch[1], 10);

    return null;
  };

  const getCurrentSelectedLabel = () => normalizeProductLabel(getProductInput()?.value || "");

  const markManualOverride = () => {
    if (state.internalWriteDepth > 0) return;
    const label = getCurrentSelectedLabel();
    if (!label) return;
    state.manualOverrideLabel = label;
  };

  const ensureQtyListeners = (qtyInput) => {
    if (!qtyInput || qtyInput.dataset.khMoQtyAutofillBound === "1") return;
    qtyInput.dataset.khMoQtyAutofillBound = "1";
    qtyInput.addEventListener("input", markManualOverride, { capture: true });
    qtyInput.addEventListener("change", markManualOverride, { capture: true });
  };

  const resetAutofillState = () => {
    state.lastSeenLabel = "";
    state.lastSeenAt = 0;
    state.lastHeaderMismatchAt = 0;
    state.lastAppliedLabel = "";
    state.lastAppliedQty = "";
    state.manualOverrideLabel = "";
  };

  const shouldApplyToValue = (currentValue, nextQty) => {
    const nextText = String(nextQty);
    const current = String(currentValue || "").trim();

    if (!current) return true;
    if (current === nextText) return false;
    if (current === "1") return true;
    if (state.lastAppliedQty && current === state.lastAppliedQty) return true;
    return false;
  };

  const applyQty = (qtyInput, qty, label) => {
    const nextText = String(qty);
    state.internalWriteDepth += 1;
    try {
      utils.setReactInputValue(qtyInput, nextText);
    } finally {
      state.internalWriteDepth = Math.max(0, state.internalWriteDepth - 1);
    }
    state.lastAppliedLabel = label;
    state.lastAppliedQty = nextText;
    qtyInput.dataset.khMoQtyAutofillLabel = label;
    qtyInput.dataset.khMoQtyAutofillValue = nextText;
  };

  const tick = () => {
    if (!isMoPage()) {
      resetAutofillState();
      return;
    }
    if (!storage.readMoQtyAutofillEnabled()) return;

    const productInput = getProductInput();
    const qtyInput = getQtyInput();
    if (!productInput || !qtyInput) return;

    state.productInput = productInput;
    state.qtyInput = qtyInput;
    ensureQtyListeners(qtyInput);

    const label = normalizeProductLabel(productInput.value);
    const now = Date.now();

    if (label !== state.lastSeenLabel) {
      state.lastSeenLabel = label;
      state.lastSeenAt = now;
      state.lastHeaderMismatchAt = 0;
      if (state.manualOverrideLabel && state.manualOverrideLabel !== label) {
        state.manualOverrideLabel = "";
      }
    }

    const batchQty = extractBatchQty(label);
    if (!batchQty || !Number.isFinite(batchQty) || batchQty <= 0) return;
    if (now - state.lastSeenAt < constants.CONFIG.MO_QTY_AUTOFILL_SETTLE_MS) return;
    if (document.activeElement === qtyInput) return;
    if (state.manualOverrideLabel === label) return;

    const headerText = normalizeProductLabel(getHeaderName()?.textContent || "");
    if (headerText && !utils.normText(headerText).includes(utils.normText(label))) {
      if (!state.lastHeaderMismatchAt) state.lastHeaderMismatchAt = now;
      if (now - state.lastHeaderMismatchAt < constants.CONFIG.MO_QTY_AUTOFILL_HEADER_WAIT_MS) return;
    } else {
      state.lastHeaderMismatchAt = 0;
    }

    const currentValue = String(qtyInput.value || "").trim();
    if (!shouldApplyToValue(currentValue, batchQty)) return;

    applyQty(qtyInput, batchQty, label);
  };

  const start = () => {
    if (state.intervalId) return;
    state.intervalId = window.setInterval(tick, constants.CONFIG.MO_QTY_AUTOFILL_POLL_MS);
  };

  const handleSettingChange = () => {
    if (!storage.readMoQtyAutofillEnabled()) {
      resetAutofillState();
      return;
    }
    state.lastSeenAt = 0;
    state.lastHeaderMismatchAt = 0;
  };

  const ensureMoQuantityAutofill = () => {
    start();
    tick();
  };

  kh.features = kh.features || {};
  kh.features.moQuantityAutofill = {
    ensureMoQuantityAutofill,
    handleSettingChange,
    extractBatchQty,
  };
})();
