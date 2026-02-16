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


  const isFileUrl = (raw) => /^file:\/\//i.test((raw || "").trim());

  const copyToClipboard = async (value) => {
    const text = (value || "").trim();
    if (!text) return false;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // ignore and try fallback
    }

    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "readonly");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      area.style.top = "0";
      document.body.appendChild(area);
      area.select();
      area.setSelectionRange(0, text.length);
      const ok = document.execCommand("copy");
      area.remove();
      return !!ok;
    } catch {
      return false;
    }
  };

  const openDestination = async (url) => {
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (win) {
      win.focus();
      return { ok: true };
    }

    if (isFileUrl(url) && window.location.protocol === "https:") {
      const copied = await copyToClipboard(url);
      if (copied) {
        return {
          ok: false,
          message: "Browser security blocks file:// links from https pages. URL copied — paste it in a new tab.",
        };
      }
      return {
        ok: false,
        message: "Browser security blocks file:// links from https pages. Copy this URL manually from ⚙ settings.",
      };
    }

    return { ok: false, message: "Could not open link. Check popup settings and URL." };
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
        onClick: async (event) => {
          event.preventDefault();
          event.stopPropagation();

          const url = resolveActiveUrl();
          if (!isValidDestination(url)) {
            kh.ui.toast.showToast("Spacer Ring label URL is invalid. Use ⚙ to set one.");
            return;
          }

          const result = await openDestination(url);
          if (!result.ok) {
            kh.ui.toast.showToast(result.message || "Could not open label URL.");
            return;
          }

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
