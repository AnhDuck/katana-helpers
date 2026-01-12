(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants } = kh;

  const ensureStyles = () => {
    if (document.getElementById(constants.IDS.STYLE)) return;

    const style = document.createElement("style");
    style.id = constants.IDS.STYLE;
    style.textContent = `
      .${constants.CLASSES.BTN_BASE} {
        appearance: none !important;
        border-radius: 6px !important;
        border: 1px solid transparent !important;
        padding: 6px 12px !important;
        font: inherit !important;
        font-size: 12px !important;
        font-weight: 500 !important;
        line-height: 1.25 !important;
        cursor: pointer !important;
        white-space: nowrap !important;
        background: #e2e8f0 !important;
        color: #0f172a !important;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08) !important;
        transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease, box-shadow 150ms ease, transform 80ms ease !important;
      }
      .${constants.CLASSES.BTN_BASE}:hover {
        background: #cbd5e1 !important;
        border-color: #94a3b8 !important;
      }
      .${constants.CLASSES.BTN_BASE}:focus-visible {
        outline: 2px solid transparent !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.35), 0 1px 2px rgba(15, 23, 42, 0.08) !important;
      }
      .${constants.CLASSES.BTN_BASE}:active {
        transform: translateY(1px) !important;
      }
      .${constants.CLASSES.BTN_BASE}[data-kh-running="1"],
      .${constants.CLASSES.BTN_BASE}:disabled,
      .${constants.CLASSES.BTN_BASE}[data-kh-disabled="1"] {
        opacity: 0.65 !important;
        cursor: not-allowed !important;
        box-shadow: none !important;
      }

      #${constants.IDS.BTN_CREATE_MO} {
        background: #7c3aed !important;
        color: #fff !important;
        border-color: #6d28d9 !important;
        padding: 6px 12px !important;
        margin-right: 10px !important;
        font-weight: 600 !important;
      }
      #${constants.IDS.BTN_CREATE_MO}:hover { background: #6d28d9 !important; border-color: #5b21b6 !important; }
      #${constants.IDS.BTN_CREATE_MO}:active { background: #5b21b6 !important; }

      #${constants.IDS.BTN_CREATE_PO} {
        background: #0f172a !important;
        color: #fff !important;
        border-color: #1e293b !important;
        padding: 6px 12px !important;
        margin-right: 10px !important;
        font-weight: 600 !important;
      }
      #${constants.IDS.BTN_CREATE_PO}:hover { background: #1e293b !important; border-color: #334155 !important; }
      #${constants.IDS.BTN_CREATE_PO}:active { background: #020617 !important; }

      #${constants.IDS.BTN_STATUS_HELPER} {
        margin-right: 10px !important;
        background: #e2e8f0 !important;
        color: #0f172a !important;
        border-color: #cbd5e1 !important;
        font-weight: 600 !important;
      }
      #${constants.IDS.BTN_STATUS_HELPER}[data-kh-running="1"] {
        opacity: 0.6 !important;
        cursor: progress !important;
      }

      #${constants.IDS.BTN_STATUS_HELPER}.kh-mo-done {
        background: #16a34a !important;
        color: #fff !important;
        border-color: #15803d !important;
      }

      #${constants.IDS.BTN_STATUS_HELPER}.kh-so-packall {
        background: #f59e0b !important;
        color: #1f2937 !important;
        border-color: #d97706 !important;
      }

      #${constants.IDS.BTN_STATUS_HELPER}:hover { background: #cbd5e1 !important; border-color: #94a3b8 !important; }
      #${constants.IDS.BTN_STATUS_HELPER}.kh-mo-done:hover { background: #15803d !important; border-color: #166534 !important; }
      #${constants.IDS.BTN_STATUS_HELPER}.kh-so-packall:hover { background: #d97706 !important; border-color: #b45309 !important; }
      #${constants.IDS.BTN_STATUS_HELPER}:active { transform: translateY(1px) !important; }

      #${constants.IDS.WRAP_MO_DONE_RETURN} {
        display: inline-flex !important;
        flex-direction: column !important;
        align-items: center !important;
        margin-right: 10px !important;
        line-height: 1.1 !important;
      }
      #${constants.IDS.BTN_MO_DONE_RETURN} {
        border-color: #1d4ed8 !important;
        font-weight: 600 !important;
        background: #2563eb !important;
        color: #fff !important;
      }
      #${constants.IDS.BTN_MO_DONE_RETURN}[data-kh-running="1"] {
        opacity: 0.6 !important;
        cursor: not-allowed !important;
      }
      #${constants.IDS.BTN_MO_DONE_RETURN}:hover { background: #1d4ed8 !important; border-color: #1e40af !important; }
      #${constants.IDS.BTN_MO_DONE_RETURN}:active { background: #1e40af !important; }
      .${constants.CLASSES.LABEL_MO_DONE_RETURN} {
        margin-top: 4px !important;
        font-size: 11px !important;
        color: rgba(0,0,0,0.6) !important;
        white-space: nowrap !important;
        text-align: center !important;
        width: 100% !important;
      }

      .${constants.CLASSES.BTN_SO_EX} {
        background: #e0e7ff !important;
        color: #312e81 !important;
        border-color: #c7d2fe !important;
        font-weight: 700 !important;
        width: 32px !important;
        height: 32px !important;
        padding: 0 !important;
        margin-right: 6px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 12px !important;
        line-height: 1 !important;
      }
      .${constants.CLASSES.BTN_SO_EX}[data-kh-running="1"] {
        opacity: 0.7 !important;
        cursor: progress !important;
      }
      .${constants.CLASSES.BTN_SO_EX}.kh-ultra {
        background: #dc2626 !important;
        color: #fff !important;
        border-color: #b91c1c !important;
      }
      .${constants.CLASSES.BTN_SO_EX}:hover { background: #c7d2fe !important; border-color: #a5b4fc !important; }
      .${constants.CLASSES.BTN_SO_EX}.kh-ultra:hover { background: #b91c1c !important; border-color: #991b1b !important; }
      .${constants.CLASSES.BTN_SO_EX}:active { transform: translateY(1px) !important; }

      .${constants.CLASSES.ETSY_ORDER_CELL} {
        display: flex !important;
        align-items: flex-end !important;
        padding-left: 12px !important;
        margin-bottom: -16px !important;
      }
      #${constants.IDS.BTN_ETSY_ORDER} {
        background: #f97316 !important;
        color: #fff !important;
        border-color: #ea580c !important;
        padding: 8px 14px !important;
        font-weight: 600 !important;
      }
      #${constants.IDS.BTN_ETSY_ORDER}:hover {
        background: #ea580c !important;
        border-color: #c2410c !important;
      }
      #${constants.IDS.BTN_ETSY_ORDER}:active,
      #${constants.IDS.BTN_ETSY_ORDER}[data-kh-clicked="1"] {
        background: #c2410c !important;
        border-color: #9a3412 !important;
      }

      #${constants.IDS.WRAP_PO_SUPPLIER} {
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
        margin-right: 10px !important;
      }
      #${constants.IDS.BTN_PO_SUPPLIER} {
        border-color: #1d4ed8 !important;
        font-weight: 600 !important;
        background: var(--kh-supplier-btn-bg, ${constants.CONFIG.PO_SUPPLIER_BUTTON_BG}) !important;
        color: var(--kh-supplier-btn-color, ${constants.CONFIG.PO_SUPPLIER_BUTTON_TEXT}) !important;
      }
      #${constants.IDS.BTN_PO_SUPPLIER}:hover { border-color: #1e40af !important; filter: brightness(0.96) !important; }
      #${constants.IDS.BTN_PO_SUPPLIER}:active { transform: translateY(1px) !important; filter: brightness(0.92) !important; }
      #${constants.IDS.BTN_PO_SUPPLIER}:disabled,
      #${constants.IDS.BTN_PO_SUPPLIER}[data-kh-disabled="1"] {
        cursor: not-allowed !important;
        opacity: 0.65 !important;
        background: var(--kh-supplier-btn-disabled-bg, ${constants.CONFIG.PO_SUPPLIER_BUTTON_DISABLED_BG}) !important;
        color: var(--kh-supplier-btn-disabled-color, ${constants.CONFIG.PO_SUPPLIER_BUTTON_DISABLED_TEXT}) !important;
        border-color: transparent !important;
      }

      #${constants.IDS.BTN_PO_SUPPLIER_EDIT} {
        border-color: #cbd5e1 !important;
        background: #f8fafc !important;
        color: #0f172a !important;
        width: 28px !important;
        height: 28px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 13px !important;
        line-height: 1 !important;
        padding: 0 !important;
      }
      #${constants.IDS.BTN_PO_SUPPLIER_EDIT}:hover {
        border-color: #94a3b8 !important;
        background: #e2e8f0 !important;
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
        background: #f1f5f9 !important;
        color: #0f172a !important;
        border-color: #cbd5e1 !important;
        font-weight: 500 !important;
      }
      .${constants.CLASSES.PO_SUPPLIER_MODAL_ACTIONS} button:hover {
        background: #e2e8f0 !important;
        border-color: #94a3b8 !important;
      }
      .${constants.CLASSES.PO_SUPPLIER_MODAL_ACTIONS} button:last-child {
        background: #2563eb !important;
        color: #fff !important;
        border-color: #1d4ed8 !important;
      }
      .${constants.CLASSES.PO_SUPPLIER_MODAL_ACTIONS} button:last-child:hover {
        background: #1d4ed8 !important;
        border-color: #1e40af !important;
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
        font: inherit;
        font-size: 12px;
        border-radius: 6px;
        border: 1px solid rgba(148, 163, 184, 0.55);
        background: rgba(148, 163, 184, 0.2);
        color: #f8fafc;
        cursor: pointer;
      }
      #${constants.IDS.HUD} button:hover {
        border-color: rgba(148, 163, 184, 0.85);
        background: rgba(148, 163, 184, 0.3);
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
