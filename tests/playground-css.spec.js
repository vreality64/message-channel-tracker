import { readFileSync } from "node:fs";

describe("playground light mode", () => {
  it("index.html forces light color scheme and explicit colors", () => {
    const html = readFileSync("playground/index.html", "utf-8");
    expect(html).toContain(":root { color-scheme: light; }");
    expect(html).toContain("background: #ffffff;");
    expect(html).toContain("color: #0f172a;");
  });

  it("iframe.html forces light color scheme and explicit colors", () => {
    const html = readFileSync("playground/iframe.html", "utf-8");
    expect(html).toContain(":root { color-scheme: light; }");
    expect(html).toContain("background: #ffffff;");
    expect(html).toContain("color: #0f172a;");
  });
});
