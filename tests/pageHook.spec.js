import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

function loadPageHookIntoHappydom() {
  const code = readFileSync("extension/pageHook.js", "utf-8");
  // Provide minimal globals used by the script
  const contextConsole = {
    // Forward groups to outer console so spies still work
    group: (...args) => console.group(...args),
    groupCollapsed: (...args) => console.groupCollapsed(...args),
    groupEnd: (...args) => console.groupEnd(...args),
    // Silence noisy outputs
    log: () => {},
    info: () => {},
    debug: () => {},
    // Keep warnings/errors visible
    warn: (...args) => console.warn(...args),
    error: (...args) => console.error(...args),
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

describe("pageHook console title formatting", () => {
  let groupSpy;

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
    loadPageHookIntoHappydom();

    // invoke wrapped window.postMessage
    window.postMessage({ test: true }, "*");

    const calls = groupSpy.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const [fmt] = calls[0];

    // should contain arrow token
    expect(fmt).toMatch(/→/);
    // ensure there is no whitespace immediately before the arrow glyph
    expect(fmt).not.toMatch(/\s→/);
  });

  it("does not insert space before inbound arrow (←) in window.message logs", () => {
    loadPageHookIntoHappydom();

    // dispatch an inbound message event
    const ev = new window.MessageEvent("message", { data: "x", origin: "null" });
    window.dispatchEvent(ev);

    const calls = groupSpy.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const [fmt] = calls[0];

    expect(fmt).toMatch(/←/);
    expect(fmt).not.toMatch(/\s←/);
  });
});
