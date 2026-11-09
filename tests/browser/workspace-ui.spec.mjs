import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const data = { repositories: [{ repository: 'owner/project', availability: 'available', observedAt: '2026-11-09T10:00:00Z', runs: [], attention: [{ number: 7, title: 'Review the delivery proposal', labels: ['waiting-review'], updatedAt: '2026-11-09T09:00:00Z', url: 'https://github.com/owner/project/issues/7' }] }] };
for (const width of [1280, 390]) test(`dashboard visual contract ${width}: decisions first and shared appearance persists`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  await page.route('**/api/observations', route => route.fulfill({ json: data }));
  await page.route('**/workspace/operations', async route => route.fulfill({ response: await route.fetch({ url: new URL('/', route.request().url()).href }) }));
  await page.goto('/workspace/operations');
  await expect(page.getByRole('heading', { name: 'Your fleet at a glance' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Needs your attention' })).toBeVisible();
  const nav = page.getByRole('navigation', { name: 'Workspace navigation' });
  await expect(nav.locator('a > svg')).toHaveCount(6);
  expect(await page.locator('link[rel="icon"]').getAttribute('href')).toBe('/lighthouse.svg');
  await expect(page.getByText('Source observation time:', { exact: false })).toBeHidden();
  await expect(page.getByText('Latest 20 workflow runs', { exact: false })).toBeHidden();
  for (const appearance of ['Light', 'Dark']) {
    await page.getByRole('button', { name: `${appearance} appearance` }).click();
    await expect(page.locator('html')).toHaveAttribute('data-lh-theme', appearance.toLowerCase());
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/dashboard-${width}-${appearance}.png`, fullPage: true });
  }
  await page.reload();
  await expect(page.getByRole('button', { name: 'Dark appearance' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'System appearance' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-lh-theme', 'system');
});

test('return navigation restores only an authorized projection and removes it on authority loss', async ({ page }) => {
  const snapshot = structuredClone(data); snapshot.dataScope = 'verified-owner-connection';
  let slow = false, denied = false, release;
  await page.route('**/api/connections/github', route => route.fulfill({ json: { state: 'linked', dataScope: snapshot.dataScope, repositories: [{ repository: 'owner/project', availability: 'available', issuesRead: true, actionsRead: true }] } }));
  await page.route('**/api/observations', async route => {
    if (slow) await new Promise(resolve => { release = resolve; });
    await route.fulfill(denied ? { status: 401 } : { json: snapshot });
  });
  await page.route('**/workspace/operations', async route => route.fulfill({ response: await route.fetch({ url: new URL('/', route.request().url()).href }) }));
  await page.goto('/workspace/operations');
  await expect(page.locator('#repo-count')).toHaveText('1 / 1');
  slow = true;
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('status')).toContainText('Restored previous observations');
  await expect(page.getByText('Review the delivery proposal', { exact: false })).toBeVisible();
  await expect(page.locator('#active-count')).toHaveText('Unavailable');
  denied = true; slow = false; release();
  await expect(page.getByRole('status')).toContainText('session has ended');
  await expect(page.getByText('Review the delivery proposal', { exact: false })).toHaveCount(0);
  expect(await page.evaluate(() => Object.keys(sessionStorage).filter(key => key.startsWith('lcc:read-projection:')))).toEqual([]);
});
