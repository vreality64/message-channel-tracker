(() => {
  const enabledToggle = document.getElementById("enabledToggle");
  const statusLabel = document.getElementById("statusLabel");
  const prettyToggle = document.getElementById("prettyToggle");
  const titleEl = document.getElementById("title");
  const prettyLabel = document.getElementById("prettyLabel");
  const hint = document.getElementById("hint");

  function applyI18n() {
    try {
      // Static labels
      if (titleEl) titleEl.textContent = chrome.i18n.getMessage("appTitle") || titleEl.textContent;
      if (prettyLabel)
        prettyLabel.textContent = chrome.i18n.getMessage("prettyJson") || prettyLabel.textContent;
      if (hint) hint.textContent = chrome.i18n.getMessage("prettyHint") || hint.textContent;
      // Title of the document
      document.title = chrome.i18n.getMessage("appTitle") || document.title;
    } catch {}
  }

  const setUi = (enabled) => {
    enabledToggle.checked = !!enabled;
    const onText = chrome?.i18n?.getMessage?.("statusOn") || "On";
    const offText = chrome?.i18n?.getMessage?.("statusOff") || "Off";
    statusLabel.textContent = enabled ? onText : offText;
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
    applyI18n();
    chrome.storage.sync.get({ mctEnabled: true, mctPrettyJson: false }, ({ mctEnabled, mctPrettyJson }) => {
      setUi(!!mctEnabled);
      if (prettyToggle) prettyToggle.checked = !!mctPrettyJson;
    });

    enabledToggle.addEventListener("change", (e) => {
      const enabled = !!enabledToggle.checked;
      chrome.storage.sync.set({ mctEnabled: enabled }, () => {
        setUi(enabled);
        sendToggleToActiveTab(enabled);
      });
    });

    prettyToggle?.addEventListener("change", () => {
      const pretty = !!prettyToggle.checked;
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
