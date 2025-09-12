# Message Channel Tracker

Observe browser message flows without breaking them. MCT neatly groups and colors logs in DevTools for:

- window.postMessage and window "message" events
- MessageChannel creation and MessagePort postMessage/incoming messages
- BroadcastChannel postMessage/incoming messages
- Worker/SharedWorker postMessage/incoming messages
- ServiceWorker postMessage/incoming messages

## Highlights
- Non‑intrusive: read‑only wrappers preserve original behavior
- Visual Status: extension icon changes color based on enabled/disabled state
- Message Preview: first 10 characters of message content shown in console group titles
- Toggleable: enable/disable from the extension popup
- Pretty JSON: always-on prettified payload logging
- Console‑first UX: thread‑like grouping, colored arrows, timestamps

## Quick Start
1. Install and pin the extension
2. Open DevTools console
3. Use the popup to toggle logging
4. Try `window.postMessage("hello from MCT", "*")`

## Permissions
- activeTab (user-gesture scoped, active tab only)
- scripting (inject a small helper to post toggle messages)

## Source / Docs / Playground
- Source: https://github.com/vreality64/message-channel-tracker
- Docs: https://vreality64.github.io/message-channel-tracker/
- Playground: https://vreality64.github.io/message-channel-tracker/playground/
