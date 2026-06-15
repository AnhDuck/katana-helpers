const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const version = "2.12.0";
const devBootstrapVersion = "2.9.0-dev.1";
const devOrigin = process.env.KATANA_HELPERS_DEV_ORIGIN || "http://127.0.0.1:5174";

const sourceFiles = [
  "src/core/constants.js",
  "src/core/utils.js",
  "src/core/storage.js",
  "src/ui/styles.js",
  "src/ui/toast.js",
  "src/ui/hud.js",
  "src/ui/moTimer.js",
  "src/features/statusHelper.js",
  "src/features/createMo.js",
  "src/features/createPo.js",
  "src/features/doneAndReturn.js",
  "src/features/ultraEx.js",
  "src/features/soEx.js",
  "src/features/etsyButton.js",
  "src/features/poSupplierShortcut.js",
  "src/features/simplyPrintNav.js",
  "src/init.js",
];

function userscriptHeader({ name, scriptVersion, description, updateUrls = false, devUpdateUrls = false, devConnect = false, release = false }) {
  const updateUrlLines = updateUrls
    ? `// @updateURL    https://raw.githubusercontent.com/AnhDuck/katana-helpers/main/userscript/katana-helpers.release.user.js
// @downloadURL  https://raw.githubusercontent.com/AnhDuck/katana-helpers/main/userscript/katana-helpers.release.user.js
`
    : "";
  const devUpdateUrlLines = devUpdateUrls
    ? `// @updateURL    ${devOrigin}/userscript/katana-helpers.dev.user.js
// @downloadURL  ${devOrigin}/userscript/katana-helpers.dev.user.js
`
    : "";
  const grantLines = release
    ? "// @grant        none\n"
    : `// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
`;
  const devConnectLines = devConnect
    ? `// @connect      127.0.0.1
// @connect      localhost
`
    : "";

  return `// ==UserScript==
// @name         ${name}
// @namespace    https://factory.katanamrp.com/
// @version      ${scriptVersion}
// @description  ${description}
// @match        https://factory.katanamrp.com/*
${updateUrlLines}${devUpdateUrlLines}// @run-at       document-idle
${grantLines}${devConnectLines}// ==/UserScript==
`;
}

const releaseHeader = userscriptHeader({
  name: "Katana Helpers",
  scriptVersion: version,
  description: "Workflow helpers for Katana MRP.",
  updateUrls: true,
  release: true,
});

function devLoaderScript() {
  const devHeader = userscriptHeader({
    name: "Katana Helpers Dev",
    scriptVersion: devBootstrapVersion,
    description: "Runtime loader for local Katana Helpers modules.",
    devUpdateUrls: true,
    devConnect: true,
  });

  return `${devHeader}
(function () {
  const devOrigin = ${JSON.stringify(devOrigin)};
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
      bootstrapVersion: ${JSON.stringify(devBootstrapVersion)},
      origin: devOrigin
    });
    const source = await requestText(runtimeUrl);
    new Function("targetWindow", "KatanaHelpersDevConfig", "GM_xmlhttpRequest", source + "\\n//# sourceURL=" + runtimeUrl)(
      targetWindow,
      devConfig,
      typeof GM_xmlhttpRequest === "function" ? GM_xmlhttpRequest : null
    );
  }

  loadRuntime().catch(showBootstrapFailure);
})();
`;
}

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8").trim();
}

function build() {
  const missing = sourceFiles.filter((file) => !fs.existsSync(path.join(root, file)));
  if (missing.length) {
    throw new Error(`Missing files:\n${missing.join("\n")}`);
  }

  const body = sourceFiles
    .map((file) => `\n/* ${file} */\n${read(file)}\n`)
    .join("\n");

  const output = `${releaseHeader}\n${body}`;
  const distDir = path.join(root, "dist");
  const userscriptDir = path.join(root, "userscript");
  fs.mkdirSync(distDir, { recursive: true });
  fs.mkdirSync(userscriptDir, { recursive: true });
  fs.writeFileSync(path.join(distDir, "katana-helpers.user.js"), output);
  fs.writeFileSync(path.join(distDir, "katana-helpers.modules.json"), `${JSON.stringify({ files: sourceFiles }, null, 2)}\n`);
  fs.writeFileSync(path.join(userscriptDir, "katana-helpers.release.user.js"), output);
  fs.writeFileSync(path.join(userscriptDir, "katana-helpers.dev.user.js"), devLoaderScript());
  console.log(`Built ${sourceFiles.length} modules into dist/katana-helpers.user.js`);
  console.log("Updated userscript/katana-helpers.dev.user.js");
}

if (require.main === module) {
  build();
}

module.exports = {
  build,
  devBootstrapVersion,
  root,
  sourceFiles,
  version,
};
