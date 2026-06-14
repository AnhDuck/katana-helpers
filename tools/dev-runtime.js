(function () {
  const pageWindow = typeof targetWindow !== "undefined" ? targetWindow : window;
  const targetDocument = pageWindow.document;
  const devConfig = (
    typeof KatanaHelpersDevConfig !== "undefined" &&
    KatanaHelpersDevConfig &&
    typeof KatanaHelpersDevConfig === "object"
  ) ? KatanaHelpersDevConfig : pageWindow.KatanaHelpersDev || {};
  const devOrigin = devConfig.origin || "http://127.0.0.1:5174";
  const bundleUrl = devOrigin + "/katana-helpers.dev-bundle.js";
  const statusUrl = devOrigin + "/katana-helpers.dev-status.json";

  function installedBootstrapVersion() {
    if (devConfig.bootstrapVersion) return devConfig.bootstrapVersion;
    if (typeof GM_info !== "undefined" && GM_info?.script?.version) return GM_info.script.version;
    return "unknown";
  }

  function withCacheBust(url) {
    return url + (url.includes("?") ? "&" : "?") + "t=" + Date.now();
  }

  function requestText(url) {
    if (typeof GM_xmlhttpRequest === "function") {
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
          },
        });
      });
    }

    return fetch(withCacheBust(url), { cache: "no-store" }).then((response) => {
      if (response.ok) return response.text();
      throw new Error("HTTP " + response.status + " for " + url);
    });
  }

  function showLoadFailure(error) {
    console.error("[Katana Helpers Dev] Failed to load local modules", error);
    const box = targetDocument.createElement("div");
    box.textContent = "Katana Helpers Dev failed to load from " + devOrigin + ": " + error.message;
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
      "box-shadow:0 8px 20px rgba(0,0,0,.18)",
    ].join(";");
    targetDocument.documentElement.appendChild(box);
  }

  function ensureDevStatusStyles() {
    if (targetDocument.getElementById("kh-dev-status-styles")) return;
    const css = `
      .kh-dev-status {
        align-items: center;
        background: #0f172a;
        border: 1px solid rgba(255,255,255,.18);
        border-radius: 6px;
        bottom: 12px;
        box-shadow: 0 8px 22px rgba(0,0,0,.24);
        color: #fff;
        display: flex;
        flex-wrap: wrap;
        font: 12px/1.3 system-ui, -apple-system, Segoe UI, sans-serif;
        gap: 8px;
        left: 12px;
        max-width: min(680px, calc(100vw - 24px));
        padding: 8px 10px;
        position: fixed;
        z-index: 2147483646;
      }
      .kh-dev-status[data-state="stale"] {
        background: #451a03;
        border-color: #f59e0b;
      }
      .kh-dev-status button {
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        border-radius: 5px;
        color: #0f172a;
        cursor: pointer;
        font: 700 12px/1.2 system-ui, -apple-system, Segoe UI, sans-serif;
        padding: 5px 8px;
      }
      .kh-dev-status button:hover { background: #e2e8f0; }
      .kh-dev-status .kh-dev-status-close {
        background: transparent;
        border-color: transparent;
        color: inherit;
        padding: 2px 5px;
      }
    `;
    const style = targetDocument.createElement("style");
    style.id = "kh-dev-status-styles";
    style.textContent = css;
    targetDocument.head.append(style);
  }

  function openUrl(url) {
    pageWindow.open(url, "_blank", "noopener");
  }

  function renderDevStatus(status) {
    ensureDevStatusStyles();
    const installed = installedBootstrapVersion();
    const expected = status.bootstrapVersion || "unknown";
    const state = installed === "unknown" ? "unknown" : installed === expected ? "ok" : "stale";
    const existing = targetDocument.getElementById("kh-dev-status");
    const node = existing || targetDocument.createElement("div");
    node.id = "kh-dev-status";
    node.className = "kh-dev-status";
    node.dataset.state = state;
    node.textContent = "";

    const summary = targetDocument.createElement("span");
    summary.textContent = [
      "Katana Helpers Dev",
      "App " + (status.appVersion || "unknown"),
      "Bootstrap " + installed,
      "Server " + (status.ok ? "running" : "unknown"),
    ].join(" | ");
    node.append(summary);

    if (state === "stale") {
      const warning = targetDocument.createElement("span");
      warning.textContent = "Bootstrap update available: " + expected;
      node.append(warning);

      if (status.devUserscriptUrl) {
        const update = targetDocument.createElement("button");
        update.type = "button";
        update.textContent = "Update dev script";
        update.addEventListener("click", () => openUrl(status.devUserscriptUrl));
        node.append(update);
      }
    }

    const close = targetDocument.createElement("button");
    close.type = "button";
    close.className = "kh-dev-status-close";
    close.textContent = "x";
    close.title = "Hide dev status for this page";
    close.addEventListener("click", () => node.remove());
    node.append(close);

    if (!existing) targetDocument.documentElement.append(node);
  }

  async function ensureDevStatus() {
    try {
      const status = JSON.parse(await requestText(statusUrl));
      renderDevStatus(status);
    } catch (error) {
      console.warn("[Katana Helpers Dev] Failed to load dev status", error);
    }
  }

  function runBundle(source) {
    const runner = new Function("pageWindow", `
      const window = pageWindow;
      const document = pageWindow.document;
      const navigator = pageWindow.navigator;
      const MutationObserver = pageWindow.MutationObserver;
      const requestAnimationFrame = pageWindow.requestAnimationFrame.bind(pageWindow);
      const setTimeout = pageWindow.setTimeout.bind(pageWindow);
      const clearTimeout = pageWindow.clearTimeout.bind(pageWindow);
      const setInterval = pageWindow.setInterval.bind(pageWindow);
      const clearInterval = pageWindow.clearInterval.bind(pageWindow);
      const MouseEvent = pageWindow.MouseEvent;
      const Event = pageWindow.Event;
      const CustomEvent = pageWindow.CustomEvent;
      const Intl = pageWindow.Intl;
      ${source}
      //# sourceURL=${bundleUrl}
    `);
    runner(pageWindow);
  }

  async function loadLocalBundle() {
    const startedAt = pageWindow.performance.now();
    const source = await requestText(bundleUrl);
    runBundle(source);
    const duration = Math.round(pageWindow.performance.now() - startedAt);
    console.info("[Katana Helpers Dev] Loaded local bundle from " + devOrigin + " in " + duration + "ms");
    ensureDevStatus();
  }

  loadLocalBundle().catch(showLoadFailure);
})();
