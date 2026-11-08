import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { startPreview } from './preview.mjs';

const evidence = process.argv[2];
if (!evidence) throw new Error('Provide an evidence output directory');
await mkdir(evidence, { recursive: true });
const server = await startPreview();
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const failures = [];
  page.on('pageerror', error => failures.push(error.message));
  page.on('response', response => { if (response.status() >= 400) failures.push(`${response.status()}: ${new URL(response.url()).pathname}`); });
  await page.goto(server.origin);
  await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  assert.deepEqual((await new AxeBuilder({ page }).analyze()).violations, []);
  await page.screenshot({ path: `${evidence}/identity-board.png`, fullPage: true });
  for (const name of ['readme-banner', 'social-preview']) {
    await page.goto(`${server.origin}/assets/${name}.png`);
    await page.locator('img').screenshot({ path: `${evidence}/${name}.png` });
  }
  for (const theme of ['dark', 'light', 'system']) {
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ colorScheme: theme === 'dark' ? 'dark' : 'light', reducedMotion: 'reduce' });
      await page.goto(`${server.origin}/shell`);
      await page.selectOption('#appearance', theme);
      await page.waitForFunction(() => document.querySelector('#active-count').textContent === '1');
      assert.equal(await page.title(), 'Lighthouse Control Center · Preview');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      assert.deepEqual((await new AxeBuilder({ page }).analyze()).violations, []);
      await page.keyboard.press('Tab');
      await page.locator('#refresh').focus();
      const focus = await page.locator('#refresh').evaluate(el => ({ matches: el.matches(':focus-visible'), style: getComputedStyle(el).outlineStyle, width: getComputedStyle(el).outlineWidth }));
      assert.equal(focus.matches, true);
      assert.equal(focus.style, 'solid');
      assert.equal(focus.width, '3px');
      assert.match(await page.locator('body').innerText(), /waiting-review/);
      assert.match(await page.locator('body').innerText(), /in_progress/);
      assert.doesNotMatch(await page.locator('body').innerText(), /SoFa|Software factory/);
      await page.screenshot({ path: `${evidence}/shell-${theme}-${width}.png`, fullPage: true });
      results.push({ theme, width, axeViolations: 0, overflow: false, keyboardFocus: focus, textStatuses: true });
    }
  }
  await page.goto(`${server.origin}/assets/mark-transparent.png`);
  const alpha = await page.locator('img').evaluate(async image => {
    await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 512;
    const context = canvas.getContext('2d'); context.drawImage(image, 0, 0);
    return context.getImageData(0, 0, 1, 1).data[3];
  });
  assert.equal(alpha, 0, 'rounded canonical tile retains transparent outside corners');
  assert.deepEqual(failures, []);
  await writeFile(`${evidence}/identity-browser.json`, JSON.stringify({ status: 'passed', galleryAxeViolations: 0, transparentCornerAlpha: alpha, results, visualAcceptance: 'pending maintainer', photoReference: 'supplied Loira bench photograph', artwork: 'bench-banner-edited-v2.png' }, null, 2));
  console.log('Gallery and six shell theme/viewport combinations passed accessibility, focus, status-label and overflow checks. Visual acceptance remains pending.');
} finally { await browser.close(); await server.close(); }
