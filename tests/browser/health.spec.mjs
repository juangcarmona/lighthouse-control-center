import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { mkdir } from 'node:fs/promises';
const origin = `http://127.0.0.1:${process.env.SOFA_ISSUE_FIXTURE_PORT || '5171'}`;
const repository = 'example/a-very-long-repository-name-for-engineering-health-evidence-inspection';
const observedAt = '2026-11-11T00:00:00Z';
const screenshotDir = process.env.LIGHTHOUSE_EVIDENCE_DIR || 'test-results/evidence/screenshots';
async function fixture(page) {
  const state = { denied: false, unavailable: false, accountUnavailable: false, scope: 'health-demo', sourceScope: 'health-demo', runName: 'Verify workspace', methods: [], paths: [] };
  await page.route('**/health.js', route => readFile(new URL('../../src/web/public/health.js', import.meta.url), 'utf8').then(body => route.fulfill({ body, contentType: 'text/javascript' })));
  await page.route('**/health.css', route => readFile(new URL('../../src/web/public/health.css', import.meta.url), 'utf8').then(body => route.fulfill({ body, contentType: 'text/css' })));
  await page.route('**/workspace/health**', async route => {
    const html = await readFile(new URL('../../src/web/public/health.html', import.meta.url), 'utf8');
    await route.fulfill({ body: html.replace('<div id="health-results">', '<p>Demonstration data · browser fixture</p><div id="health-results">'), contentType: 'text/html' });
  });
  await page.route('**/api/**', async route => {
    state.methods.push(route.request().method()); const path = new URL(route.request().url()).pathname; state.paths.push(path);
    if (path === '/api/session') return route.fulfill({ json: { authenticated: true, displayName: 'Demonstration operator', idleDeadline: new Date(Date.now() + 600000).toISOString(), absoluteDeadline: new Date(Date.now() + 600000).toISOString() } });
    if (path === '/api/connections/github') return route.fulfill({ json: state.accountUnavailable ? { state: 'unavailable' } : { state: 'linked', login: 'demo', dataScope: state.scope, userId: 1, repositories: [
      { repository, availability: state.denied ? 'denied' : 'available', actionsRead: true, issuesRead: true },
      { repository: 'example/denied', availability: 'denied' }, { repository: 'example/unavailable', availability: 'unavailable' }] } });
    if (state.unavailable) return route.fulfill({ status: 503, json: {} });
    return route.fulfill({ json: { dataScope: state.sourceScope, repositories: [{ repository, availability: 'available', observedAt,
      scope: 'Latest 20 workflow runs; not a complete delivery audit', runs: [{ id: 42, name: state.runName, status: 'completed', conclusion: 'failure', runAttempt: 2,
        url: 'https://github.com/' + repository + '/actions/runs/42', sourceRevision: 'a'.repeat(40), updatedAt: observedAt, event: 'workflow_dispatch' }] }] } });
  });
  return state;
}
test('health fleet to project to exact contributing source is read-only and honest', async ({ page }) => {
  const state = await fixture(page); state.runName = '<img src=x> Verify'; await page.goto(origin + '/workspace/health');
  await expect(page.getByRole('heading', { name: 'Needs investigation (1)' })).toBeVisible();
  await expect(page.locator('[data-repository="example/denied"]')).toContainText('Access denied');
  await expect(page.locator('[data-repository="example/unavailable"]')).toContainText('Evidence unavailable');
  await expect(page.locator('[data-repository="' + repository + '"]')).toContainText('PRE / PRO / production not verified');
  await page.getByRole('button', { name: 'Needs investigation 1' }).click();
  await expect(page.locator('.health-row:visible')).toHaveCount(1);
  await page.getByRole('button', { name: 'Evidence unknown 2' }).click();
  await expect(page.locator('.health-row:visible')).toHaveCount(2);
  await page.getByRole('button', { name: 'All 3' }).click();
  await page.getByRole('searchbox', { name: 'Filter projects by repository' }).fill('denied');
  await expect(page.locator('.health-row:visible')).toHaveCount(1);
  await page.getByRole('searchbox', { name: 'Filter projects by repository' }).fill('');
  await page.getByRole('link', { name: repository, exact: true }).click();
  for (const title of ['Delivery', 'Engineering quality', 'Lighthouse adoption/autonomy', 'Resources']) await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  await page.getByRole('link', { name: '<img src=x> Verify', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Open exact contributing GitHub run' })).toHaveAttribute('href', 'https://github.com/' + repository + '/actions/runs/42');
  await expect(page.locator('.health-detail')).toContainText('Not supplied by this source observation');
  await expect(page.locator('.health-detail')).toContainText('numeric unit not applicable');
  await expect(page.locator('.health-detail img')).toHaveCount(0);
  await expect(page.locator('#health-results')).toContainText('Trends unavailable');
  expect(state.methods.every(method => method === 'GET')).toBe(true);
});
test('temporary account and source failure retain stale visible evidence but denied authority removes records', async ({ page }) => {
  const state = await fixture(page); await page.goto(origin + '/workspace/health/' + repository + '/runs/42');
  await expect(page.locator('.health-detail')).toContainText('failure');
  state.accountUnavailable = true; await page.getByRole('button', { name: 'Refresh health evidence' }).click();
  await expect(page.locator('.health-detail')).toContainText('Stale');
  await expect(page.locator('.health-detail')).toContainText('2026-11-11T00:00:00.000Z');
  await expect(page.locator('#health-status')).toContainText('Previously shown observations may be stale');
  state.accountUnavailable = false;
  state.unavailable = true; await page.getByRole('button', { name: 'Refresh health evidence' }).click();
  await expect(page.locator('.health-detail')).toContainText('Stale');
  await expect(page.locator('.health-detail')).toContainText('2026-11-11T00:00:00.000Z');
  state.denied = true; await page.getByRole('button', { name: 'Refresh health evidence' }).click();
  await expect(page.locator('.health-detail')).toHaveCount(0);
  await expect(page.locator('#health-results')).toContainText('Access denied');
});
test('initial account unavailability does not restore private cached observations', async ({ page }) => {
  const state = await fixture(page); state.accountUnavailable = true;
  await page.addInitScript(({ scope, repository, observedAt }) => {
    const projection = { dataScope: scope, repositories: [{ repository, availability: 'available', observedAt, attention: [],
      runs: [{ id: 42, name: 'PRIVATE CACHED RUN', status: 'completed', conclusion: 'failure' }] }] };
    sessionStorage.setItem('lcc:read-projection:v1:active-scope', scope);
    sessionStorage.setItem(`lcc:read-projection:v1:${encodeURIComponent(scope)}:operations`, JSON.stringify({ version: 1, scope, savedAt: Date.now(), projection }));
  }, { scope: state.scope, repository, observedAt });
  await page.goto(origin + '/workspace/health');
  await expect(page.locator('#health-status')).toContainText('No stored observations were opened');
  await expect(page.locator('.health-row, .health-detail')).toHaveCount(0);
  await expect(page.getByText('PRIVATE CACHED RUN', { exact: true })).toHaveCount(0);
  expect(state.methods.every(method => method === 'GET')).toBe(true);
  expect(state.paths).not.toContain('/api/observations');
});
test('mismatched source scope cannot populate health', async ({ page }) => {
  const state = await fixture(page); state.sourceScope = 'different'; await page.goto(origin + '/workspace/health');
  await expect(page.locator('#health-status')).toContainText('Source account changed');
  await expect(page.locator('.health-row')).toHaveCount(0);
});
for (const width of [1440, 390]) for (const theme of ['light', 'dark']) test(`health visual contract ${width} ${theme}`, async ({ page }) => {
  await fixture(page); await page.setViewportSize({ width, height: 900 }); await page.goto(origin + '/workspace/health/' + repository + '/runs/42');
  await expect(page.locator('.health-detail')).toBeVisible();
  await page.getByRole('button', { name: theme[0].toUpperCase() + theme.slice(1) + ' appearance' }).click();
  const source = page.getByRole('link', { name: 'Open exact contributing GitHub run' });
  await source.focus(); await expect(source).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('link', { name: 'Back to project health' })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
  await mkdir(screenshotDir, { recursive: true });
  await page.screenshot({ path: `${screenshotDir}/health-${width}-${theme}.png`, fullPage: true });
  await page.goto(origin + '/workspace/health');
  await expect(page.locator('[data-repository="example/denied"]')).toBeVisible();
  await page.screenshot({ path: `${screenshotDir}/health-fleet-${width}-${theme}.png`, fullPage: true });
  await page.getByRole('link', { name: repository, exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Resources', exact: true })).toBeVisible();
  await page.screenshot({ path: `${screenshotDir}/health-project-${width}-${theme}.png`, fullPage: true });
});
