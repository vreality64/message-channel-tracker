#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import puppeteer, { type Browser, type Page } from 'puppeteer';
import { existsSync, mkdirSync } from 'node:fs';

async function main(): Promise<void> {
  const size = Number(process.argv[2] || '128');
  const outArg = process.argv[3];
  const outPath = outArg ? path.resolve(outArg) : path.join(process.cwd(), 'webstore', `icon-${size}.png`);
  const outDir = path.dirname(outPath);
  mkdirSync(outDir, { recursive: true });

  const svgPath = path.join(process.cwd(), 'docs', 'assets', 'logo.svg');
  const svg = fs.readFileSync(svgPath, 'utf8');

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body { margin: 0; background: transparent; }
      #wrap { width: ${size}px; height: ${size}px; display: grid; place-items: center; }
      svg { width: ${size}px; height: ${size}px; }
    </style>
  </head>
  <body>
    <div id="wrap">${svg}</div>
  </body>
</html>`;

  const chromeCandidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/local/bin/chromium',
  ].filter(Boolean) as string[];

  let executablePath: string | undefined;
  for (const p of chromeCandidates) {
    if (existsSync(p)) {
      executablePath = p;
      break;
    }
  }

  const browser: Browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: size, height: size, deviceScaleFactor: 1 },
    executablePath,
    args: ['--no-sandbox','--disable-setuid-sandbox'],
  });

  const page: Page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  // Ensure any fonts/styles are fully applied
  await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
  await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: size, height: size } });
  await browser.close();
  console.log('Saved', outPath);
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
