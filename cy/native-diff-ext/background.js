// Background service worker: uses chrome.debugger + CDP for element screenshots

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.url || !tab.url.includes("compare-case.html")) return;
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: "native-diff" });
    console.log("[native-diff-ext bg]", response?.error || `Done: ${response?.pixelPct}%`);
  } catch (err) {
    console.error("[native-diff-ext bg] Failed:", err);
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "cdp-screenshot") {
    cdpScreenshot(sender.tab.id, msg.selector)
      .then((dataUrl) => sendResponse({ dataUrl }))
      .catch((err) => sendResponse({ error: err.message }));
    return true;
  }
});

// Take a single element screenshot
async function cdpScreenshot(tabId, selector) {
  const target = { tabId };

  try {
    await chrome.debugger.attach(target, "1.3");
    const { root } = await cdp(target, "DOM.getDocument", {});
    return await screenshotNode(target, root.nodeId, selector);
  } finally {
    try { await chrome.debugger.detach(target); } catch (_) {}
  }
}

async function screenshotNode(target, rootNodeId, selector) {
  const { nodeId } = await cdp(target, "DOM.querySelector", {
    nodeId: rootNodeId,
    selector,
  });
  if (!nodeId) throw new Error(`Element not found: ${selector}`);

  const { model } = await cdp(target, "DOM.getBoxModel", { nodeId });
  const border = model.border;
  const x = border[0];
  const y = border[1];
  const width = border[2] - border[0];
  const height = border[5] - border[1];

  const { data } = await cdp(target, "Page.captureScreenshot", {
    format: "png",
    clip: { x, y, width, height, scale: 1 },
    captureBeyondViewport: true,
  });

  return "data:image/png;base64," + data;
}

function cdp(target, method, params) {
  return chrome.debugger.sendCommand(target, method, params);
}
