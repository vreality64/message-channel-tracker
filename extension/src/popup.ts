(() => {
  const enabledToggle = document.getElementById("enabledToggle") as HTMLInputElement;
  const statusLabel = document.getElementById("statusLabel") as HTMLElement;
  const titleEl = document.getElementById("title") as HTMLElement;
  const previewLengthInput = document.getElementById("previewLength") as HTMLInputElement;
  const previewLengthValue = document.getElementById("previewLengthValue") as HTMLElement;

  function applyI18n(): void {
    try {
      // Static labels
      if (titleEl) titleEl.textContent = chrome.i18n.getMessage("appTitle") || titleEl.textContent;
      // Title of the document
      document.title = chrome.i18n.getMessage("appTitle") || document.title;
    } catch {}
  }

  const setUi = (enabled: boolean, previewLength = 10): void => {
    enabledToggle.checked = !!enabled;
    const onText = chrome?.i18n?.getMessage?.("statusOn") || "On";
    const offText = chrome?.i18n?.getMessage?.("statusOff") || "Off";
    statusLabel.textContent = enabled ? onText : offText;
    statusLabel.classList.toggle("on", enabled);
    statusLabel.classList.toggle("off", !enabled);
    
    // Set preview length
    previewLengthInput.value = previewLength.toString();
    previewLengthValue.textContent = previewLength.toString();
    
    // Update extension icon based on enabled state
    updateExtensionIcon(enabled);
  };

  const updateExtensionIcon = (enabled: boolean): void => {
    try {
      const iconPath = enabled ? {
        "16": "icon-16-active.png",
        "32": "icon-32-active.png"
      } : {
        "16": "icon-16.png",
        "32": "icon-32.png"
      };
      
      console.log("[MCT] Updating icon to:", enabled ? "active (blue)" : "inactive (gray)", iconPath);
      chrome.action.setIcon({ path: iconPath }, () => {
        if (chrome.runtime.lastError) {
          console.error("[MCT] Icon update failed:", chrome.runtime.lastError);
        } else {
          console.log("[MCT] Icon updated successfully");
        }
      });
    } catch (error) {
      console.warn("[MCT] Failed to update extension icon", error);
    }
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
    // Load persisted state and reflect in UI, then sync to active tab
    try {
      chrome.storage.sync.get({ mctEnabled: false, mctPreviewLength: 10 }, ({ mctEnabled, mctPreviewLength }: { mctEnabled: boolean; mctPreviewLength: number }) => {
        const enabled = !!mctEnabled;
        const previewLength = mctPreviewLength || 10;
        setUi(enabled, previewLength);
        withActiveTab((tabId) => ensureTrackerAndPost(tabId, { type: "MCT:SET_ENABLED", enabled, previewLength }));
      });
    } catch {}

    enabledToggle.addEventListener("change", () => {
      const enabled = !!enabledToggle.checked;
      const previewLength = Number.parseInt(previewLengthInput.value) || 10;
      setUi(enabled, previewLength);
      try {
        chrome.storage.sync.set({ mctEnabled: enabled, mctPreviewLength: previewLength });
      } catch {}
      withActiveTab((tabId) =>
        ensureTrackerAndPost(tabId, { type: "MCT:SET_ENABLED", enabled, previewLength }),
      );
    });

    previewLengthInput.addEventListener("input", () => {
      const enabled = !!enabledToggle.checked;
      const previewLength = Number.parseInt(previewLengthInput.value) || 10;
      previewLengthValue.textContent = previewLength.toString();
      try {
        chrome.storage.sync.set({ mctPreviewLength: previewLength });
      } catch {}
      withActiveTab((tabId) =>
        ensureTrackerAndPost(tabId, { type: "MCT:SET_PREVIEW_LENGTH", previewLength }),
      );
    });

  });
})();