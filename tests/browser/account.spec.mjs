import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const origin = `http://127.0.0.1:${process.env.SOFA_ISSUE_FIXTURE_PORT || '5171'}`;
const html = `<!doctype html><html lang="en" data-lh-theme="dark"><head><meta charset="utf-8"><title>Account</title>
<meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/tokens.css"><link rel="stylesheet" href="/app.css"><link rel="stylesheet" href="/account.css"><script type="module" src="/account.js"></script></head><body>
<a class="skip" href="#account">Skip to account</a><header class="topbar"><a class="brand" href="/workspace">Lighthouse Control Center</a><nav aria-label="Workspace navigation"><a href="/workspace/attention">Attention</a><a href="/workspace">Account</a><a href="/workspace/operations">Operations</a><a href="/workspace/factory">Factory</a><a href="/workspace/issues">Issues</a><a href="/workspace/runtime">Runtime</a></nav></header>
<main id="account" class="account-panel"><h1>Workspace</h1><p id="account-status" role="status"></p><div id="github-account"></div><ul id="repository-authority"></ul><div id="github-disconnect" hidden><form method="post" action="/connections/github/refresh"><input type="hidden" name="__RequestVerificationToken" value="fixture-token"><button type="submit">Refresh GitHub permissions</button></form><button type="button">Disconnect GitHub</button></div><button type="button">Connect GitHub account</button><a href="/workspace/operations">Open factory operations</a></main></body></html>`;

test('connected account explicitly refreshes credentials by keyboard through its existing protected form', async ({ page }) => {
  await page.route('**/workspace', route => route.fulfill({ contentType: 'text/html', body: html }));
  await page.route('**/api/connections/github', route => route.fulfill({ json: {
    state: 'linked', login: 'example-user', userId: 71, verifiedAt: '2026-11-17T06:00:00Z', repositories: [],
  } }));
  let submissions = 0;
  await page.route('**/connections/github/refresh', async route => {
    expect(route.request().method()).toBe('POST');
    expect(new URLSearchParams(route.request().postData()).get('__RequestVerificationToken')).toBe('fixture-token');
    submissions++;
    await route.fulfill({ contentType: 'text/html', body: '<html lang="en"><title>Refreshed</title><body>Refresh requested</body></html>' });
  });
  await page.goto(origin + '/workspace');
  await expect(page.locator('#github-account')).toHaveText('GitHub connected as example-user.');
  expect(submissions).toBe(0);
  const summary = page.getByText('Session, disconnection and sign-out', { exact: true });
  await summary.focus(); await page.keyboard.press('Enter');
  const button = page.getByRole('button', { name: 'Refresh GitHub permissions', exact: true });
  await button.focus(); await page.keyboard.press('Enter');
  await expect(page).toHaveURL(origin + '/connections/github/refresh');
  expect(submissions).toBe(1);
});

for (const theme of ['light', 'dark']) for (const width of [1280, 390]) test(`account visual contract ${theme} ${width}: generated shell aligns without clipping`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  await page.route('**/workspace', route => route.fulfill({ contentType: 'text/html', body: html }));
  await page.route('**/api/connections/github', route => route.fulfill({ json: { state: 'unlinked' } }));
  await page.goto(origin + '/workspace');
  if (width < 1000) await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Account', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.evaluate(theme => document.documentElement.dataset.lhTheme = theme, theme);
  await expect(page.getByRole('link', { name: 'Lighthouse Control Center', exact: true })).toBeVisible();
  await expect(page.locator('.workspace-nav a')).toHaveText(['Work', 'Repositories', 'Issues', 'Attention', 'Health', 'Runtime', 'Account']);
  await expect(page.locator('#account a[href="/workspace/operations"]')).toHaveText('Open fleet overview');
  const current = await page.locator('.workspace-nav [aria-current="page"]').boundingBox();
  expect(current.x).toBeGreaterThanOrEqual(0);
  expect(current.x + current.width).toBeLessThanOrEqual(width);
  if (width < 1000) await page.keyboard.press('Escape');
  const rail = await page.locator('.site-sidebar').boundingBox();
  const header = await page.locator('.topbar').boundingBox();
  const panel = await page.locator('#account').boundingBox();
  expect(rail.x).toBe(0);
  expect(rail.width).toBe(width >= 1000 ? 184 : width);
  expect(header.x).toBe(width >= 1000 ? 184 : 0);
  expect(panel.x).toBeGreaterThanOrEqual(width >= 1000 ? 184 : 0);
  expect(panel.x + panel.width).toBeLessThanOrEqual(width);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.locator('body').evaluate(body => getComputedStyle(body).fontSize)).toBe('15px');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: `test-results/account/visual-contract-${theme}-${width}.png` });
  await page.setViewportSize({ width: 320, height: 900 });
  await page.evaluate(() => document.documentElement.style.fontSize = '200%');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).fontSize)).toBe('32px');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
