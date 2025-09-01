import { loadTrackerWithConsole } from "./utils/loadTracker";
import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";

function loadlTrackerIntoHappydom(): void {
  const contextConsole = {
    group: (...args: unknown[]) => console.group(...args),
    groupCollapsed: (...args: unknown[]) => console.groupCollapsed(...args),
    groupEnd: () => console.groupEnd(),
    log: () => {},
    info: () => {},
    debug: () => {},
    warn: (...args: unknown[]) => console.warn(...args),
    error: (...args: unknown[]) => console.error(...args),
  } as any;
  loadTrackerWithConsole(contextConsole);
}

describe("tracker console title formatting", () => {
  let groupSpy: any;

  beforeEach(() => {
    groupSpy = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
  });

  afterEach(() => {
    groupSpy.mockRestore();
    try {
      console.groupEnd();
    } catch {}
  });

  it("does not insert space before outbound arrow (→) in window.postMessage logs", () => {
    loadlTrackerIntoHappydom();

    // invoke wrapped window.postMessage
    window.postMessage({ test: true }, "*");

    const calls = groupSpy.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const [fmt] = calls[0] as [string, ...unknown[]];

    // should contain arrow token
    expect(fmt).toMatch(/→/);
    // ensure there is no whitespace immediately before the arrow glyph
    expect(fmt).not.toMatch(/\s→/);
  });

  it("does not insert space before inbound arrow (←) in window.message logs", () => {
    loadlTrackerIntoHappydom();

    // dispatch an inbound message event
    const ev = new window.MessageEvent("message", { data: "x", origin: "null" });
    window.dispatchEvent(ev);

    const calls = groupSpy.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const [fmt] = calls[0] as [string, ...unknown[]];

    expect(fmt).toMatch(/←/);
    expect(fmt).not.toMatch(/\s←/);
  });
});
