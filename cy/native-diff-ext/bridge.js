// Bridge script: runs in ISOLATED world
// Relays messages between content.js (MAIN world) and background.js (service worker)

// Content.js → bridge → background.js: screenshot requests
window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "native-diff-screenshot") {
    console.log("[native-diff-ext bridge] Screenshot request:", event.data.selector);
    chrome.runtime.sendMessage(
      { action: "cdp-screenshot", selector: event.data.selector },
      (response) => {
        window.postMessage({
          type: "native-diff-screenshot-response",
          dataUrl: response?.dataUrl,
          error: response?.error,
        }, "*");
      }
    );
  }
});

// Icon click → content.js: trigger diff
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "native-diff") {
    window.postMessage({ type: "native-diff-trigger" }, "*");
  }
});
