(() => {
  const enabledToggle = document.getElementById("enabledToggle");
  const statusLabel = document.getElementById("statusLabel");
  const prettyToggle = document.getElementById("prettyToggle");

  const setUi = (enabled) => {
    enabledToggle.checked = Boolean(enabled);
    statusLabel.textContent = enabled ? "On" : "Off";
    statusLabel.classList.toggle("on", enabled);
    statusLabel.classList.toggle("off", !enabled);
  };

  const sendToggleToActiveTab = (enabled) => {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = Array.isArray(tabs) ? tabs[0] : null;
        if (tab && tab.id != null) {
          chrome.tabs.sendMessage(tab.id, { type: "MCT:SET_ENABLED", enabled });
        }
      });
    } catch (error) {
      // Non-fatal in popup
      console.warn("[MCT] Failed to message active tab", error);
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get(
      { mctEnabled: true, mctPrettyJson: false },
      ({ mctEnabled, mctPrettyJson }) => {
        setUi(Boolean(mctEnabled));
        if (prettyToggle) prettyToggle.checked = Boolean(mctPrettyJson);
      },
    );

    enabledToggle.addEventListener("change", (e) => {
      const enabled = Boolean(enabledToggle.checked);
      chrome.storage.sync.set({ mctEnabled: enabled }, () => {
        setUi(enabled);
        sendToggleToActiveTab(enabled);
      });
    });

    prettyToggle?.addEventListener("change", () => {
      const pretty = Boolean(prettyToggle.checked);
      chrome.storage.sync.set({ mctPrettyJson: pretty }, () => {
        try {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = Array.isArray(tabs) ? tabs[0] : null;
            if (tab && tab.id != null) {
              chrome.tabs.sendMessage(tab.id, { type: "MCT:SET_PRETTY_JSON", pretty });
            }
          });
        } catch {}
      });
    });
  });
})();
