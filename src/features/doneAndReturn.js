(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants, utils, storage } = kh;

  const ensureMoDoneReturnButton = () => {
    kh.ui.styles.ensureStyles();

    const statusBtn = document.querySelector(constants.SELECTORS.ENTITY_STATUS_BTN);
    if (!statusBtn) return;

    const parent = statusBtn.parentElement;
    if (!parent) return;

    let wrap = document.getElementById(constants.IDS.WRAP_MO_DONE_RETURN);
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = constants.IDS.WRAP_MO_DONE_RETURN;

      const btn = utils.createButton({
        id: constants.IDS.BTN_MO_DONE_RETURN,
        text: "Done & ↩︎",
        title: "Mark Done, then return to the previous page.",
        onClick: async (event) => {
          event.preventDefault();
          event.stopPropagation();

          if (btn.getAttribute("data-kh-running") === "1") return;
          btn.setAttribute("data-kh-running", "1");
          btn.disabled = true;

          try {
            kh.ui.toast.showToast("Done & ↩︎: marking Done…");
            const ok = await kh.features.statusHelper.runMoSetDoneFlow();
            if (!ok) {
              kh.ui.toast.showToast("Couldn't set Done — not returning.");
              return;
            }

            kh.ui.hud.incrementCounters(2);
            if (history.length > 1) {
              kh.ui.toast.showToast("Done & ↩︎: returning to previous page");
              history.back();
              return;
            }

            const storedUrl = storage.getStoredReturnUrl();
            const normalizedStored = storage.normalizeReturnUrl(storedUrl);
            if (normalizedStored && !storage.isSameUrl(normalizedStored, window.location.href)) {
              kh.ui.toast.showToast("Done & ↩︎: returning to previous page");
              window.location.href = normalizedStored;
              return;
            }

            kh.ui.toast.showToast("No previous page found — stayed on this MO.");
          } finally {
            btn.setAttribute("data-kh-running", "0");
            btn.disabled = false;
          }
        },
      });

      const label = document.createElement("div");
      label.className = constants.CLASSES.LABEL_MO_DONE_RETURN;
      label.textContent = "Returns to: Previous page";

      wrap.appendChild(btn);
      wrap.appendChild(label);

      const helper = document.getElementById(constants.IDS.BTN_STATUS_HELPER);
      if (helper) {
        parent.insertBefore(wrap, helper);
      } else {
        parent.insertBefore(wrap, statusBtn);
      }
    }

    const ctx = kh.features.statusHelper.getEntityStatusContext();
    wrap.style.display = "none";
    if (ctx.mode === "manufacturing" && ctx.state === "notStarted") {
      wrap.style.display = "";
      storage.maybeStoreReturnUrlFromReferrer();
      const label = wrap.querySelector(`.${constants.CLASSES.LABEL_MO_DONE_RETURN}`);
      if (label) {
        label.textContent = "Returns to: Previous page";
      }
    } else {
      wrap.remove();
    }
  };

  kh.features = kh.features || {};
  kh.features.doneAndReturn = { ensureMoDoneReturnButton };
})();
