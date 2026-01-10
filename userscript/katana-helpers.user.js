// ==UserScript==
// @name         Katana Helpers
// @namespace    https://factory.katanamrp.com/
// @version      2.9.1
// @description  Loader for Katana Helpers with branch toggle.
// @match        https://factory.katanamrp.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
  const REPO_OWNER = "AnhDuck";
  const REPO_NAME = "katana-helpers";
  const DEV_BRANCH = "codex/refactor-userscript-for-dev-and-release";
  const MAIN_BRANCH = "main";
  const BRANCH_KEY = "kh_loader_branch";

  const getBranch = () => localStorage.getItem(BRANCH_KEY) || DEV_BRANCH;
  const setBranch = (branch) => {
    localStorage.setItem(BRANCH_KEY, branch);
  };

  const currentBranch = getBranch();
  const isDevMode = currentBranch !== MAIN_BRANCH;

  window.KHLoaderConfig = {
    branch: currentBranch,
    isDevMode,
    devBranch: DEV_BRANCH,
    mainBranch: MAIN_BRANCH,
    setBranch: (branch) => {
      setBranch(branch);
      window.location.reload();
    },
  };

  const warnDevMode = () => {
    if (!isDevMode) return;
    const warningText = "⚠️ Katana Helpers DEV MODE — branch-based code is running";
    console.warn(`%c${warningText}`, "color: red; font-weight: bold; font-size: 14px;");

    const showWarning = () => {
      if (document.getElementById("kh-dev-banner")) return;
      const banner = document.createElement("div");
      banner.id = "kh-dev-banner";
      banner.textContent = warningText;
      banner.style.cssText = [
        "position: fixed",
        "bottom: 0",
        "left: 0",
        "right: 0",
        "z-index: 10001",
        "background: #b00020",
        "color: #fff",
        "font-weight: 700",
        "font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        "padding: 4px 10px",
        "text-align: center",
        "box-shadow: 0 -2px 8px rgba(0,0,0,0.3)",
        "font-size: 12px",
      ].join("; ");
      document.documentElement.appendChild(banner);
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", showWarning, { once: true });
    } else {
      showWarning();
    }
  };

  const baseUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${currentBranch}`;
  const modules = [
    "src/core/constants.js",
    "src/core/utils.js",
    "src/core/storage.js",
    "src/ui/styles.js",
    "src/ui/toast.js",
    "src/ui/hud.js",
    "src/features/statusHelper.js",
    "src/features/createMo.js",
    "src/features/doneAndReturn.js",
    "src/features/ultraEx.js",
    "src/features/soEx.js",
    "src/features/etsyButton.js",
    "src/init.js",
  ];

  const loadScript = (src) => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });

  (async () => {
    warnDevMode();
    for (const modulePath of modules) {
      await loadScript(`${baseUrl}/${modulePath}`);
    }
  })();
})();
