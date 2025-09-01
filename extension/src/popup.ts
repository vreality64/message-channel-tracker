(() => {
  const enabledToggle = document.getElementById("enabledToggle") as HTMLInputElement;
  const statusLabel = document.getElementById("statusLabel") as HTMLElement;
  const prettyToggle = document.getElementById("prettyToggle") as HTMLInputElement;
  const titleEl = document.getElementById("title") as HTMLElement;
  const prettyLabel = document.getElementById("prettyLabel") as HTMLElement;
  const hint = document.getElementById("hint") as HTMLElement;

  function applyI18n(): void {
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

  const setUi = (enabled: boolean): void => {
    enabledToggle.checked = !!enabled;
    const onText = chrome?.i18n?.getMessage?.("statusOn") || "On";
    const offText = chrome?.i18n?.getMessage?.("statusOff") || "Off";
    statusLabel.textContent = enabled ? onText : offText;
    statusLabel.classList.toggle("on", enabled);
    statusLabel.classList.toggle("off", !enabled);
  };

  // No tabs permission: propagate via storage change observed by content script
  const persistEnabled = (enabled: boolean): void => {
    chrome.storage.sync.set({ mctEnabled: enabled }, () => setUi(enabled));
  };

  document.addEventListener("DOMContentLoaded", () => {
    applyI18n();
    chrome.storage.sync.get({ mctEnabled: true, mctPrettyJson: false }, ({ mctEnabled, mctPrettyJson }: { mctEnabled: boolean; mctPrettyJson: boolean }) => {
      setUi(!!mctEnabled);
      if (prettyToggle) prettyToggle.checked = !!mctPrettyJson;
    });

    enabledToggle.addEventListener("change", () => persistEnabled(!!enabledToggle.checked));

    prettyToggle?.addEventListener("change", () => {
      const pretty = !!prettyToggle.checked;
      chrome.storage.sync.set({ mctPrettyJson: pretty }, () => {});
    });
  });
})();
