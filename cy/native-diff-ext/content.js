// Content script: runs in MAIN world (has access to page's window functions)
// Uses CDP element screenshots via bridge.js → background.js
// Hides neighboring panels before each screenshot to prevent overlap.

// Auto-run on page load
window.addEventListener("load", () => {
  console.log("[native-diff-ext] Page loaded, waiting 1s for renderers...");
  setTimeout(() => {
    console.log("[native-diff-ext] Starting native diff...");
    runNativeDiff();
  }, 1000);
});

// Icon click trigger from bridge.js
window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "native-diff-trigger") {
    console.log("[native-diff-ext] Triggered by icon click");
    runNativeDiff();
  }
});

// Request a single CDP element screenshot via bridge
function screenshotOne(selector) {
  return new Promise((resolve) => {
    function handler(event) {
      if (event.data && event.data.type === "native-diff-screenshot-response") {
        window.removeEventListener("message", handler);
        resolve(event.data);
      }
    }
    window.addEventListener("message", handler);
    window.postMessage({ type: "native-diff-screenshot", selector }, "*");
  });
}

async function runNativeDiff() {
  if (typeof window.prepareHtmlForCapture !== "function") {
    console.error("[native-diff-ext] prepareHtmlForCapture not found");
    return;
  }

  // 1. Prepare: hide HTML chrome (same as skill's page.evaluate step)
  console.log("[native-diff-ext] Preparing HTML for capture...");
  window.prepareHtmlForCapture();

  // 2. Determine selectors
  const htmlSelector = document.querySelector("#html-output .frame")
    ? "#html-output .frame"
    : "#html-output .sequence-diagram";
  const svgSelector = "#svg-output > svg";

  const htmlPanel = document.querySelector("#html-output").closest(".panel");
  const svgPanel = document.querySelector("#svg-output").closest(".panel");
  const diffPanel = document.getElementById("diff-panel");

  // 3. Screenshot HTML: hide SVG panel so it doesn't bleed into the clip region
  console.log("[native-diff-ext] Taking HTML screenshot...");
  svgPanel.style.display = "none";
  if (diffPanel) diffPanel.style.display = "none";
  const htmlCapture = await screenshotOne(htmlSelector);
  svgPanel.style.display = "";

  if (htmlCapture.error) {
    console.error("[native-diff-ext] HTML screenshot failed:", htmlCapture.error);
    window.restoreHtmlAfterCapture();
    if (diffPanel) diffPanel.style.display = "";
    return;
  }

  // 4. Screenshot SVG: hide HTML panel
  console.log("[native-diff-ext] Taking SVG screenshot...");
  htmlPanel.style.display = "none";
  const svgCapture = await screenshotOne(svgSelector);
  htmlPanel.style.display = "";
  if (diffPanel) diffPanel.style.display = "";

  // 5. Restore HTML chrome
  window.restoreHtmlAfterCapture();

  if (svgCapture.error) {
    console.error("[native-diff-ext] SVG screenshot failed:", svgCapture.error);
    return;
  }

  console.log("[native-diff-ext] Screenshots captured. Running diff...");

  // 6. Run diff
  const result = await nativeDiffAlgorithm(htmlCapture.dataUrl, svgCapture.dataUrl);
  console.log("[native-diff-ext] Done!", result.pixelPct + "% pixel match");

  // Post result back for icon-click flow
  window.postMessage({ type: "native-diff-result", result }, "*");

  // Batch mode: if __cr_cases is set in localStorage, save result and auto-advance
  try {
    const batchCases = localStorage.getItem("__cr_cases");
    if (batchCases) {
      const cases = JSON.parse(batchCases);
      const results = JSON.parse(localStorage.getItem("__cr_results") || "{}");
      const currentCase = new URLSearchParams(window.location.search).get("case");
      if (currentCase && !results[currentCase]) {
        // Get the DSL for this case from the page (exposed by compare-case.html)
        const dsl = window.__currentDSL || "";

        results[currentCase] = { score: result.pixelPct, dsl };
        localStorage.setItem("__cr_results", JSON.stringify(results));
        const doneCount = Object.keys(results).length;
        console.log(`[native-diff-ext] Batch: ${currentCase}=${result.pixelPct}% (${doneCount}/${cases.length})`);
        if (doneCount < cases.length) {
          const idx = cases.indexOf(currentCase);
          if (idx >= 0 && idx + 1 < cases.length) {
            setTimeout(() => {
              window.location.href = `/cy/compare-case.html?case=${cases[idx + 1]}`;
            }, 200);
          }
        } else {
          const elapsed = ((Date.now() - parseInt(localStorage.getItem("__cr_start") || "0")) / 1000).toFixed(1);
          console.log(`[native-diff-ext] Batch DONE in ${elapsed}s`);
          // Save to IndexedDB for history tracking
          saveBatchToHistory(results, elapsed);
        }
      }
    }
  } catch (e) { /* batch mode is optional, don't break normal flow */ }
}

