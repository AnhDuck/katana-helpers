(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants, utils, storage } = kh;

  const SUPPLIER_SELECTORS = [
    'input[name="supplierId"]',
    'input[name="supplier"]',
    'input[data-testid*="supplier" i]',
    'input[placeholder*="Supplier" i]',
    'input[aria-label*="Supplier" i]',
  ];

  let lastInput = null;

  const isPurchaseOrderPage = () => window.location.pathname.startsWith("/purchaseorder/");

  const findSupplierInput = () => {
    for (const selector of SUPPLIER_SELECTORS) {
      const input = document.querySelector(selector);
      if (input) return input;
    }

    const labels = [...document.querySelectorAll("label")];
    for (const label of labels) {
      if (!utils.normText(label.textContent).includes("supplier")) continue;
      if (label.htmlFor) {
        const target = document.getElementById(label.htmlFor);
        if (target) return target;
      }
      const container = label.closest("div");
      const nestedInput = container?.querySelector("input, textarea");
      if (nestedInput) return nestedInput;
    }

    return null;
  };

  const removeSupplierButton = () => {
    const wrap = document.getElementById(constants.IDS.WRAP_PO_SUPPLIER);
    if (wrap) wrap.remove();
  };

  const handleSupplierInput = () => {
    ensureSupplierShortcutButton();
  };

  const wireSupplierInput = (input) => {
    if (lastInput === input) return;
    if (lastInput) {
      lastInput.removeEventListener("input", handleSupplierInput);
      lastInput.removeEventListener("change", handleSupplierInput);
    }
    lastInput = input;
    input.addEventListener("input", handleSupplierInput);
    input.addEventListener("change", handleSupplierInput);
  };

  const getSupplierState = (supplierName) => {
    const trimmed = (supplierName || "").trim();
    const key = storage.normalizeSupplierName(trimmed);
    if (!key) return null;
    const map = storage.readSupplierButtons();
    const stored = map[key] || {};
    const label = (stored.label || trimmed).trim() || "Supplier";
    const url = (stored.url || "").trim();
    const color = (stored.color || constants.CONFIG.PO_SUPPLIER_BUTTON_BG).trim();
    return {
      key,
      name: trimmed,
      label,
      url,
      color,
    };
  };

  const ensureEditModal = () => {
    let modal = document.getElementById(constants.IDS.PO_SUPPLIER_MODAL);
    if (!modal) {
      modal = document.createElement("div");
      modal.id = constants.IDS.PO_SUPPLIER_MODAL;
      modal.className = constants.CLASSES.PO_SUPPLIER_MODAL;
      document.body.appendChild(modal);
    }
    return modal;
  };

  const closeEditModal = (modal) => {
    if (!modal) return;
    modal.removeAttribute("data-open");
  };

  const openEditModal = (state, { onSave, onPreview } = {}) => {
    const modal = ensureEditModal();
    modal.innerHTML = "";

    const content = document.createElement("div");
    content.className = constants.CLASSES.PO_SUPPLIER_MODAL_CONTENT;

    const title = document.createElement("h3");
    title.textContent = `Edit supplier shortcut`;

    const labelRow = document.createElement("label");
    labelRow.className = constants.CLASSES.PO_SUPPLIER_MODAL_ROW;
    labelRow.textContent = "Button label";
    const labelInput = document.createElement("input");
    labelInput.type = "text";
    labelInput.value = state.label;
    labelRow.appendChild(labelInput);

    const urlRow = document.createElement("label");
    urlRow.className = constants.CLASSES.PO_SUPPLIER_MODAL_ROW;
    urlRow.textContent = "Supplier URL";
    const urlInput = document.createElement("input");
    urlInput.type = "text";
    urlInput.placeholder = "https://";
    urlInput.value = state.url;
    urlRow.appendChild(urlInput);

    const colorRow = document.createElement("label");
    colorRow.className = constants.CLASSES.PO_SUPPLIER_MODAL_ROW;
    colorRow.textContent = "Button color";
    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = state.color;
    colorRow.appendChild(colorInput);

    const buildNextState = () => ({
      ...state,
      label: labelInput.value.trim() || state.name,
      url: urlInput.value.trim(),
      color: colorInput.value || constants.CONFIG.PO_SUPPLIER_BUTTON_BG,
    });

    const handlePreviewUpdate = () => {
      if (!onPreview) return;
      onPreview(buildNextState());
    };

    const actions = document.createElement("div");
    actions.className = constants.CLASSES.PO_SUPPLIER_MODAL_ACTIONS;
    const cancelBtn = utils.createButton({
      text: "Cancel",
      onClick: (event) => {
        event.preventDefault();
        closeEditModal(modal);
      },
    });
    const saveBtn = utils.createButton({
      text: "Save",
      onClick: (event) => {
        event.preventDefault();
        const nextState = buildNextState();
        storage.upsertSupplierButton(state.name, {
          label: nextState.label,
          url: nextState.url,
          color: nextState.color,
        });
        closeEditModal(modal);
        if (onSave) onSave(nextState);
      },
    });
    actions.append(cancelBtn, saveBtn);

    content.append(title, labelRow, urlRow, colorRow, actions);
    modal.appendChild(content);

    labelInput.addEventListener("input", handlePreviewUpdate);
    urlInput.addEventListener("input", handlePreviewUpdate);
    colorInput.addEventListener("input", handlePreviewUpdate);

    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeEditModal(modal);
    }, { once: true });

    modal.setAttribute("data-open", "1");
  };

  const applySupplierState = (btn, state) => {
    if (!btn || !state) return;
    btn.textContent = state.label;
    btn.title = state.url
      ? "Open supplier order page in new window"
      : "Set a supplier URL to enable";
    btn.style.setProperty("--kh-supplier-btn-bg", state.color);
    btn.style.setProperty("--kh-supplier-btn-color", constants.CONFIG.PO_SUPPLIER_BUTTON_TEXT);
    if (state.url) {
      btn.removeAttribute("data-kh-disabled");
    } else {
      btn.setAttribute("data-kh-disabled", "1");
    }
    btn.setAttribute("data-supplier-key", state.key);
    btn.setAttribute("data-supplier-name", state.name);
  };

  const ensureSupplierShortcutButton = () => {
    if (!isPurchaseOrderPage()) {
      removeSupplierButton();
      if (lastInput) {
        lastInput.removeEventListener("input", handleSupplierInput);
        lastInput.removeEventListener("change", handleSupplierInput);
        lastInput = null;
      }
      return;
    }

    kh.ui.styles.ensureStyles();

    const statusBtn = document.querySelector(constants.SELECTORS.ENTITY_STATUS_BTN);
    if (!statusBtn) {
      removeSupplierButton();
      return;
    }

    const parent = statusBtn.parentElement;
    if (!parent) {
      removeSupplierButton();
      return;
    }

    const supplierInput = findSupplierInput();
    if (!supplierInput) {
      removeSupplierButton();
      if (lastInput) {
        lastInput.removeEventListener("input", handleSupplierInput);
        lastInput.removeEventListener("change", handleSupplierInput);
        lastInput = null;
      }
      return;
    }

    wireSupplierInput(supplierInput);

    const supplierValue = supplierInput.value || "";
    const state = getSupplierState(supplierValue);
    if (!state) {
      removeSupplierButton();
      return;
    }

    let wrap = document.getElementById(constants.IDS.WRAP_PO_SUPPLIER);
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = constants.IDS.WRAP_PO_SUPPLIER;
      wrap.className = constants.CLASSES.PO_SUPPLIER_WRAP;
      parent.insertBefore(wrap, statusBtn);
    }

    let btn = document.getElementById(constants.IDS.BTN_PO_SUPPLIER);
    if (!btn) {
      btn = utils.createButton({
        id: constants.IDS.BTN_PO_SUPPLIER,
        className: constants.CLASSES.PO_SUPPLIER_BTN,
        onClick: (event) => {
          event.preventDefault();
          event.stopPropagation();
          const currentSupplier = btn.getAttribute("data-supplier-name") || "";
          const currentState = getSupplierState(currentSupplier);
          if (!currentState) return;
          if (!currentState.url) {
            openEditModal(currentState, {
              onSave: ensureSupplierShortcutButton,
              onPreview: (nextState) => applySupplierState(btn, nextState),
            });
            return;
          }
          window.open(currentState.url, "_blank", "noopener,noreferrer");
          kh.ui.hud.incrementCounters(3);
        },
      });
      wrap.appendChild(btn);
    }

    let editBtn = document.getElementById(constants.IDS.BTN_PO_SUPPLIER_EDIT);
    if (!editBtn) {
      editBtn = utils.createButton({
        id: constants.IDS.BTN_PO_SUPPLIER_EDIT,
        className: constants.CLASSES.PO_SUPPLIER_EDIT,
        text: "✎",
        title: "Edit supplier shortcut",
        onClick: (event) => {
          event.preventDefault();
          event.stopPropagation();
          const currentSupplier = btn.getAttribute("data-supplier-name") || "";
          const currentState = getSupplierState(currentSupplier);
          if (!currentState) return;
          openEditModal(currentState, {
            onSave: ensureSupplierShortcutButton,
            onPreview: (nextState) => applySupplierState(btn, nextState),
          });
        },
      });
      wrap.appendChild(editBtn);
    }

    applySupplierState(btn, state);
  };

  kh.features = kh.features || {};
  kh.features.poSupplierShortcut = { ensureSupplierShortcutButton };
})();
