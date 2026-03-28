// Content script: runs in MAIN world (has access to page's window functions)
// Uses CDP element screenshots via bridge.js → background.js
// Hides neighboring panels before each screenshot to prevent overlap.
//
// Diff algorithm lives in e2e/data/diff-algorithm.js, loaded by compare-case.html
// and exposed as window.diffFromImages. This script only handles screenshots
// and orchestration.

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
  if (typeof window.diffFromImages !== "function") {
    console.error("[native-diff-ext] diffFromImages not found — compare-case.html must load diff-algorithm.js");
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

  // 3. Screenshot HTML (CDP clip isolates the element — no need to hide siblings)
  console.log("[native-diff-ext] Taking HTML screenshot...");
  const htmlCapture = await screenshotOne(htmlSelector);

  if (htmlCapture.error) {
    console.error("[native-diff-ext] HTML screenshot failed:", htmlCapture.error);
    window.restoreHtmlAfterCapture();
    return;
  }

  // 4. Screenshot SVG
  console.log("[native-diff-ext] Taking SVG screenshot...");
  const svgCapture = await screenshotOne(svgSelector);

  // 5. Restore HTML chrome
  window.restoreHtmlAfterCapture();

  if (svgCapture.error) {
    console.error("[native-diff-ext] SVG screenshot failed:", svgCapture.error);
    return;
  }

  console.log("[native-diff-ext] Screenshots captured. Running diff...");

  // 6. Run diff via shared algorithm (exposed by compare-case.html)
  const result = await window.diffFromImages(htmlCapture.dataUrl, svgCapture.dataUrl);
  console.log("[native-diff-ext] Done!", result.pixelPct + "% pixel match", result.posPct + "% position-only match");

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

        results[currentCase] = { score: result.pixelPct, posScore: result.posPct, dsl };
        localStorage.setItem("__cr_results", JSON.stringify(results));
        const doneCount = Object.keys(results).length;
        console.log(`[native-diff-ext] Batch: ${currentCase}=${result.pixelPct}% px / ${result.posPct}% pos (${doneCount}/${cases.length})`);
        if (doneCount < cases.length) {
          const idx = cases.indexOf(currentCase);
          if (idx >= 0 && idx + 1 < cases.length) {
            setTimeout(() => {
              window.location.href = `/e2e/tools/compare-case.html?case=${cases[idx + 1]}`;
            }, 200);
          }
        } else {
          const elapsed = ((Date.now() - parseInt(localStorage.getItem("__cr_start") || "0")) / 1000).toFixed(1);
          console.log(`[native-diff-ext] Batch DONE in ${elapsed}s`);
          // Save to IndexedDB for history tracking
          saveBatchToHistory(results, elapsed);
          // Clear batch vars so extension doesn't re-trigger on subsequent page loads
          localStorage.removeItem("__cr_cases");
          localStorage.removeItem("__cr_results");
          localStorage.removeItem("__cr_start");
        }
      }
    }
  } catch (e) { /* batch mode is optional, don't break normal flow */ }
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
    const posScores = Object.values(results).map(r => {
      if (typeof r === "object" && typeof r.posScore === "number") return r.posScore;
      return typeof r === "object" ? r.score : r;
    });
    const average = scores.length > 0
      ? parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
      : 0;
    const averagePos = posScores.length > 0
      ? parseFloat((posScores.reduce((a, b) => a + b, 0) / posScores.length).toFixed(1))
      : average;

    const record = {
      timestamp: new Date().toISOString(),
      elapsed,
      cases: results,
      average,
      averagePos,
      caseCount: Object.keys(results).length,
    };

    const tx = db.transaction("runs", "readwrite");
    tx.objectStore("runs").add(record);
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });

    console.log(`[native-diff-ext] History saved: avg=${average}% px / ${averagePos}% pos, ${Object.keys(results).length} cases`);
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
