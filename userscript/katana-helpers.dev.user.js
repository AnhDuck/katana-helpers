// ==UserScript==
// @name         Katana Helpers (DEV)
// @namespace    https://factory.katanamrp.com/
// @version      dev
// @description  DEV loader for Katana Helpers (branch-based).
// @match        https://factory.katanamrp.com/*
// @run-at       document-idle
// @grant        none
// DEV BRANCH NOTE: Update the branch segment in @require URLs to the current Codex branch each task.
// @require      https://raw.githubusercontent.com/AnhDuck/katana-helpers/codex/refactor-userscript-for-dev-and-release/src/core/constants.js
// @require      https://raw.githubusercontent.com/AnhDuck/katana-helpers/codex/refactor-userscript-for-dev-and-release/src/core/utils.js
// @require      https://raw.githubusercontent.com/AnhDuck/katana-helpers/codex/refactor-userscript-for-dev-and-release/src/core/storage.js
// @require      https://raw.githubusercontent.com/AnhDuck/katana-helpers/codex/refactor-userscript-for-dev-and-release/src/ui/styles.js
// @require      https://raw.githubusercontent.com/AnhDuck/katana-helpers/codex/refactor-userscript-for-dev-and-release/src/ui/toast.js
// @require      https://raw.githubusercontent.com/AnhDuck/katana-helpers/codex/refactor-userscript-for-dev-and-release/src/ui/hud.js
// @require      https://raw.githubusercontent.com/AnhDuck/katana-helpers/codex/refactor-userscript-for-dev-and-release/src/features/statusHelper.js
// @require      https://raw.githubusercontent.com/AnhDuck/katana-helpers/codex/refactor-userscript-for-dev-and-release/src/features/createMo.js
// @require      https://raw.githubusercontent.com/AnhDuck/katana-helpers/codex/refactor-userscript-for-dev-and-release/src/features/doneAndReturn.js
// @require      https://raw.githubusercontent.com/AnhDuck/katana-helpers/codex/refactor-userscript-for-dev-and-release/src/features/ultraEx.js
// @require      https://raw.githubusercontent.com/AnhDuck/katana-helpers/codex/refactor-userscript-for-dev-and-release/src/features/soEx.js
// @require      https://raw.githubusercontent.com/AnhDuck/katana-helpers/codex/refactor-userscript-for-dev-and-release/src/features/etsyButton.js
// @require      https://raw.githubusercontent.com/AnhDuck/katana-helpers/codex/refactor-userscript-for-dev-and-release/src/init.js
// ==/UserScript==

(() => {
  const warningText = "⚠️ Katana Helpers DEV MODE — branch-based code is running";
  console.warn(`%c${warningText}`, "color: red; font-weight: bold; font-size: 14px;");

  const showWarning = () => {
    if (document.getElementById("kh-dev-banner")) return;
    const banner = document.createElement("div");
    banner.id = "kh-dev-banner";
    banner.textContent = warningText;
    banner.style.cssText = [
      "position: fixed",
      "top: 0",
      "left: 0",
      "right: 0",
      "z-index: 10001",
      "background: #b00020",
      "color: #fff",
      "font-weight: 700",
      "font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      "padding: 8px 12px",
      "text-align: center",
      "box-shadow: 0 2px 8px rgba(0,0,0,0.3)",
    ].join("; ");
    document.documentElement.appendChild(banner);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showWarning, { once: true });
  } else {
    showWarning();
  }
})();
