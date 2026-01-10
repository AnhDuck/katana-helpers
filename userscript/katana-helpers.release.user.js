// ==UserScript==
// @name         Katana Helpers
// @namespace    https://factory.katanamrp.com/
// @version      2.9.0
// @description  Release loader for Katana Helpers (main branch).
// @match        https://factory.katanamrp.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
  const RELEASE_BASE_URL = "https://raw.githubusercontent.com/AnhDuck/katana-helpers/main";

  const modulePaths = [
    "src/core/constants.js",
    "src/core/utils.js",
    "src/core/storage.js",
    "src/ui/styles.js",
    "src/ui/toast.js",
    "src/ui/hud.js",
    "src/ui/moTimer.js",
    "src/features/statusHelper.js",
    "src/features/createMo.js",
    "src/features/doneAndReturn.js",
    "src/features/ultraEx.js",
    "src/features/soEx.js",
    "src/features/etsyButton.js",
    "src/init.js",
  ];

  const loadScript = (src) => new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

  const loadAll = async () => {
    for (const path of modulePaths) {
      const ok = await loadScript(`${RELEASE_BASE_URL}/${path}`);
      if (!ok) {
        console.warn(`%cKatana Helpers loader: failed to load ${path}`, "color: red; font-weight: bold;");
        break;
      }
    }
  };

  loadAll();
})();
