import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";

function loadTracker(): void {
  const code = readFileSync("extension/dist/tracker.js", "utf-8");
  const contextConsole = {
    group: (...args: unknown[]) => console.group(...args),
    groupCollapsed: (...args: unknown[]) => console.groupCollapsed(...args),
    groupEnd: () => console.groupEnd(),
    log: (...args: unknown[]) => console.log(...args),
    info: (...args: unknown[]) => console.info(...args),
    warn: (...args: unknown[]) => console.warn(...args),
    error: (...args: unknown[]) => console.error(...args),
  };
  const context = {
    window,
    document,
    console: contextConsole,
    navigator,
    setTimeout,
    clearTimeout,
  };
  runInNewContext(`(function(){ ${code} })()`, context);
}

describe("pretty JSON formatting", () => {
  let spy: any;

  beforeEach(() => {
    spy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    spy.mockRestore();
    try {
      console.groupEnd();
    } catch {}
  });

  it("prints JSON when pretty enabled (smoke)", () => {
    loadTracker();
    // enable pretty via control message
    window.postMessage({ type: "MCT:SET_PRETTY_JSON", pretty: true }, "*");

    const payload = { str: "s", num: 1, bool: true, nil: null, obj: { k: "v" } };
    window.postMessage(payload, "*");

    const calls = spy.mock.calls;
    // Smoke: at least one console.log happened after pretty toggle
    expect(calls.length).toBeGreaterThan(0);
  });
});
