#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { existsSync } from 'node:fs';

const outDir = path.join(process.cwd(), 'webstore', 'shots');
fs.mkdirSync(outDir, { recursive: true });

const REMOTE_BASE = 'https://vreality64.github.io/message-channel-tracker';

function fileUrlFor(suffix) {
  const isPlayground = suffix.startsWith('/playground/');
  const filePath = isPlayground ? path.join(process.cwd(), 'docs', 'playground', 'index.html') : path.join(process.cwd(), 'docs', 'index.html');
  const u = new URL(`file://${filePath}`);
  const urlObj = new URL(suffix, 'https://dummy.local');
  u.search = urlObj.search;
  return u.toString();
}

function urlCandidatesFor(suffix) {
  return [
    `http://localhost:5174${suffix}`,
    fileUrlFor(suffix),
    `${REMOTE_BASE}${suffix}`,
  ];
}

const shots = [
  { suffix: '/?theme=light', file: '20-docs-hero-light-1280x800.png', wait: 600 },
  { suffix: '/?theme=dark', file: '21-docs-hero-dark-1280x800.png', wait: 600 },
  { suffix: '/playground/?theme=dark', file: '22-playground-dark-1280x800.png', wait: 800 },
  { suffix: '/playground/?theme=light', file: '23-playground-light-1280x800.png', wait: 800 },
];

async function run() {
  // Try to use system Chrome if bundled Chromium is not available
  const chromeCandidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/local/bin/chromium',
  ].filter(Boolean);
  let executablePath;
  for (const p of chromeCandidates) {
    if (existsSync(p)) { executablePath = p; break; }
  }
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1280, height: 800 },
    executablePath,
    args: ['--no-sandbox','--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  for (const s of shots) {
    try {
      let loaded = false;
      for (const c of urlCandidatesFor(s.suffix)) {
        try {
          await page.goto(c, { waitUntil: 'domcontentloaded', timeout: 6000 });
          loaded = true;
          break;
        } catch {}
      }
      if (!loaded) throw new Error('All URL candidates failed');
      await page.waitForNetworkIdle?.({ timeout: 8000 }).catch(() => {});
      await new Promise((resolve) => setTimeout(resolve, s.wait || 300));
      const themeAttr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      console.log('Theme =>', themeAttr);
      const out = path.join(outDir, s.file);
      await page.screenshot({ path: out });
      console.log('Saved', out);
    } catch (e) {
      console.warn('Failed shot', s.suffix, e?.message);
    }
  }
  await browser.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});