# Message Channel Tracker

English | [한국어](README.ko.md)

## Links
- Docs: https://vreality64.github.io/message-channel-tracker/
- Playground: https://vreality64.github.io/message-channel-tracker/playground/

## Descriptions

A Chrome extension to observe browser message flows without breaking them. It neatly logs to the DevTools console with grouping and colors for:
- `window.postMessage` calls and `window` "message" events
- `MessageChannel` creation and `MessagePort` postMessage / incoming messages
- `BroadcastChannel` postMessage / incoming messages
- `Worker` / `SharedWorker` postMessage / incoming messages
- `ServiceWorker` postMessage and incoming messages

## Features
- **Visual Status Indicator**: Extension icon changes color based on enabled/disabled state
- **Message Preview**: First 10 characters of message content shown in console group titles
- **Toggle Control**: On/off toggle state stored in `chrome.storage.sync` under the `mctEnabled` key

## Quick Start
- Open the extension management page (macOS helper script):
```bash
./scripts/dev.sh
```
- In Chrome:
  - Enable Developer mode (top right)
  - Click "Load unpacked" and select the `extension/` folder
  - Pin the extension and toggle On/Off via the icon

## Playground (Test Page)
Use the built-in playground to easily test all message channels locally.

1) Run a simple static server:
```bash
./scripts/serve.sh 5173
```
2) Open `http://localhost:5173/playground/`
3) Open DevTools console and toggle logging On via the extension popup
4) Use the buttons in each card to try:
   - window.postMessage (self / iframe / cross-origin)
   - MessageChannel / MessagePort
   - BroadcastChannel
   - Worker / SharedWorker
   - Service Worker

Files:
- `playground/index.html`: demo UI
- `playground/playground.js`: interaction scripts
- `playground/iframe.html`: child frame reply demo
- `playground/worker.js`: Dedicated Worker echo
- `playground/shared-worker.js`: SharedWorker echo/broadcast
- `playground/sw.js`: Service Worker echo/broadcast

## Verify it works
From any page's DevTools console:
```js
window.postMessage("hello from MCT", "*");
```

## File Structure
- `extension/manifest.json`: Manifest v3. Popup (`popup.html`) and `tracker.js` are web‑accessible only on http/https origins (no `<all_urls>`), aligning with Chrome Web Store permissions policy.
- `extension/content.js`: Injects `tracker.js`, passes stored toggle state, and relays `MCT:SET_ENABLED` messages from the popup.
- `extension/tracker.js`: Instrumentation in the page context. Wraps and logs:
  - `window.postMessage` / `window` `message` events
  - `MessagePort` / `MessageChannel`
  - `BroadcastChannel`
  - `Worker` / `SharedWorker`
  - `ServiceWorker` messages
  Uses console groups and styles, toggled by `MCT:SET_ENABLED`.
- `extension/popup.html`, `extension/popup.js`, `extension/popup.css`: popup toggle UI storing state in `chrome.storage.sync` and sending toggle messages to the current tab's `content.js`.
- `scripts/dev.sh`: helper script to open Chrome's extension page and print loading instructions.
- `README-QUICKSTART.txt`: manual load steps and targets summary.

## Permissions
- `activeTab`
- `scripting`

## Notes
- Logging is read-only and designed to avoid altering original behavior.
- To avoid content script sandboxing limits, `tracker.js` is injected into the page context.

## Formatting

### Pretty JSON
- Pretty printing is always enabled. Payloads are formatted for readability:
  - Tries to `JSON.parse` string values that look like JSON
  - Prints objects/arrays with indentation and syntax styling
- The popup only controls On/Off for tracking; no separate pretty option.
