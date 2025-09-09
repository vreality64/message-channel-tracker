# message-channel-tracker

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
