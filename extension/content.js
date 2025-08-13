(function() {
  "use strict";

  /**
   * Injects the page hook script into the page context, so we can safely
   * wrap built-ins without the Chrome content-script sandbox getting in the way.
   */
  function injectPageHook() {
    try {
      const scriptEl = document.createElement("script");
      scriptEl.src = chrome.runtime.getURL("pageHook.js");
      scriptEl.async = false;
      // Carry extension ID for potential diagnostics
      scriptEl.dataset.mctExtensionId = chrome.runtime.id;
      (document.documentElement || document.head || document.body).appendChild(scriptEl);
      // Clean up node after it loads to keep DOM clean
      scriptEl.addEventListener("load", () => scriptEl.remove());
    } catch (error) {
      // Non-fatal; extension still runs without injection
      console.warn("[MCT] Failed to inject pageHook.js", error);
    }
  }

  /**
   * Send initial enabled state to the page hook based on synced storage.
   */
  function sendInitialState() {
    try {
      chrome.storage.sync.get({ mctEnabled: true }, ({ mctEnabled }) => {
        window.postMessage({ type: "MCT:SET_ENABLED", enabled: Boolean(mctEnabled) }, "*");
      });
    } catch (error) {
      console.warn("[MCT] Failed to read initial state", error);
    }
  }

  // Listen for popup messages and forward them to the page context
  chrome.runtime.onMessage.addListener((message) => {
    if (message && message.type === "MCT:SET_ENABLED") {
      window.postMessage({ type: "MCT:SET_ENABLED", enabled: Boolean(message.enabled) }, "*");
    }
  });

  injectPageHook();
  sendInitialState();
})();
