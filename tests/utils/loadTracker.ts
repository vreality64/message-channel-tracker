import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { createRequire } from "node:module";

/**
 * Loads the tracker code into the current happy-dom window without depending on built dist.
 * It reads TypeScript source and transpiles minimal syntax by delegating to ts-node-like tsc via dynamic import.
 * For simplicity and speed in tests, we load the already-transpiled JS from extension/dist if present;
 * otherwise we fall back to on-the-fly transpile using a tiny esbuild transform.
 */
export function loadTrackerWithConsole(contextConsole: Console): void {
  const ctx: any = {
    window,
    document,
    console: contextConsole,
    navigator,
    setTimeout,
    clearTimeout,
  };

  const distPath = "extension/dist/tracker.js";
  try {
    const code = readFileSync(distPath, "utf-8");
    runInNewContext(`(function(){ ${code} })()`, ctx);
    return;
  } catch (_) {
    // no dist available; try esbuild inline transpile from TS source
  }

  const tsPath = "extension/src/tracker.ts";
  const tsCode = readFileSync(tsPath, "utf-8");

  // Use a lightweight transform via esbuild (available in Node through dynamic import)
  // Avoid adding a runtime dependency: Node 20 has dynamic import support.
  const esbuild = requireEsbuildSync();
  const result = esbuild.transformSync(tsCode, {
    loader: "ts",
    target: "es2022",
    format: "esm",
  });
  runInNewContext(`(function(){ ${result.code} })()`, ctx);
}

function requireEsbuildSync(): any {
  try {
    const req = createRequire(import.meta.url);
    return req("esbuild");
  } catch (e) {
    throw new Error(
      "esbuild is required for test-time transpile when extension/dist is missing. Please add it to devDependencies or ensure build runs before tests.",
    );
  }
}
