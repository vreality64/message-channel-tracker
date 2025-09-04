(() => {
  /**
   * Injects the page hook script into the page context, so we can safely
   * wrap built-ins without the Chrome content-script sandbox getting in the way.
   */
  const injectTracker = (): void => {
    try {
      const scriptEl = document.createElement("script");
      scriptEl.src = chrome.runtime.getURL("dist/tracker.js");
      scriptEl.async = false;
      // Carry extension ID for potential diagnostics
      scriptEl.dataset.mctExtensionId = chrome.runtime.id;
      (document.documentElement || document.head || document.body).appendChild(scriptEl);
      // Clean up node after it loads to keep DOM clean
      scriptEl.addEventListener("load", () => scriptEl.remove());
    } catch (error) {
      // Non-fatal; extension still runs without injection
      console.warn("[MCT] Failed to inject tracker.js", error);
    }
  };

  /**
   * Send initial enabled state to the page hook based on synced storage.
   */
  const sendInitialState = (): void => {
    try {
      chrome.storage.sync.get({ mctEnabled: true }, ({ mctEnabled }: { mctEnabled: boolean }) => {
        window.postMessage({ type: "MCT:SET_ENABLED", enabled: !!mctEnabled }, "*");
      });
    } catch (error) {
      console.warn("[MCT] Failed to read initial state", error);
    }
  };

  // Types for message handling
  interface MCTMessage {
    type: string;
    enabled?: boolean;
    pretty?: boolean;
  }

  // Listen for popup messages and forward them to the page context
  // In activeTab mode the popup executes directly in tab; keep this for backward compat if messages are sent
  chrome.runtime.onMessage.addListener((message: MCTMessage) => {
    if (message && message.type === "MCT:SET_ENABLED") {
      window.postMessage({ type: "MCT:SET_ENABLED", enabled: !!message.enabled }, "*");
    } else if (message && message.type === "MCT:SET_PRETTY_JSON") {
      window.postMessage({ type: "MCT:SET_PRETTY_JSON", pretty: !!message.pretty }, "*");
    }
  });

  // Storage propagation not required in activeTab-mode; keep logic minimal

  injectTracker();
  sendInitialState();
})();
