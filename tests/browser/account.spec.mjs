import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const origin = `http://127.0.0.1:${process.env.SOFA_ISSUE_FIXTURE_PORT || '5171'}`;
const html = `<!doctype html><html lang="en" data-lh-theme="dark"><head><meta charset="utf-8"><title>Account</title>
<meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/tokens.css"><link rel="stylesheet" href="/app.css"><link rel="stylesheet" href="/account.css"><script type="module" src="/account.js"></script></head><body>
<a class="skip" href="#account">Skip to account</a><header class="topbar"><a class="brand" href="/workspace">Lighthouse Control Center</a><nav aria-label="Workspace navigation"><a href="/workspace/attention">Attention</a><a href="/workspace">Account</a><a href="/workspace/operations">Operations</a><a href="/workspace/factory">Factory</a><a href="/workspace/issues">Issues</a><a href="/workspace/runtime">Runtime</a></nav></header>
<main id="account" class="account-panel"><h1>Workspace</h1><p id="account-status" role="status"></p><div id="github-account"></div><ul id="repository-authority"></ul><button id="github-disconnect" hidden>Disconnect GitHub</button><button type="button">Connect GitHub account</button><a href="/workspace/operations">Open factory operations</a></main></body></html>`;

for (const theme of ['light', 'dark']) for (const width of [1280, 390]) test(`account visual contract ${theme} ${width}: generated shell aligns without clipping`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  await page.route('**/workspace', route => route.fulfill({ contentType: 'text/html', body: html }));
  await page.route('**/api/connections/github', route => route.fulfill({ json: { state: 'unlinked' } }));
  await page.goto(origin + '/workspace');
  await expect(page.getByRole('link', { name: 'Account', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.evaluate(theme => document.documentElement.dataset.lhTheme = theme, theme);
  await expect(page.getByRole('link', { name: 'Lighthouse Control Center', exact: true })).toBeVisible();
  await expect(page.locator('.workspace-nav a')).toHaveText(['Fleet overview', 'Find repository work', 'Intervention inbox', 'Issues', 'Runtime', 'Account']);
  await expect(page.locator('#account a[href="/workspace/operations"]')).toHaveText('Open fleet overview');
  const current = await page.locator('.workspace-nav [aria-current="page"]').boundingBox();
  expect(current.x).toBeGreaterThanOrEqual(0);
  expect(current.x + current.width).toBeLessThanOrEqual(width);
  const rail = await page.locator('.site-sidebar').boundingBox();
  const header = await page.locator('.topbar').boundingBox();
  const panel = await page.locator('#account').boundingBox();
  expect(rail.x).toBe(0);
  expect(rail.width).toBe(width >= 1000 ? 236 : width);
  expect(header.x).toBe(width >= 1000 ? 236 : 0);
  expect(panel.x).toBeGreaterThanOrEqual(width >= 1000 ? 236 : 0);
  expect(panel.x + panel.width).toBeLessThanOrEqual(width);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.locator('body').evaluate(body => getComputedStyle(body).fontSize)).toBe('15px');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: `test-results/account/visual-contract-${theme}-${width}.png` });
});
