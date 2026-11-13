import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const data = { repositories: [{ repository: 'owner/project', availability: 'available', observedAt: '2026-11-09T10:00:00Z', runs: [], attention: [{ number: 7, title: 'Review the delivery proposal', labels: ['waiting-review'], updatedAt: '2026-11-09T09:00:00Z', url: 'https://github.com/owner/project/issues/7' }] }] };
for (const width of [1280, 390]) test(`dashboard visual contract ${width}: decisions first and shared appearance persists`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  await page.route('**/api/observations', route => route.fulfill({ json: data }));
  await page.route('**/api/session', route => route.fulfill({ json: { authenticated: true, displayName: 'verified-operator' } }));
  await page.route('**/workspace/operations', async route => route.fulfill({ response: await route.fetch({ url: new URL('/', route.request().url()).href }) }));
  await page.goto('/workspace/operations');
  await expect(page.getByRole('heading', { name: 'Overview' })).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Needs your attention' })).toBeVisible();
  const nav = page.getByRole('navigation', { name: 'Workspace navigation' });
  await expect(nav.locator('a > svg')).toHaveCount(7);
  await expect(page.locator(width >= 1000 ? '.sidebar-identity strong' : '.header-identity strong')).toHaveText('verified-operator');
  await expect(page.locator('.topbar #refresh')).toBeVisible();
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

test('navigation can collapse without losing accessible route names or persistence', async ({ page }) => {
  await page.route('**/api/observations', route => route.fulfill({ json: data }));
  await page.route('**/workspace/operations', async route => route.fulfill({ response: await route.fetch({ url: new URL('/', route.request().url()).href }) }));
  await page.goto('/workspace/operations');
  await page.getByRole('button', { name: 'Collapse navigation' }).click();
  expect((await page.locator('.site-sidebar').boundingBox()).width).toBe(60);
  await expect(page.getByRole('navigation', { name: 'Workspace navigation' }).getByRole('link', { name: 'Repositories', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Expand navigation' })).toHaveAttribute('aria-expanded', 'false');
  expect((await page.locator('.site-sidebar').boundingBox()).width).toBe(60);
});

test.describe('touch controls', () => {
  test.use({ hasTouch: true });
  test('refresh and appearance preserve 44px touch targets', async ({ page }) => {
    await page.route('**/api/observations', route => route.fulfill({ json: data }));
    await page.goto('/');
    for (const target of ['.header-refresh', '.theme-option']) {
      const box = await page.locator(target).first().boundingBox(); expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
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


async function continuityFixture(page) {
  let issuesRead = true, accountScope, accountState = 'linked', accountStatus = 200, scope = 'continuity-owner', accountWait, observationWait, observationStatus = 200;
  const snapshot = () => ({ ...structuredClone(data), dataScope: scope });
  await page.route('**/api/session', route => route.fulfill({ json: { authenticated: true, displayName: 'Owner' } }));
  await page.route('**/workspace/operations', async route => route.fulfill({ response: await route.fetch({ url: new URL('/', route.request().url()).href }) }));
  await page.route('**/api/connections/github', async route => {
    const status = accountStatus, json = { state: accountState, login: 'verified-account', userId: 71, dataScope: accountScope ?? scope, repositories: [{ repository: 'owner/project', availability: 'available', issuesRead, actionsRead: true }] };
    if (accountWait) await accountWait;
    await route.fulfill({ status, json });
  });
  await page.route('**/api/observations', async route => {
    const status = observationStatus, json = snapshot();
    if (observationWait) await observationWait;
    await route.fulfill({ status, json });
  });
  return {
    account(state, status = 200) { accountState = state; accountStatus = status; },
    failObservations() { observationStatus = 503; },
    restoreObservations() { observationStatus = 200; },
    replace() { scope = 'replacement-owner'; },
    replaceAccount() { accountScope = 'replacement-owner'; },
    denyRepository() { issuesRead = false; },
    pauseAccount() { let release; accountWait = new Promise(resolve => { release = resolve; }); return () => { accountWait = undefined; release(); }; },
    pauseObservations() { let release; observationWait = new Promise(resolve => { release = resolve; }); return () => { observationWait = undefined; release(); }; },
  };
}

for (const late of ['account', 'observations']) test(`overview authority denial wins when ${late} finishes last`, async ({ page }) => {
  const source = await continuityFixture(page); source.account('expired', 401);
  const release = late === 'account' ? source.pauseAccount() : source.pauseObservations();
  try {
    await page.goto('/workspace/operations');
    if (late === 'account') await expect(page.locator('.repository')).toHaveCount(1);
    else await expect(page.locator('#connection')).toContainText('session has ended');
  } finally { release(); }
  await expect(page.locator('#refresh')).toBeEnabled();
  await expect(page.locator('#connection')).toContainText('session has ended');
  await expect(page.locator('.repository')).toHaveCount(0);
  await expect(page.locator('#count-scope')).toHaveText('No authorized observation is available.');
  expect(await page.evaluate(() => Object.keys(sessionStorage).filter(key => key.startsWith('lcc:read-projection:')))).toEqual([]);
});

test('overview transient account failure retains visible stale rows and requires verification before cache restoration', async ({ page }) => {
  const source = await continuityFixture(page); source.account('unavailable');
  const releaseAccount = source.pauseAccount();
  await page.goto('/workspace/operations');
  await expect(page.locator('#repo-count')).toHaveText('1 / 1');
  releaseAccount();
  await expect(page.locator('#connection')).toContainText('Account verification unavailable');
  await expect(page.locator('#repo-count')).toHaveText('0 / 1');
  await expect(page.getByText('Review the delivery proposal', { exact: false })).toBeVisible();
  source.failObservations(); await page.reload();
  await expect(page.locator('#refresh')).toBeEnabled();
  await expect(page.locator('.repository')).toHaveCount(0);
  expect(await page.evaluate(() => Object.keys(sessionStorage).some(key => key.startsWith('lcc:read-projection:')))).toBe(true);
  source.account('linked'); source.restoreObservations(); const release = source.pauseObservations();
  try {
    await page.reload();
    await expect(page.locator('#connection')).toContainText('Restored previous observations');
    await expect(page.getByText('Review the delivery proposal', { exact: false })).toBeVisible();
  } finally { release(); }
  await expect(page.locator('#repo-count')).toHaveText('1 / 1');
});

test('overview unlink and later verified replacement never restore the previous source scope', async ({ page }) => {
  const source = await continuityFixture(page); await page.goto('/workspace/operations');
  await expect(page.locator('#repo-count')).toHaveText('1 / 1');
  source.account('unlinked'); source.failObservations(); await page.reload();
  await expect(page.locator('#connection')).toContainText('Connect or verify');
  await expect(page.locator('.repository')).toHaveCount(0);
  expect(await page.evaluate(() => Object.keys(sessionStorage).filter(key => key.startsWith('lcc:read-projection:')))).toEqual([]);
  source.account('linked'); source.replace(); source.restoreObservations(); const release = source.pauseObservations();
  try {
    await page.reload();
    await expect(page.locator('#refresh')).toBeDisabled();
    await expect(page.locator('.repository')).toHaveCount(0);
  } finally { release(); }
  await expect(page.locator('#repo-count')).toHaveText('1 / 1');
  const cached = await page.evaluate(() => Object.entries(sessionStorage).filter(([key]) => key.startsWith('lcc:read-projection:') && !key.endsWith('active-scope')).map(([, value]) => JSON.parse(value).scope));
  expect(cached).toEqual(['replacement-owner']);
});


for (const late of ['account', 'observations']) test(`overview clears mismatched source scopes when ${late} finishes last`, async ({ page }) => {
  const source = await continuityFixture(page); source.replaceAccount();
  const release = late === 'account' ? source.pauseAccount() : source.pauseObservations();
  try {
    await page.goto('/workspace/operations');
    if (late === 'account') await expect(page.locator('.repository')).toHaveCount(1);
    else await expect(page.locator('.sidebar-identity strong')).toHaveText('verified-account');
  } finally { release(); }
  await expect(page.locator('#connection')).toContainText('source account changed');
  await expect(page.locator('.repository')).toHaveCount(0);
  expect(await page.evaluate(() => Object.keys(sessionStorage).filter(key => key.startsWith('lcc:read-projection:')))).toEqual([]);
  source.replace(); await page.reload();
  await expect(page.locator('#repo-count')).toHaveText('1 / 1');
});


for (const late of ['account', 'observations']) test(`overview applies known repository denial when ${late} finishes last`, async ({ page }) => {
  const source = await continuityFixture(page); source.denyRepository();
  const release = late === 'account' ? source.pauseAccount() : source.pauseObservations();
  try {
    await page.goto('/workspace/operations');
    if (late === 'account') await expect(page.locator('.repository')).toHaveCount(1);
    else await expect(page.locator('.sidebar-identity strong')).toHaveText('verified-account');
  } finally { release(); }
  await expect(page.locator('#refresh')).toBeEnabled();
  await expect(page.locator('.repository')).toHaveCount(0);
  await expect(page.getByText('Review the delivery proposal', { exact: false })).toHaveCount(0);
  const projections = await page.evaluate(() => Object.entries(sessionStorage).filter(([key]) => key.endsWith(':operations')).map(([, value]) => JSON.parse(value).projection.repositories));
  expect(projections.flat()).toEqual([]);
});