// ---- Diff algorithm ----
// Params: LUMA_THRESHOLD=240, CHANNEL_TOLERANCE=12, POSITION_TOLERANCE=0
// Colors: green(0,100,0)=match, red(255,0,0)=HTML-only, blue(0,0,255)=SVG-only, magenta(255,0,255)=color-diff

async function nativeDiffAlgorithm(htmlDataUrl, svgDataUrl) {
  const [htmlImg, svgImg] = await Promise.all([loadImg(htmlDataUrl), loadImg(svgDataUrl)]);

  const w = Math.max(htmlImg.width, svgImg.width);
  const h = Math.max(htmlImg.height, svgImg.height);
  console.log("[native-diff-ext] HTML:", htmlImg.width, "x", htmlImg.height, " SVG:", svgImg.width, "x", svgImg.height, " Compare:", w, "x", h);

  // Draw onto max-sized canvases; shorter side gets white padding (= background).
  // Stride is w for both since canvas width = w. When widths match (normal case),
  // htmlImg.width = svgImg.width = w, so existing stride references are correct.
  const htmlData = getImageData(htmlImg, w, h);
  const svgData = getImageData(svgImg, w, h);

  const LUMA_THRESHOLD = 240;
  const CHANNEL_TOLERANCE = 12;
  const POSITION_TOLERANCE = 0;

  function luma(r, g, b) { return 0.3 * r + 0.59 * g + 0.11 * b; }
  function getPixel(data, W, x, y) { const i = (y * W + x) * 4; return [data[i], data[i+1], data[i+2]]; }
  function pixelsClose(a, b) {
    return Math.abs(a[0]-b[0]) <= CHANNEL_TOLERANCE &&
           Math.abs(a[1]-b[1]) <= CHANNEL_TOLERANCE &&
           Math.abs(a[2]-b[2]) <= CHANNEL_TOLERANCE;
  }

  function hasNearbyMatch(srcData, srcW, dstData, dstW, x, y) {
    const p1 = getPixel(srcData, srcW, x, y);
    for (let dy = -POSITION_TOLERANCE; dy <= POSITION_TOLERANCE; dy++) {
      for (let dx = -POSITION_TOLERANCE; dx <= POSITION_TOLERANCE; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const p2 = getPixel(dstData, dstW, nx, ny);
        if (luma(...p2) < LUMA_THRESHOLD && pixelsClose(p1, p2)) return true;
      }
    }
    return false;
  }

  const diffCanvas = document.createElement("canvas");
  diffCanvas.width = w;
  diffCanvas.height = h;
  const ctx = diffCanvas.getContext("2d");
  const diffImg = ctx.createImageData(w, h);
  const diff = diffImg.data;

  let total = 0, matched = 0, htmlOnly = 0, svgOnly = 0, colorDiff = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const pA = getPixel(htmlData, htmlImg.width, x, y);
      const pB = getPixel(svgData, svgImg.width, x, y);
      const isA = luma(...pA) < LUMA_THRESHOLD;
      const isB = luma(...pB) < LUMA_THRESHOLD;
      const di = (y * w + x) * 4;

      if (!isA && !isB) {
        diff[di] = 240; diff[di+1] = 240; diff[di+2] = 240; diff[di+3] = 255;
        continue;
      }

      total++;
      const matchAB = hasNearbyMatch(htmlData, htmlImg.width, svgData, svgImg.width, x, y);
      const matchBA = hasNearbyMatch(svgData, svgImg.width, htmlData, htmlImg.width, x, y);

      if (isA && isB) {
        if (matchAB || matchBA) {
          matched++; diff[di] = 0; diff[di+1] = 100; diff[di+2] = 0;
        } else {
          colorDiff++; diff[di] = 255; diff[di+1] = 0; diff[di+2] = 255;
        }
      } else if (isA) {
        if (matchAB) {
          matched++; diff[di] = 0; diff[di+1] = 100; diff[di+2] = 0;
        } else {
          htmlOnly++; diff[di] = 255; diff[di+1] = 0; diff[di+2] = 0;
        }
      } else {
        if (matchBA) {
          matched++; diff[di] = 0; diff[di+1] = 100; diff[di+2] = 0;
        } else {
          svgOnly++; diff[di] = 0; diff[di+1] = 0; diff[di+2] = 255;
        }
      }
      diff[di+3] = 255;
    }
  }

  ctx.putImageData(diffImg, 0, 0);

  // Display on page
  const diffOutput = document.getElementById("diff-output");
  diffOutput.innerHTML = "";
  diffOutput.appendChild(diffCanvas);
  document.getElementById("diff-panel").classList.add("visible");

  const pixelPct = total > 0 ? (matched / total * 100).toFixed(1) : "0.0";
  document.getElementById("match-badge").innerHTML =
    `<b>${pixelPct}%</b> native pixel match (${matched}/${total} px) ` +
    `<span style="color:#006400">■</span> match ` +
    `<span style="color:#ff0000">■</span> HTML-only (${htmlOnly}) ` +
    `<span style="color:#0000ff">■</span> SVG-only (${svgOnly}) ` +
    `<span style="color:#ff00ff">■</span> color diff (${colorDiff})`;

  return { pixelPct: parseFloat(pixelPct), matched, total, htmlOnly, svgOnly, colorDiff };
}

