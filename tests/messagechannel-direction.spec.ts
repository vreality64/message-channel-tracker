import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";

describe("MessageChannel direction labels", () => {
  let groupSpy: any;
  let logSpy: any;

  function loadTracker(): void {
    const code = readFileSync("extension/tracker.js", "utf-8");
    const contextConsole = {
      group: (...args: unknown[]) => console.group(...args),
      groupCollapsed: (...args: unknown[]) => console.groupCollapsed(...args),
      groupEnd: () => console.groupEnd(),
      log: (...args: unknown[]) => console.log(...args),
      info: (...args: unknown[]) => console.info(...args),
      warn: (...args: unknown[]) => console.warn(...args),
      error: (...args: unknown[]) => console.error(...args),
    };
    const context = { window, document, console: contextConsole, navigator, setTimeout, clearTimeout };
    runInNewContext(`(function(){ ${code} })()`, context);
  }

  beforeEach(() => {
    groupSpy = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    groupSpy.mockRestore();
    logSpy.mockRestore();
    try { console.groupEnd(); } catch {}
  });

  it("shows p1→p2 or p2→p1 for postMessage even if ports were not created via wrapped constructor", () => {
    loadTracker();

    // Create channel without triggering WrappedMessageChannel (simulate pre-existing)
    const ch = new window.MessageChannel();
    const a = ch.port1;
    const b = ch.port2;

    // Add listeners to activate capture (wrapped addEventListener adds captureLogger)
    a.addEventListener("message", () => {});
    b.addEventListener("message", () => {});

    // Send message from A to B
    a.postMessage({ ping: true });

    const calls = groupSpy.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    // Find a call that mentions MessagePort.postMessage
    const call = calls.find((args: unknown[]) => typeof args[0] === "string" && /MessagePort\.postMessage/.test(String(args[0])));
    expect(call).toBeTruthy();
    if (!call) throw new Error("Call not found");
    const fmt = call[0] as string;
    // Expect p1 or p2 labels to be present
    expect(/p1|p2/.test(fmt)).toBe(true);
  });
});
