(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};

  kh.constants = {
    DEBUG: false,
    KEYS: {
      TOTAL: "kh_clicks_total",
      BY_DATE: "kh_clicks_by_date",
      RETURN_URL: "kh_return_url",
    },
    IDS: {
      STYLE: "kh-style",
      HUD: "kh-hud",
      TOAST: "kh-toast",
      BTN_CREATE_MO: "kh-create-mo-btn",
      BTN_STATUS_HELPER: "kh-status-helper-btn",
      BTN_MO_DONE_RETURN: "kh-mo-done-return-btn",
      WRAP_MO_DONE_RETURN: "kh-mo-done-return-wrap",
      BTN_ETSY_ORDER: "kh-etsy-order-btn",
      ETSY_ORDER_CELL: "kh-etsy-order-cell",
    },
    CLASSES: {
      LABEL_MO_DONE_RETURN: "kh-mo-done-return-label",
      BTN_SO_EX: "kh-so-ex-btn",
      ETSY_ORDER_CELL: "kh-etsy-order-cell",
    },
    SELECTORS: {
      CREATE_BTN: 'button[data-testid="globalAddButton"]',
      MO_ITEM: 'a[data-testid="globalAddManufacturing"]',
      ENTITY_STATUS_BTN: 'button[data-testid="menuButton-entityStatus"]',
      MO_STATUS_DONE_ITEM: 'li[data-testid="menuListItem-entityStatus-done"]',
      SO_STATUS_PACK_ALL_ITEM: 'li[data-testid="menuListItem-entityStatus-packAll"]',
      DIALOG_TITLE: 'div[role="dialog"] h2',
      DIALOG_CLOSE_BTN: 'div[role="dialog"] button#closeButton',
      SO_ROW_ACTIONS_BTN: 'button[data-testid="soRowActionsMenu-button"]',
      SO_MENU_MAKE_IN_BATCH: 'li[data-testid="soRowActionsMenu-item-makeInBatch"]',
      BATCH_QTY_INPUT: 'input[data-testid="singleMOLayoutQuantityInput"]',
      CREATE_AND_OPEN: 'button[data-testid="createAndOpenOrderButton"]',
      HEADER_SALES_ORDER: '[data-testid="headerNameSALESORDER"]',
      SO_ORDER_FIELD: ".soOrderNo",
      SO_ORDER_INPUT: 'input[name="orderNo"]',
    },
    GRID: {
      INGREDIENTS_ID: "#ingredients-grid",
      AVAILABILITY_COL_ID: "availability3",
    },
    URLS: {
      ETSY_ORDER: "https://www.etsy.com/your/orders/sold",
    },
    CONFIG: {
      DOUBLE_CLICK_WINDOW_MS: 250,
      SAVED_CLICKS_EX_NORMAL: 4,
      SAVED_CLICKS_ULTRA_EXTRA: 2,
      ULTRA_MAX_WAIT_FOR_READY_MS: 7000,
      ULTRA_READY_POLL_MS: 140,
      ULTRA_READY_COUNTDOWN_THRESHOLD_MS: 1500,
      ULTRA_WAIT_GRID_MS: 20000,
      ULTRA_SCAN_TIMEOUT_MS: 30000,
    },
  };
})();
