import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";

describe("playground light mode", () => {
  it("index.html has proper styling and structure", () => {
    const html = readFileSync("docs/playground/index.html", "utf-8");
    expect(html).toContain("--console-bg: #ffffff;");
    expect(html).toContain("--console-fg: #0f172a;");
    expect(html).toContain("Message Channel Tracker — Playground");
  });

  it("iframe.html forces light color scheme and explicit colors", () => {
    const html = readFileSync("docs/playground/iframe.html", "utf-8");
    expect(html).toContain(":root { color-scheme: light; }");
    expect(html).toContain("background: #ffffff;");
    expect(html).toContain("color: #0f172a;");
  });
});
