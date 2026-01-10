(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants, utils } = kh;

  const getEtsyOrderIdFromHeader = () => {
    const header = document.querySelector(constants.SELECTORS.HEADER_SALES_ORDER);
    const text = header?.textContent || "";
    const match = text.match(/ETSY[\s\-_]+(\d+)/i);
    return match?.[1] || "";
  };

  const ensureEtsyOrderButton = () => {
    kh.ui.styles.ensureStyles();

    const soOrderField = document.querySelector(constants.SELECTORS.SO_ORDER_FIELD);
    if (!soOrderField) return;

    const gridContainer = utils.findMuiGridAncestor(soOrderField, "container");
    if (!gridContainer) return;

    const soOrderItem = utils.findMuiGridAncestor(soOrderField, "item");
    if (!soOrderItem) return;

    const orderInput = soOrderField.querySelector(constants.SELECTORS.SO_ORDER_INPUT);
    const orderValue = orderInput?.value || "";
    const isEtsyOrder = orderValue.toLowerCase().includes("etsy");

    const existingBtn = document.getElementById(constants.IDS.BTN_ETSY_ORDER);
    const existingCell = document.getElementById(constants.IDS.ETSY_ORDER_CELL);
    if (!isEtsyOrder) {
      existingBtn?.remove();
      if (existingCell && !existingCell.querySelector("button")) {
        existingCell.remove();
      }
      return;
    }

    if (existingBtn) return;

    let cell = existingCell;
    if (!cell) {
      cell = document.createElement("div");
      const baseItemClasses = [...soOrderItem.classList]
        .filter((cls) => cls.startsWith("MuiGrid-root") || cls.startsWith("MuiGrid-item"))
        .join(" ");
      cell.id = constants.IDS.ETSY_ORDER_CELL;
      cell.className = `${baseItemClasses} ${constants.CLASSES.ETSY_ORDER_CELL}`.trim();
      gridContainer.insertBefore(cell, soOrderItem.nextSibling);
    }

    const btn = utils.createButton({
      id: constants.IDS.BTN_ETSY_ORDER,
      text: "Etsy",
      title: "Goes to Etsy order page (opens in a new window)",
      onClick: (event) => {
        event.preventDefault();
        event.stopPropagation();
        btn.setAttribute("data-kh-clicked", "1");
        setTimeout(() => btn.removeAttribute("data-kh-clicked"), 220);
        const orderId = getEtsyOrderIdFromHeader();
        const url = orderId ? `${constants.URLS.ETSY_ORDER}?order_id=${orderId}` : constants.URLS.ETSY_ORDER;
        window.open(url, "_blank", "noopener,noreferrer");
      },
    });

    cell.appendChild(btn);
  };

  kh.features = kh.features || {};
  kh.features.etsyButton = { ensureEtsyOrderButton };
})();
