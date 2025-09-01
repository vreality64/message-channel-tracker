import { loadTrackerWithConsole } from "./utils/loadTracker";
import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";

function loadTracker(): void {
  const contextConsole = {
    group: (...args: unknown[]) => console.group(...args),
    groupCollapsed: (...args: unknown[]) => console.groupCollapsed(...args),
    groupEnd: () => console.groupEnd(),
    log: (...args: unknown[]) => console.log(...args),
    info: (...args: unknown[]) => console.info(...args),
    warn: (...args: unknown[]) => console.warn(...args),
    error: (...args: unknown[]) => console.error(...args),
  } as any;
  loadTrackerWithConsole(contextConsole);
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
