import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

function loadPageHookIntoJsdom() {
  const code = readFileSync('extension/pageHook.js', 'utf-8');
  // Provide minimal globals used by the script
  const context = {
    window,
    document,
    console,
    navigator,
    setTimeout,
    clearTimeout,
  };
  runInNewContext(`(function(){ ${code} })()`, context);
}

describe('pageHook console title formatting', () => {
  let groupSpy;

  beforeEach(() => {
    groupSpy = vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {});
  });

  afterEach(() => {
    groupSpy.mockRestore();
    try { console.groupEnd(); } catch {}
  });

  it('does not insert space before outbound arrow (→) in window.postMessage logs', () => {
    loadPageHookIntoJsdom();

    // invoke wrapped window.postMessage
    window.postMessage({ test: true }, '*');

    const calls = groupSpy.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const [fmt] = calls[0];

    // should contain arrow token
    expect(fmt).toMatch(/→/);
    // ensure there is no whitespace immediately before the arrow glyph
    expect(fmt).not.toMatch(/\s→/);
  });

  it('does not insert space before inbound arrow (←) in window.message logs', () => {
    loadPageHookIntoJsdom();

    // dispatch an inbound message event
    const ev = new window.MessageEvent('message', { data: 'x', origin: 'null' });
    window.dispatchEvent(ev);

    const calls = groupSpy.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const [fmt] = calls[0];

    expect(fmt).toMatch(/←/);
    expect(fmt).not.toMatch(/\s←/);
  });
});
