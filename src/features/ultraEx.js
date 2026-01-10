(() => {
  const kh = window.KatanaHelpers = window.KatanaHelpers || {};
  const { constants, utils } = kh;

  const findIngredientsBodyRoot = () => (
    document.querySelector(`${constants.GRID.INGREDIENTS_ID} .ag-body.ag-layout-auto-height`)
    || document.querySelector(`${constants.GRID.INGREDIENTS_ID} .ag-body`)
    || null
  );

  const findIngredientsViewport = (bodyRoot) => {
    if (!bodyRoot) return null;
    return bodyRoot.querySelector(".ag-body-viewport") || null;
  };

  const findCenterColsViewport = (bodyRoot) => {
    if (!bodyRoot) return null;
    return bodyRoot.querySelector(".ag-center-cols-viewport") || null;
  };

  const getAvailabilityCells = (bodyRoot) => {
    const center = findCenterColsViewport(bodyRoot);
    if (!center) return [];
    return Array.from(center.querySelectorAll(`[role="gridcell"][col-id="${constants.GRID.AVAILABILITY_COL_ID}"]`));
  };

  const getRowKeyFromCell = (cell) => {
    const row = cell.closest(".ag-row");
    if (!row) return null;

    return (
      row.getAttribute("row-id")
      || row.getAttribute("row-index")
      || row.getAttribute("aria-rowindex")
      || row.dataset?.rowId
      || row.dataset?.rowIndex
      || row.style?.top
      || null
    );
  };

  const classifyAvailabilityCell = (cell) => {
    const text = utils.normText(cell?.innerText);
    if (!text) return "loading";
    if (text.includes("not available")) return "not_available";
    if (text.includes("in stock")) return "in_stock";
    return "unknown";
  };

  const mergeStatus = (prev, next) => {
    const rank = { in_stock: 0, loading: 1, unknown: 2, not_available: 3 };
    if (!prev) return next;
    return rank[next] > rank[prev] ? next : prev;
  };

  const snapshotVisibleAvailability = (bodyRoot) => {
    const cells = getAvailabilityCells(bodyRoot);

    const out = {
      cellsFound: 0,
      in_stock: 0,
      not_available: 0,
      loading: 0,
      unknown: 0,
      items: [],
    };

    for (const cell of cells) {
      const row = cell.closest(".ag-row");
      if (!row) continue;

      const key = getRowKeyFromCell(cell);
      if (!key) continue;

      const status = classifyAvailabilityCell(cell);
      out.cellsFound += 1;
      out[status] += 1;
      out.items.push({ key, status });
    }

    return out;
  };

  const waitForIngredientsGridHydrated = async ({
    maxWaitMs = constants.CONFIG.ULTRA_MAX_WAIT_FOR_READY_MS,
    pollMs = constants.CONFIG.ULTRA_READY_POLL_MS,
  } = {}) => {
    const start = Date.now();
    let lastError = null;

    const isReady = () => {
      const body = findIngredientsBodyRoot();
      if (!body) return false;
      const vp = findIngredientsViewport(body);
      const center = findCenterColsViewport(body);
      if (!vp || !center) return false;

      const cells = getAvailabilityCells(body);
      if (!cells.length) return false;

      for (const c of cells) {
        const status = classifyAvailabilityCell(c);
        if (status === "in_stock" || status === "not_available") return true;
      }
      return false;
    };

    while (Date.now() - start < maxWaitMs) {
      try {
        if (isReady()) return { ready: true, elapsedMs: Date.now() - start };
      } catch (err) {
        lastError = err;
      }
      await utils.sleep(pollMs);
    }

    if (lastError) utils.log("Grid readiness check error:", lastError);
    return { ready: false, elapsedMs: Date.now() - start };
  };

  const collectAllAvailabilityWithScrolling = async ({
    timeoutMs = constants.CONFIG.ULTRA_SCAN_TIMEOUT_MS,
    passLimit = 3,
    stepFactor = 0.85,
    onUpdate,
  } = {}) => {
    const start = Date.now();

    const bodyRoot = findIngredientsBodyRoot();
    if (!bodyRoot) return { ok: false, reason: "no_body_root", diag: { note: "no #ingredients-grid .ag-body" } };

    const viewport = findIngredientsViewport(bodyRoot);
    if (!viewport) return { ok: false, reason: "no_viewport", diag: { note: "no .ag-body-viewport" } };

    const originalScrollTop = viewport.scrollTop;

    const runOnePass = async (passIndex) => {
      const statusMap = new Map();

      viewport.scrollTop = 0;
      await utils.sleep(90);

      const maxScroll = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
      const step = Math.max(220, Math.floor(viewport.clientHeight * stepFactor));

      let guard = 0;
      const emitUpdate = () => {
        const counts = { in_stock: 0, not_available: 0, loading: 0, unknown: 0 };
        for (const status of statusMap.values()) counts[status] += 1;
        const diag = {
          rowsSeen: statusMap.size,
          ...counts,
          maxScroll: Math.round(viewport.scrollHeight - viewport.clientHeight),
          scrollTop: Math.round(viewport.scrollTop),
          pass: passIndex,
        };
        onUpdate?.(diag);
      };

      while (guard++ < 900) {
        await utils.sleep(60);

        const snap = snapshotVisibleAvailability(bodyRoot);
        for (const it of snap.items) {
          const prev = statusMap.get(it.key);
          statusMap.set(it.key, mergeStatus(prev, it.status));
        }
        emitUpdate();

        if (maxScroll <= 2) break;

        const cur = viewport.scrollTop;
        if (cur >= maxScroll - 2) break;

        const next = Math.min(maxScroll, cur + step);
        if (next === cur) break;

        viewport.scrollTop = next;
      }

      if (viewport.scrollHeight - viewport.clientHeight > 2) {
        viewport.scrollTop = viewport.scrollHeight;
        await utils.sleep(140);

        const snapBottom = snapshotVisibleAvailability(bodyRoot);
        for (const it of snapBottom.items) {
          const prev = statusMap.get(it.key);
          statusMap.set(it.key, mergeStatus(prev, it.status));
        }
      }

      let counts = { in_stock: 0, not_available: 0, loading: 0, unknown: 0 };
      for (const status of statusMap.values()) counts[status] += 1;

      const diag = {
        rowsSeen: statusMap.size,
        ...counts,
        maxScroll: Math.round(viewport.scrollHeight - viewport.clientHeight),
        scrollTop: Math.round(viewport.scrollTop),
        pass: passIndex,
      };

      const ready = diag.rowsSeen > 0 && diag.loading === 0 && diag.unknown === 0;
      return { ready, diag };
    };

    let lastDiag = null;
    let stableCount = 0;

    let pass = 0;
    while (Date.now() - start <= timeoutMs) {
      pass += 1;
      if (pass > passLimit && lastDiag?.loading === 0 && lastDiag?.unknown === 0) break;

      const prevDiag = lastDiag;
      const { ready, diag } = await runOnePass(pass);
      diag.pass = pass;
      lastDiag = diag;

      if (ready && prevDiag) {
        const stableNow =
          prevDiag.rowsSeen === diag.rowsSeen
          && diag.loading === 0
          && diag.unknown === 0;
        stableCount = stableNow ? stableCount + 1 : 0;
      } else {
        stableCount = 0;
      }

      if (ready && stableCount >= 1) {
        viewport.scrollTop = originalScrollTop;

        if (diag.not_available > 0) return { ok: true, allInStock: false, diag };
        if (diag.in_stock === diag.rowsSeen && diag.rowsSeen > 0) return { ok: true, allInStock: true, diag };
        return { ok: false, reason: "inconsistent", diag };
      }

      await utils.sleep(300);
    }

    viewport.scrollTop = originalScrollTop;
    return {
      ok: false,
      reason: "timeout",
      diag: lastDiag || { note: "no diag" },
    };
  };

  const runUltraAfterMoOpen = async (originUrl) => {
    try {
      await utils.waitForSelector(constants.SELECTORS.ENTITY_STATUS_BTN, 20000);
    } catch {
      kh.ui.toast.showToast("Ultra EX stopped: couldn't find MO status control. Finish manually.", 5200);
      return { ok: false, ultraDone: false };
    }

    const ctx0 = kh.features.statusHelper.getEntityStatusContext();
    if (ctx0.mode === "manufacturing" && ctx0.state === "done") {
      history.back();
      return { ok: true, ultraDone: true };
    }

    const stopCountdown = kh.ui.toast.startCountdownToast(
      constants.CONFIG.ULTRA_MAX_WAIT_FOR_READY_MS,
      constants.CONFIG.ULTRA_READY_COUNTDOWN_THRESHOLD_MS,
      (remainingMs) => {
        const secs = (remainingMs / 1000).toFixed(1);
        kh.ui.toast.showToast(`Ultra EX: waiting for grid… ${secs}s`, 1300);
      }
    );

    const readiness = await waitForIngredientsGridHydrated({
      maxWaitMs: constants.CONFIG.ULTRA_MAX_WAIT_FOR_READY_MS,
      pollMs: constants.CONFIG.ULTRA_READY_POLL_MS,
    });
    stopCountdown();

    if (!readiness.ready) {
      kh.ui.toast.showToast("Ultra EX: grid still loading — scanning anyway…", 2400);
    }

    let latestDiag = {
      rowsSeen: 0,
      in_stock: 0,
      not_available: 0,
      loading: 0,
      unknown: 0,
      pass: 1,
      maxScroll: 0,
      scrollTop: 0,
    };

    const scanPassLimit = 3;
    const stopSpinner = kh.ui.toast.startSpinnerToast(() => {
      const d = latestDiag;
      const passText = d.pass ? `pass ${d.pass}` : "pass 1";
      const scrollProbe = constants.DEBUG ? ` | scroll ${d.scrollTop}/${d.maxScroll}` : "";
      return `Ultra EX: scanning… ${passText} | rows ${d.rowsSeen} (in ${d.in_stock}, not ${d.not_available}, load ${d.loading}, unk ${d.unknown})${scrollProbe}`;
    });

    const scanRes = await collectAllAvailabilityWithScrolling({
      timeoutMs: constants.CONFIG.ULTRA_SCAN_TIMEOUT_MS,
      passLimit: scanPassLimit,
      stepFactor: 0.85,
      onUpdate: (diag) => {
        latestDiag = { ...latestDiag, ...diag };
      },
    });
    stopSpinner();

    if (!scanRes.ok) {
      const d = scanRes.diag || {};
      const msg =
        scanRes.reason === "timeout"
          ? `Ultra EX stopped: availability didn’t finish loading (rows=${d.rowsSeen ?? "?"}, blank=${d.loading ?? "?"}, unknown=${d.unknown ?? "?"}). Finish manually.`
          : `Ultra EX stopped: couldn't verify availability (${scanRes.reason}). Finish manually.`;
      kh.ui.toast.showToast(msg, 6500);
      return { ok: false, ultraDone: false };
    }

    if (!scanRes.allInStock) {
      const d = scanRes.diag || {};
      kh.ui.toast.showToast(
        `Ultra EX stopped: not all ingredients are in stock (rows=${d.rowsSeen ?? "?"}, notAvail=${d.not_available ?? "?"}). Finish this MO manually.`,
        6500
      );
      return { ok: false, ultraDone: false };
    }

    const d = scanRes.diag || {};
    kh.ui.toast.showToast(
      `Ultra EX OK — rows: ${d.rowsSeen ?? "?"} (in ${d.in_stock ?? "?"}, not ${d.not_available ?? "?"}, unk ${d.unknown ?? "?"}). Marking Done…`,
      2600
    );

    const doneOk = await kh.features.statusHelper.runMoSetDoneFlow();
    if (!doneOk) {
      kh.ui.toast.showToast("Ultra EX stopped: could not mark MO as Done. Finish manually.", 5600);
      return { ok: false, ultraDone: false };
    }

    kh.ui.toast.showToast("Ultra EX: marked Done. Returning to sales order…", 2200);
    history.back();

    setTimeout(() => {
      if (originUrl && window.location.href.includes("manufacturing")) {
        window.location.href = originUrl;
      }
    }, 2500);

    return { ok: true, ultraDone: true };
  };

  kh.features = kh.features || {};
  kh.features.ultraEx = {
    runUltraAfterMoOpen,
    collectAllAvailabilityWithScrolling,
  };
})();
