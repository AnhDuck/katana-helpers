(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants, utils } = kh;

  const SUPPLIER_CONFIGS = {
    aliexpress: {
      text: "AliExpress ↗",
      title: "Open supplier order page in new window",
      url: "https://www.aliexpress.com/p/order/index.html",
      className: constants.CLASSES.PO_SUPPLIER_ALI,
    },
    grainger: {
      text: "Grainger ↗",
      title: "Open supplier order page in new window",
      url: "https://www.grainger.ca/en/my-account/list/listDetails/8827617706685",
      className: constants.CLASSES.PO_SUPPLIER_GRAINGER,
    },
  };

  const SUPPLIER_SELECTORS = [
    'input[name="supplierId"]',
    'input[name="supplier"]',
    'input[data-testid*="supplier" i]',
    'input[placeholder*="Supplier" i]',
    'input[aria-label*="Supplier" i]',
  ];

  let lastSupplierKey = null;
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

  const getSupplierKey = (value) => {
    const normalized = utils.normText(value);
    if (!normalized) return null;
    if (normalized.includes("aliexpress")) return "aliexpress";
    if (normalized.includes("grainger")) return "grainger";
    return null;
  };

  const removeSupplierButton = () => {
    const existing = document.getElementById(constants.IDS.BTN_PO_SUPPLIER);
    if (existing) existing.remove();
    lastSupplierKey = null;
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
    const supplierKey = getSupplierKey(supplierValue);
    if (!supplierKey) {
      removeSupplierButton();
      return;
    }

    const config = SUPPLIER_CONFIGS[supplierKey];
    if (!config) {
      removeSupplierButton();
      return;
    }

    let btn = document.getElementById(constants.IDS.BTN_PO_SUPPLIER);
    if (!btn) {
      btn = utils.createButton({
        id: constants.IDS.BTN_PO_SUPPLIER,
        className: constants.CLASSES.PO_SUPPLIER_BTN,
        onClick: (event) => {
          event.preventDefault();
          event.stopPropagation();
          const currentKey = btn.getAttribute("data-supplier-key") || supplierKey;
          const currentConfig = SUPPLIER_CONFIGS[currentKey];
          if (currentConfig) {
            window.open(currentConfig.url, "_blank", "noopener,noreferrer");
            kh.ui.hud.incrementCounters(3);
          }
        },
      });
      parent.insertBefore(btn, statusBtn);
    }

    if (lastSupplierKey !== supplierKey) {
      btn.textContent = config.text;
      btn.title = config.title;
      btn.classList.remove(constants.CLASSES.PO_SUPPLIER_ALI, constants.CLASSES.PO_SUPPLIER_GRAINGER);
      btn.classList.add(config.className);
      btn.setAttribute("data-supplier-key", supplierKey);
      lastSupplierKey = supplierKey;
    }
  };

  kh.features = kh.features || {};
  kh.features.poSupplierShortcut = { ensureSupplierShortcutButton };
})();
