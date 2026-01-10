(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants } = kh;

  const ensureSimplyPrintNavButton = () => {
    kh.ui.styles.ensureStyles();

    const itemsBtn = document.querySelector(constants.SELECTORS.NAV_ITEMS_BTN);
    if (!itemsBtn) return;

    if (document.getElementById(constants.IDS.BTN_SIMPLYPRINT_NAV)) return;

    const parent = itemsBtn.parentElement;
    if (!parent) return;

    const btn = document.createElement("a");
    btn.id = constants.IDS.BTN_SIMPLYPRINT_NAV;
    btn.href = constants.URLS.SIMPLYPRINT_PANEL;
    btn.className = `${itemsBtn.className} ${constants.CLASSES.SIMPLYPRINT_NAV}`.trim();
    btn.setAttribute("role", "button");
    btn.setAttribute("aria-disabled", "false");
    btn.title = "Open SimplyPrint in a new window";

    const itemsLabel = itemsBtn.querySelector(".MuiButton-label");
    const labelClass = itemsLabel?.className || "";

    const label = document.createElement("span");
    label.className = `${labelClass} kh-simplyprint-label`.trim();

    const icon = document.createElement("img");
    icon.src = constants.URLS.SIMPLYPRINT_ICON;
    icon.alt = "SimplyPrint";
    icon.className = "kh-simplyprint-icon";

    const text = document.createElement("span");
    text.textContent = "SimplyPrint ↗";

    label.appendChild(icon);
    label.appendChild(text);

    btn.appendChild(label);

    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const win = window.open(constants.URLS.SIMPLYPRINT_PANEL, "_blank", "noopener,noreferrer");
      win?.focus();
      kh.ui.hud.incrementCounters(3);
    }, { capture: true });

    parent.insertBefore(btn, itemsBtn.nextSibling);
  };

  kh.features = kh.features || {};
  kh.features.simplyPrintNav = { ensureSimplyPrintNavButton };
})();
