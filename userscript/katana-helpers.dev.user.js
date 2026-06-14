// ==UserScript==
// @name         Katana Helpers Dev
// @namespace    https://factory.katanamrp.com/
// @version      2.9.0-dev.1
// @description  Runtime loader for local Katana Helpers modules.
// @match        https://factory.katanamrp.com/*
// @updateURL    http://127.0.0.1:5174/userscript/katana-helpers.dev.user.js
// @downloadURL  http://127.0.0.1:5174/userscript/katana-helpers.dev.user.js
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      127.0.0.1
// @connect      localhost
// ==/UserScript==

(function () {
  const devOrigin = "http://127.0.0.1:5174";
  const runtimeUrl = devOrigin + "/katana-helpers.dev-runtime.js";

  function withCacheBust(url) {
    return url + (url.includes("?") ? "&" : "?") + "t=" + Date.now();
  }

  function requestText(url) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "GET",
        url: withCacheBust(url),
        headers: { "Cache-Control": "no-cache" },
        timeout: 10000,
        onload(response) {
          if (response.status >= 200 && response.status < 300) {
            resolve(response.responseText);
            return;
          }
          reject(new Error("HTTP " + response.status + " for " + url));
        },
        onerror() {
          reject(new Error("Network error for " + url));
        },
        ontimeout() {
          reject(new Error("Timeout loading " + url));
        }
      });
    });
  }

  function showBootstrapFailure(error) {
    console.error("[Katana Helpers Dev] Failed to load local runtime", error);
    const box = document.createElement("div");
    box.textContent = "Katana Helpers Dev failed to load runtime from " + devOrigin + ": " + error.message;
    box.style.cssText = [
      "position:fixed",
      "z-index:2147483647",
      "left:12px",
      "bottom:12px",
      "max-width:520px",
      "padding:10px 12px",
      "border:1px solid #b91c1c",
      "background:#fef2f2",
      "color:#7f1d1d",
      "font:13px/1.4 system-ui,-apple-system,Segoe UI,sans-serif",
      "box-shadow:0 8px 20px rgba(0,0,0,.18)"
    ].join(";");
    document.documentElement.appendChild(box);
  }

  async function loadRuntime() {
    const targetWindow = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
    const devConfig = Object.freeze({
      bootstrapVersion: "2.9.0-dev.1",
      origin: devOrigin
    });
    const source = await requestText(runtimeUrl);
    new Function("targetWindow", "KatanaHelpersDevConfig", "GM_xmlhttpRequest", source + "\n//# sourceURL=" + runtimeUrl)(
      targetWindow,
      devConfig,
      typeof GM_xmlhttpRequest === "function" ? GM_xmlhttpRequest : null
    );
  }

  loadRuntime().catch(showBootstrapFailure);
})();
