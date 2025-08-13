import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["tests/setup.ts"],
    include: ["tests/**/*.spec.*"],
    silent: true,
    onConsoleLog(log, type) {
      // Filter noisy MCT debug groups if any slip through
      if (/\bMCT\b/.test(log)) return false;
    },
  },
});
