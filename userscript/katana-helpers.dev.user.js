// ==UserScript==
// @name         Katana Helpers (DEV)
// @namespace    https://factory.katanamrp.com/
// @version      dev
// @description  DEV loader for Katana Helpers (branch-based).
// @match        https://factory.katanamrp.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
  // Paste the GitHub branch URL here (tree URL or raw base).
  // Example: https://github.com/AnhDuck/katana-helpers/tree/codex/implement-manufacturing-order-timer
  const DEV_BRANCH_URL = "https://github.com/AnhDuck/katana-helpers/tree/codex/work";

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

  const resolveRawBase = (url) => {
    if (!url) return "";
    const trimmed = url.replace(/\/+$/, "");
    if (trimmed.startsWith("https://raw.githubusercontent.com/")) return trimmed;
    const match = trimmed.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/tree\/(.+)$/);
    if (!match) return "";
    const [, owner, repo, branchPath] = match;
    return `https://raw.githubusercontent.com/${owner}/${repo}/${branchPath}`;
  };

  const rawBase = resolveRawBase(DEV_BRANCH_URL);
  if (!rawBase) {
    console.warn(
      "%cKatana Helpers DEV loader: invalid branch URL. Update DEV_BRANCH_URL to a valid GitHub tree URL.",
      "color: red; font-weight: bold;",
    );
    return;
  }

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
      const ok = await loadScript(`${rawBase}/${path}`);
      if (!ok) {
        console.warn(`%cKatana Helpers DEV loader: failed to load ${path}`, "color: red; font-weight: bold;");
        break;
      }
    }
  };

  loadAll();
})();
