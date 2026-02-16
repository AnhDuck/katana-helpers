(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants, utils } = kh;

  const URL_PARAM = "srLabelUrl";

  const isMoPage = () => /^\/manufacturingorder\/\d+/.test(window.location.pathname);

  const isValidDestination = (raw) => {
    if (!raw || typeof raw !== "string") return false;
    const val = raw.trim();
    return /^file:\/\//i.test(val) || /^https?:\/\//i.test(val);
  };

  const readQueryOverride = () => {
    const params = new URLSearchParams(window.location.search || "");
    const value = params.get(URL_PARAM);
    return isValidDestination(value) ? value.trim() : "";
  };

  const getStoredUrl = () => {
    try {
      const raw = localStorage.getItem(constants.KEYS.SPACER_RING_LABEL_URL) || "";
      return isValidDestination(raw) ? raw.trim() : "";
    } catch {
      return "";
    }
  };

  const setStoredUrl = (url) => {
    if (!isValidDestination(url)) return false;
    try {
      localStorage.setItem(constants.KEYS.SPACER_RING_LABEL_URL, url.trim());
      return true;
    } catch {
      return false;
    }
  };

  const clearStoredUrl = () => {
    try {
      localStorage.removeItem(constants.KEYS.SPACER_RING_LABEL_URL);
    } catch {
      // ignore
    }
  };

  const resolveActiveUrl = () => {
    const queryUrl = readQueryOverride();
    if (queryUrl) {
      setStoredUrl(queryUrl);
      return queryUrl;
    }
    const stored = getStoredUrl();
    return stored || constants.URLS.SPACER_RING_LABEL_DEFAULT;
  };

  const productMentionsSpacerRing = () => {
    const inputs = document.querySelectorAll('input[data-testid="katanaAutocompleteInput"]');
    if (!inputs.length) return false;
    return [...inputs].some((input) => utils.normText(input.value).includes("spacer ring"));
  };

  const removeButtons = () => {
    document.querySelectorAll(`.${constants.CLASSES.SPACER_RING_LABEL_WRAP}`).forEach((el) => el.remove());
  };

  const ensureButtons = () => {
    kh.ui.styles.ensureStyles();

    const statusBtn = document.querySelector(constants.SELECTORS.ENTITY_STATUS_BTN);
    if (!statusBtn || !statusBtn.parentElement) return;

    const parent = statusBtn.parentElement;
    let wrap = parent.querySelector(`.${constants.CLASSES.SPACER_RING_LABEL_WRAP}`);
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = constants.CLASSES.SPACER_RING_LABEL_WRAP;

      const printBtn = utils.createButton({
        id: constants.IDS.BTN_SPACER_RING_LABEL,
        className: constants.CLASSES.SPACER_RING_LABEL_BTN,
        text: "Bag Label PDF ↗",
        title: "Open Spacer Ring bag-label PDF/folder in a new window.",
        onClick: (event) => {
          event.preventDefault();
          event.stopPropagation();

          const url = resolveActiveUrl();
          if (!isValidDestination(url)) {
            kh.ui.toast.showToast("Spacer Ring label URL is invalid. Use ⚙ to set one.");
            return;
          }

          const win = window.open(url, "_blank", "noopener,noreferrer");
          if (!win) {
            kh.ui.toast.showToast("Popup blocked — allow popups for this site.");
            return;
          }
          win.focus();
          kh.ui.hud.incrementCounters(2);
        },
      });

      const editBtn = utils.createButton({
        id: constants.IDS.BTN_SPACER_RING_LABEL_EDIT,
        className: constants.CLASSES.SPACER_RING_LABEL_EDIT,
        text: "⚙",
        title: "Set or reset Spacer Ring bag-label URL.",
        onClick: (event) => {
          event.preventDefault();
          event.stopPropagation();

          const current = resolveActiveUrl();
          const next = window.prompt(
            "Set Spacer Ring label URL (file://, http://, or https://).\nLeave blank to reset to default.",
            current,
          );
          if (next == null) return;

          const trimmed = next.trim();
          if (!trimmed) {
            clearStoredUrl();
            kh.ui.toast.showToast("Spacer Ring label URL reset to default.");
            return;
          }

          if (!isValidDestination(trimmed)) {
            kh.ui.toast.showToast("Invalid URL. Must start with file://, http://, or https://");
            return;
          }

          setStoredUrl(trimmed);
          kh.ui.toast.showToast("Spacer Ring label URL saved.");
        },
      });

      wrap.append(printBtn, editBtn);
      parent.insertBefore(wrap, statusBtn);
    }

    const activeUrl = resolveActiveUrl();
    const printBtn = wrap.querySelector(`#${constants.IDS.BTN_SPACER_RING_LABEL}`);
    if (printBtn) printBtn.setAttribute("data-kh-url", activeUrl);
  };

  const ensureSpacerRingLabelShortcut = () => {
    if (!isMoPage()) {
      removeButtons();
      return;
    }

    if (!productMentionsSpacerRing()) {
      removeButtons();
      return;
    }

    ensureButtons();
  };

  kh.features = kh.features || {};
  kh.features.spacerRingLabelShortcut = { ensureSpacerRingLabelShortcut };
})();
