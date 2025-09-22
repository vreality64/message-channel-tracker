# message-channel-tracker

## 2.3.0

### Minor Changes

- ## New Features

  ### Visual Status Indicator

  - Extension icon now changes color based on enabled/disabled state
  - Gray gradient for disabled state (transparent background)
  - Blue gradient for enabled state (matching website favicon)
  - No need to click the extension to check if it's active

  ### Message Preview Options

  - Added preview length slider in popup (0-50 characters)
  - Real-time preview length adjustment
  - Settings saved in chrome.storage.sync for synchronization
  - Preview color changed to purple italic for better visibility

  ### UI Improvements

  - Removed pretty print hint text from popup for cleaner interface
  - Added range slider with visual feedback
  - Improved popup styling and layout

  ### Icon Design Updates

  - Transparent background for inactive state
  - Consistent with website favicon design for active state
  - Better integration with browser themes

## 2.2.0

### Minor Changes

- ## New Features

  ### Visual Status Indicator

  - Extension icon now changes color based on enabled/disabled state
  - Blue gradient for disabled state, green gradient for enabled state
  - No need to click the extension to check if it's active

  ### Message Preview

  - First 10 characters of message content now shown in console group titles
  - Works for all message types: window.postMessage, MessagePort, BroadcastChannel, Worker, ServiceWorker
  - Makes debugging easier by showing message content without expanding groups

  ### Updated Documentation

  - README files updated with new features
  - Web store descriptions updated
  - Playground updated with preview functionality

## 2.0.1

### Patch Changes

- [`c317795`](https://github.com/vreality64/message-channel-tracker/commit/c317795b93a90f68dd4ea8790182da799c1ceec0) Thanks [@vreality64](https://github.com/vreality64)! - Narrow web_accessible_resources to http/https origins to align with Chrome Web Store permissions policy.

## 2.0.0

### Major Changes

- [`3497cad`](https://github.com/vreality64/message-channel-tracker/commit/3497cad9f840f5d3d11db8451c6c14cfbac35bb1) Thanks [@vreality64](https://github.com/vreality64)! - Switch to activeTab + scripting; per-tab ephemeral toggle.

  - Drop tabs permission and persistent content script
  - Execute in active tab on user gesture and inject tracker only when needed
  - Update docs and webstore descriptions to reflect minimal, scoped permissions
  - Improves user trust and store review friendliness

## 1.0.4

### Patch Changes

- 5e12f50: migrate to typescript
