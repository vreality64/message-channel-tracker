(() => {
  const enabledToggle = document.getElementById("enabledToggle") as HTMLInputElement;
  const statusLabel = document.getElementById("statusLabel") as HTMLElement;
  const titleEl = document.getElementById("title") as HTMLElement;
  const hint = document.getElementById("hint") as HTMLElement;

  function applyI18n(): void {
    try {
      // Static labels
      if (titleEl) titleEl.textContent = chrome.i18n.getMessage("appTitle") || titleEl.textContent;
      if (hint) hint.textContent = chrome.i18n.getMessage("prettyHint") || hint.textContent;
      // Title of the document
      document.title = chrome.i18n.getMessage("appTitle") || document.title;
    } catch {}
  }

  const setUi = (enabled: boolean): void => {
    enabledToggle.checked = !!enabled;
    const onText = chrome?.i18n?.getMessage?.("statusOn") || "On";
    const offText = chrome?.i18n?.getMessage?.("statusOff") || "Off";
    statusLabel.textContent = enabled ? onText : offText;
    statusLabel.classList.toggle("on", enabled);
    statusLabel.classList.toggle("off", !enabled);
  };

  function withActiveTab<T>(fn: (tabId: number) => void): void {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
        const tab = Array.isArray(tabs) ? tabs[0] : null;
        if (tab && tab.id != null) fn(tab.id);
      });
    } catch (error) {
      console.warn("[MCT] Failed to get active tab", error);
    }
  }

  function ensureTrackerAndPost(tabId: number, message: unknown): void {
    try {
      chrome.scripting.executeScript({
        target: { tabId },
        func: (msg: unknown) => {
          try {
            const install = () => {
              try {
                // If not yet injected, inject tracker.js into the page context
                // by adding a script tag sourced from the extension.
                if (!(window as any).__MCT_INSTALLED__) {
                  const s = document.createElement("script");
                  // @ts-ignore: runtime is available in content world
                  s.src = chrome.runtime.getURL("dist/tracker.js");
                  s.async = false;
                  (document.documentElement || document.head || document.body)?.appendChild(s);
                }
              } catch {}
            };
            install();
            window.postMessage(msg as any, "*");
          } catch {}
        },
        args: [message],
        world: "ISOLATED",
      });
    } catch (error) {
      console.warn("[MCT] Failed to execute in active tab", error);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyI18n();
    // Default UI state; per-tab and ephemeral
    setUi(false);

    enabledToggle.addEventListener("change", () => {
      const enabled = !!enabledToggle.checked;
      setUi(enabled);
      withActiveTab((tabId) =>
        ensureTrackerAndPost(tabId, { type: "MCT:SET_ENABLED", enabled }),
      );
    });

  });
})();
