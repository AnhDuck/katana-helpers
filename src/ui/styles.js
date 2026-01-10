(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants } = kh;

  const ensureStyles = () => {
    if (document.getElementById(constants.IDS.STYLE)) return;

    const style = document.createElement("style");
    style.id = constants.IDS.STYLE;
    style.textContent = `
      #${constants.IDS.BTN_CREATE_MO} {
        background: #000 !important;
        color: #fff !important;
        border: 1px solid rgba(255,255,255,0.25) !important;
        border-radius: 6px !important;
        padding: 6px 12px !important;
        margin-right: 10px !important;
        font: inherit !important;
        cursor: pointer !important;
        line-height: 1.2 !important;
        white-space: nowrap !important;
      }
      #${constants.IDS.BTN_CREATE_MO}:hover { border-color: rgba(255,255,255,0.45) !important; }
      #${constants.IDS.BTN_CREATE_MO}:active { transform: translateY(0.5px) !important; }

      #${constants.IDS.BTN_CREATE_PO} {
        background: #cd00f1 !important;
        color: #fff !important;
        border: 1px solid rgba(255,255,255,0.25) !important;
        border-radius: 6px !important;
        padding: 6px 12px !important;
        margin-right: 10px !important;
        font: inherit !important;
        cursor: pointer !important;
        line-height: 1.2 !important;
        white-space: nowrap !important;
      }
      #${constants.IDS.BTN_CREATE_PO}:hover { border-color: rgba(255,255,255,0.45) !important; }
      #${constants.IDS.BTN_CREATE_PO}:active { transform: translateY(0.5px) !important; }

      #${constants.IDS.BTN_STATUS_HELPER} {
        border-radius: 6px !important;
        padding: 6px 12px !important;
        margin-right: 10px !important;
        font: inherit !important;
        cursor: pointer !important;
        line-height: 1.2 !important;
        white-space: nowrap !important;
        border: 1px solid rgba(0,0,0,0.25) !important;
        font-weight: 800 !important;
      }
      #${constants.IDS.BTN_STATUS_HELPER}[data-kh-running="1"] {
        opacity: 0.6 !important;
        cursor: progress !important;
      }

      #${constants.IDS.BTN_STATUS_HELPER}.kh-mo-done {
        background: rgba(46, 204, 113, 0.95) !important;
        color: #fff !important;
      }

      #${constants.IDS.BTN_STATUS_HELPER}.kh-so-packall {
        background: rgba(230, 213, 153, 0.95) !important;
        color: #000 !important;
      }

      #${constants.IDS.BTN_STATUS_HELPER}:hover { border-color: rgba(0,0,0,0.45) !important; }
      #${constants.IDS.BTN_STATUS_HELPER}:active { transform: translateY(0.5px) !important; }

      #${constants.IDS.WRAP_MO_DONE_RETURN} {
        display: inline-flex !important;
        flex-direction: column !important;
        align-items: center !important;
        margin-right: 10px !important;
        line-height: 1.1 !important;
      }
      #${constants.IDS.BTN_MO_DONE_RETURN} {
        border-radius: 6px !important;
        padding: 6px 12px !important;
        font: inherit !important;
        cursor: pointer !important;
        line-height: 1.2 !important;
        white-space: nowrap !important;
        border: 1px solid rgba(0,0,0,0.25) !important;
        font-weight: 800 !important;
        background: rgba(47, 111, 221, 0.98) !important;
        color: #fff !important;
      }
      #${constants.IDS.BTN_MO_DONE_RETURN}[data-kh-running="1"] {
        opacity: 0.6 !important;
        cursor: not-allowed !important;
      }
      #${constants.IDS.BTN_MO_DONE_RETURN}:hover { border-color: rgba(0,0,0,0.45) !important; }
      #${constants.IDS.BTN_MO_DONE_RETURN}:active { transform: translateY(0.5px) !important; }
      .${constants.CLASSES.LABEL_MO_DONE_RETURN} {
        margin-top: 4px !important;
        font-size: 11px !important;
        color: rgba(0,0,0,0.6) !important;
        white-space: nowrap !important;
        text-align: center !important;
        width: 100% !important;
      }

      .${constants.CLASSES.BTN_SO_EX} {
        background: rgba(153, 184, 230, 0.95) !important;
        color: #000 !important;
        font-weight: 900 !important;
        border: 1px solid rgba(0,0,0,0.25) !important;
        border-radius: 6px !important;

        width: 32px !important;
        height: 32px !important;
        padding: 0 !important;
        margin-right: 6px !important;

        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;

        font: inherit !important;
        font-size: 12px !important;
        line-height: 1 !important;
        white-space: nowrap !important;
        cursor: pointer !important;
      }
      .${constants.CLASSES.BTN_SO_EX}[data-kh-running="1"] {
        opacity: 0.7 !important;
        cursor: progress !important;
      }
      .${constants.CLASSES.BTN_SO_EX}.kh-ultra {
        background: rgba(230, 60, 60, 0.95) !important;
        color: #fff !important;
        border-color: rgba(255,255,255,0.25) !important;
      }
      .${constants.CLASSES.BTN_SO_EX}:hover { border-color: rgba(0,0,0,0.45) !important; }
      .${constants.CLASSES.BTN_SO_EX}:active { transform: translateY(0.5px) !important; }

      .${constants.CLASSES.ETSY_ORDER_CELL} {
        display: flex !important;
        align-items: flex-end !important;
        padding-left: 12px !important;
        margin-bottom: -16px !important;
      }
      #${constants.IDS.BTN_ETSY_ORDER} {
        background: #f26a2e !important;
        color: #fff !important;
        border: 1px solid rgba(0,0,0,0.15) !important;
        border-radius: 8px !important;
        padding: 8px 14px !important;
        font: inherit !important;
        font-weight: 700 !important;
        cursor: pointer !important;
        line-height: 1.2 !important;
        white-space: nowrap !important;
        box-shadow: 0 1px 0 rgba(0,0,0,0.1) !important;
        transition: background 120ms ease, box-shadow 120ms ease, transform 80ms ease !important;
      }
      #${constants.IDS.BTN_ETSY_ORDER}:hover {
        background: #e85e22 !important;
      }
      #${constants.IDS.BTN_ETSY_ORDER}:active,
      #${constants.IDS.BTN_ETSY_ORDER}[data-kh-clicked="1"] {
        background: #d4571f !important;
        box-shadow: inset 0 1px 2px rgba(0,0,0,0.25) !important;
        transform: translateY(1px) !important;
      }

      #${constants.IDS.WRAP_PO_SUPPLIER} {
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
        margin-right: 10px !important;
      }
      #${constants.IDS.BTN_PO_SUPPLIER} {
        border-radius: 6px !important;
        padding: 6px 12px !important;
        font: inherit !important;
        cursor: pointer !important;
        line-height: 1.2 !important;
        white-space: nowrap !important;
        border: 1px solid rgba(0,0,0,0.25) !important;
        font-weight: 700 !important;
        background: var(--kh-supplier-btn-bg, ${constants.CONFIG.PO_SUPPLIER_BUTTON_BG}) !important;
        color: var(--kh-supplier-btn-color, ${constants.CONFIG.PO_SUPPLIER_BUTTON_TEXT}) !important;
      }
      #${constants.IDS.BTN_PO_SUPPLIER}:hover { border-color: rgba(0,0,0,0.45) !important; }
      #${constants.IDS.BTN_PO_SUPPLIER}:active { transform: translateY(0.5px) !important; }
      #${constants.IDS.BTN_PO_SUPPLIER}:disabled,
      #${constants.IDS.BTN_PO_SUPPLIER}[data-kh-disabled="1"] {
        cursor: not-allowed !important;
        opacity: 0.65 !important;
        background: var(--kh-supplier-btn-disabled-bg, ${constants.CONFIG.PO_SUPPLIER_BUTTON_DISABLED_BG}) !important;
        color: var(--kh-supplier-btn-disabled-color, ${constants.CONFIG.PO_SUPPLIER_BUTTON_DISABLED_TEXT}) !important;
      }

      #${constants.IDS.BTN_PO_SUPPLIER_EDIT} {
        border-radius: 6px !important;
        border: 1px solid rgba(0,0,0,0.25) !important;
        background: #fff !important;
        color: #222 !important;
        cursor: pointer !important;
        width: 28px !important;
        height: 28px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        font: inherit !important;
        font-size: 13px !important;
        line-height: 1 !important;
        padding: 0 !important;
      }
      #${constants.IDS.BTN_PO_SUPPLIER_EDIT}:hover {
        border-color: rgba(0,0,0,0.45) !important;
        background: #f5f5f5 !important;
      }

      #${constants.IDS.PO_SUPPLIER_MODAL} {
        position: fixed !important;
        inset: 0 !important;
        z-index: 10002 !important;
        background: rgba(0,0,0,0.45) !important;
        display: none;
        align-items: center !important;
        justify-content: center !important;
        padding: 16px !important;
      }
      #${constants.IDS.PO_SUPPLIER_MODAL}[data-open="1"] {
        display: flex !important;
      }
      .${constants.CLASSES.PO_SUPPLIER_MODAL_CONTENT} {
        background: #fff !important;
        border-radius: 12px !important;
        padding: 16px 18px !important;
        width: min(420px, 92vw) !important;
        box-shadow: 0 12px 28px rgba(0,0,0,0.25) !important;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif !important;
      }
      .${constants.CLASSES.PO_SUPPLIER_MODAL_CONTENT} h3 {
        margin: 0 0 12px 0 !important;
        font-size: 16px !important;
      }
      .${constants.CLASSES.PO_SUPPLIER_MODAL_ROW} {
        display: flex !important;
        flex-direction: column !important;
        gap: 6px !important;
        margin-bottom: 12px !important;
        font-size: 13px !important;
      }
      .${constants.CLASSES.PO_SUPPLIER_MODAL_ROW} input {
        border: 1px solid rgba(0,0,0,0.2) !important;
        border-radius: 6px !important;
        padding: 6px 8px !important;
        font: inherit !important;
      }
      .${constants.CLASSES.PO_SUPPLIER_MODAL_ROW} input[type="color"] {
        padding: 0 !important;
        width: 48px !important;
        height: 32px !important;
      }
      .${constants.CLASSES.PO_SUPPLIER_MODAL_WARNING} {
        margin: 0 0 12px 0 !important;
        font-size: 12px !important;
        color: #b00020 !important;
      }
      .${constants.CLASSES.PO_SUPPLIER_MODAL_ACTIONS} {
        display: flex !important;
        justify-content: flex-end !important;
        gap: 8px !important;
      }
      .${constants.CLASSES.PO_SUPPLIER_MODAL_ACTIONS} button {
        border-radius: 6px !important;
        border: 1px solid rgba(0,0,0,0.25) !important;
        padding: 6px 10px !important;
        font: inherit !important;
        cursor: pointer !important;
      }

      #${constants.IDS.BTN_SIMPLYPRINT_NAV} {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      #${constants.IDS.BTN_SIMPLYPRINT_NAV}.${constants.CLASSES.SIMPLYPRINT_NAV} .kh-simplyprint-label {
        display: inline-flex !important;
        flex-direction: column !important;
        align-items: center !important;
        gap: 4px !important;
      }
      #${constants.IDS.BTN_SIMPLYPRINT_NAV}.${constants.CLASSES.SIMPLYPRINT_NAV} .kh-simplyprint-icon {
        width: 18px !important;
        height: 18px !important;
        display: inline-block !important;
      }

      #${constants.IDS.HUD} {
        position: fixed;
        left: 50%;
        bottom: 10px;
        transform: translateX(-50%);
        z-index: 9999;
        padding: 6px 10px;
        border-radius: 10px;
        background: rgba(0,0,0,0.35);
        color: rgba(255,255,255,0.95);
        font-size: 12px;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
        user-select: none;
        backdrop-filter: blur(2px);
        pointer-events: auto;
      }
      #${constants.IDS.HUD} .kh-hud-text { pointer-events: none; }
      #${constants.IDS.HUD} .kh-hud-total { pointer-events: auto; }
      #${constants.IDS.MO_TIMER} {
        pointer-events: auto;
        cursor: pointer;
        margin-left: 6px;
      }
      #${constants.IDS.MO_TIMER}[data-state="paused"] {
        opacity: 0.6;
      }
      #${constants.IDS.HUD} button {
        pointer-events: auto;
        margin-right: 8px;
        padding: 2px 8px;
        font: inherit;
        font-size: 12px;
        border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.35);
        background: rgba(255,255,255,0.12);
        color: rgba(255,255,255,0.95);
        cursor: pointer;
      }
      #${constants.IDS.HUD} button:hover {
        border-color: rgba(255,255,255,0.55);
        background: rgba(255,255,255,0.18);
      }

      #${constants.IDS.TOAST} {
        position: fixed;
        left: 50%;
        bottom: 48px;
        transform: translateX(-50%);
        z-index: 10000;
        max-width: min(720px, 92vw);
        padding: 10px 12px;
        border-radius: 12px;
        background: rgba(0,0,0,0.78);
        color: rgba(255,255,255,0.96);
        font-size: 13px;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
        box-shadow: 0 6px 24px rgba(0,0,0,0.25);
        opacity: 0;
        display: none;
        transition: opacity 180ms ease;
        pointer-events: none;
      }
    `;
    document.documentElement.appendChild(style);
  };

  kh.ui = kh.ui || {};
  kh.ui.styles = { ensureStyles };
})();
