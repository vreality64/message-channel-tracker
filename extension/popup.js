(function() {
  "use strict";

  const enabledToggle = document.getElementById("enabledToggle");
  const statusLabel = document.getElementById("statusLabel");

  function setUi(enabled) {
    enabledToggle.checked = Boolean(enabled);
    statusLabel.textContent = enabled ? "On" : "Off";
    statusLabel.classList.toggle("on", enabled);
    statusLabel.classList.toggle("off", !enabled);
  }

  function sendToggleToActiveTab(enabled) {
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
  }

  document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get({ mctEnabled: true }, ({ mctEnabled }) => {
      setUi(Boolean(mctEnabled));
    });

    enabledToggle.addEventListener("change", (e) => {
      const enabled = Boolean(enabledToggle.checked);
      chrome.storage.sync.set({ mctEnabled: enabled }, () => {
        setUi(enabled);
        sendToggleToActiveTab(enabled);
      });
    });
  });
})();