function loadImg(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}

function getImageData(img, w, h) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, w, h).data;
}

// ---- IndexedDB history storage ----
// Database: "canonical-history", store: "runs"
// Each run: { timestamp, elapsed, cases: { name: { score, dsl } }, average }

function openHistoryDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("canonical-history", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("runs")) {
        db.createObjectStore("runs", { keyPath: "timestamp" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveBatchToHistory(results, elapsed) {
  try {
    const db = await openHistoryDB();
    const scores = Object.values(results).map(r => typeof r === "object" ? r.score : r);
    const average = scores.length > 0
      ? parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
      : 0;

    const record = {
      timestamp: new Date().toISOString(),
      elapsed,
      cases: results,
      average,
      caseCount: Object.keys(results).length,
    };

    const tx = db.transaction("runs", "readwrite");
    tx.objectStore("runs").add(record);
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });

    console.log(`[native-diff-ext] History saved: avg=${average}%, ${Object.keys(results).length} cases`);
    db.close();
  } catch (e) {
    console.error("[native-diff-ext] Failed to save history:", e);
  }
}

// Expose history reader for dashboard pages
window.__getCanonicalHistory = async function() {
  const db = await openHistoryDB();
  const tx = db.transaction("runs", "readonly");
  const store = tx.objectStore("runs");
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => { db.close(); resolve(req.result); };
    req.onerror = () => { db.close(); reject(req.error); };
  });
};
