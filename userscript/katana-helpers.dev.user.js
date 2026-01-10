// ==UserScript==
// @name         Katana Helpers (DEV)
// @namespace    https://factory.katanamrp.com/
// @version      dev
// @description  DEV loader for Katana Helpers (branch-based).
// @match        https://factory.katanamrp.com/*
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      raw.githubusercontent.com
// ==/UserScript==

(() => {
  // Paste your branch URL here (tree URL or raw base URL).
  // Example: https://github.com/AnhDuck/katana-helpers/tree/codex/implement-manufacturing-order-timer
  const DEV_BRANCH_URL = "https://github.com/AnhDuck/katana-helpers/tree/work";

  const MODULE_PATHS = [
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

  const warningText = "⚠️ Katana Helpers DEV MODE — branch-based code is running";
  console.warn(`%c${warningText}`, "color: red; font-weight: bold; font-size: 14px;");

  const showWarning = () => {
    const targetWindow = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
    const doc = targetWindow.document;
    if (doc.getElementById("kh-dev-banner")) return;
    const banner = doc.createElement("div");
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
    doc.documentElement.appendChild(banner);
  };

  const resolveRawBase = (url) => {
    if (!url) return "";
    const trimmed = url.replace(/\/+$/, "");
    if (trimmed.startsWith("https://raw.githubusercontent.com/")) return trimmed;
    const refsMatch = trimmed.match(/^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/refs\/heads\/(.+)$/);
    if (refsMatch) {
      const [, owner, repo, branchPath] = refsMatch;
      return `https://raw.githubusercontent.com/${owner}/${repo}/${branchPath}`;
    }
    const treeMatch = trimmed.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/tree\/(.+)$/);
    if (!treeMatch) return "";
    const [, owner, repo, branchPath] = treeMatch;
    return `https://raw.githubusercontent.com/${owner}/${repo}/${branchPath}`;
  };

  const loadText = (url) => new Promise((resolve) => {
    GM_xmlhttpRequest({
      method: "GET",
      url,
      onload: (response) => {
        if (response.status >= 200 && response.status < 300) {
          resolve(response.responseText);
        } else {
          resolve("");
        }
      },
      onerror: () => resolve(""),
    });
  });

  const runModule = (code) => {
    if (!code) return false;
    const targetWindow = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
    const runner = new Function("targetWindow", `
      const window = targetWindow;
      const document = targetWindow.document;
      const navigator = targetWindow.navigator;
      const MutationObserver = targetWindow.MutationObserver;
      const requestAnimationFrame = targetWindow.requestAnimationFrame.bind(targetWindow);
      const setTimeout = targetWindow.setTimeout.bind(targetWindow);
      const clearTimeout = targetWindow.clearTimeout.bind(targetWindow);
      const setInterval = targetWindow.setInterval.bind(targetWindow);
      const clearInterval = targetWindow.clearInterval.bind(targetWindow);
      const MouseEvent = targetWindow.MouseEvent;
      const Event = targetWindow.Event;
      const Intl = targetWindow.Intl;
      ${code}
    `);
    runner(targetWindow);
    return true;
  };

  const loadAll = async () => {
    const rawBase = resolveRawBase(DEV_BRANCH_URL);
    if (!rawBase) {
      console.warn(
        "%cKatana Helpers DEV loader: invalid DEV_BRANCH_URL. Paste a valid GitHub tree or raw URL.",
        "color: red; font-weight: bold;",
      );
      return;
    }

    for (const path of MODULE_PATHS) {
      const code = await loadText(`${rawBase}/${path}`);
      const ok = runModule(code);
      if (!ok) {
        console.warn(`%cKatana Helpers DEV loader: failed to load ${path}`, "color: red; font-weight: bold;");
        break;
      }
    }
  };

  const targetWindow = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
  const doc = targetWindow.document;
  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", showWarning, { once: true });
  } else {
    showWarning();
  }

  loadAll();
})();
