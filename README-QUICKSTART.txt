Message Channel Tracker (Chrome Extension)

Quickstart
1) Open Chrome → go to chrome://extensions
2) Enable Developer Mode (top-right)
3) Click "Load unpacked" and select the `extension/` folder in this project
4) Pin the extension. Click the icon to toggle logging On/Off

What it logs
- window.postMessage calls and window "message" events
- MessageChannel creation + MessagePort postMessage and incoming messages
- BroadcastChannel postMessage and incoming messages
- Worker/SharedWorker postMessage and incoming messages

Notes
- Logging is pretty-printed using console groups and colors. It is read-only and non-invasive.
- Toggle is global and stored in chrome.storage.sync under key `mctEnabled`.
- Content script injects a page script to safely wrap built-ins in page context.
