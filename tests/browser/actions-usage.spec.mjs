import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile, mkdir } from 'node:fs/promises';

const origin = `http://127.0.0.1:${process.env.SOFA_ISSUE_FIXTURE_PORT || '5171'}`;
const repository = 'example/repository';
const observedAt = '2026-11-11T00:00:00Z';
const screenshotDir = process.env.LIGHTHOUSE_EVIDENCE_DIR || 'test-results/evidence/screenshots';
async function fixture(page) {
  const state = { mode: 'available', accountUnavailable: false, methods: [], paths: [] };
  const measure = (value, unit, source) => ({ value, unit, source, availability: 'available', observedAt,
    definition: 'Source snapshot, not billed usage', scope: 'First 100 source records', complete: false });
  await page.route('**/health.js', async route => route.fulfill({ body: await readFile(new URL('../../src/web/public/health.js', import.meta.url), 'utf8'), contentType: 'text/javascript' }));
  await page.route('**/health.css', async route => route.fulfill({ body: await readFile(new URL('../../src/web/public/health.css', import.meta.url), 'utf8'), contentType: 'text/css' }));
  await page.route('**/workspace/health**', async route => route.fulfill({ body: (await readFile(new URL('../../src/web/public/health.html', import.meta.url), 'utf8'))
    .replace('<div id="health-results">', '<p>Demonstration data · browser fixture</p><div id="health-results">'), contentType: 'text/html' }));
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    state.methods.push(route.request().method()); state.paths.push(path);
    if (path === '/api/session') return route.fulfill({ json: { authenticated: true, displayName: 'Demonstration operator',
      idleDeadline: new Date(Date.now() + 600000).toISOString(), absoluteDeadline: new Date(Date.now() + 600000).toISOString() } });
    if (path === '/api/connections/github') return route.fulfill({ json: state.accountUnavailable ? { state: 'unavailable' }
      : { state: 'linked', login: 'demo', dataScope: 'usage-demo', userId: 1, repositories: [{ repository, availability: 'available', actionsRead: true, issuesRead: true }] } });
    if (path.startsWith('/api/actions/')) {
      if (state.mode === 'network') return route.abort();
      if (['authority-unverified', 'denied', 'unavailable'].includes(state.mode)) return route.fulfill({
        status: state.mode === 'authority-unverified' ? 409 : state.mode === 'denied' ? 403 : 503,
        json: { availability: state.mode, repository, dataScope: null } });
      const value = { repository, availability: 'available', dataScope: 'usage-demo', observedAt, visibility: 'private', run: 42, attempt: 2,
        cache: measure(4096, 'bytes', 'https://api.github.com/repos/' + repository + '/actions/cache/usage'),
        artifacts: { ...measure(128, 'bytes', 'https://api.github.com/repos/' + repository + '/actions/artifacts?per_page=100&page=1'), availability: 'partial' },
        expiredArtifacts: 1, sourceArtifacts: 101,
        duration: measure(90, 'seconds', 'https://api.github.com/repos/' + repository + '/actions/runs/42/attempts/2/jobs?per_page=100&page=1'),
        jobs: [{ id: 1, name: '<img src=x> Self hosted', runnerKind: 'self-hosted', seconds: 60, startedAt: observedAt, completedAt: observedAt }], sourceJobs: 101,
        billing: { ...measure(null, 'minutes', 'No billing report collected'), availability: 'unsupported', reason: 'No verified Plan authority; host and model-provider costs unknown.' } };
      if (state.mode === 'content-unavailable') {
        value.observedAt = '2026-11-12T00:00:00Z';
        value.cache = { ...value.cache, value: null, availability: 'unavailable', observedAt: value.observedAt };
      }
      if (state.mode === 'wrong-scope') value.dataScope = 'other-account';
      if (state.mode === 'unverified-ok') value.availability = 'authority-unverified';
      return route.fulfill({ json: value });
    }
    return route.fulfill({ json: { dataScope: 'usage-demo', repositories: [{ repository, availability: 'available', observedAt,
      runs: [{ id: 42, runAttempt: 2, name: 'Verify', status: 'completed', conclusion: 'success', url: 'https://github.com/' + repository + '/actions/runs/42' }] }] } });
  });
  return state;
}
async function inspect(page, suffix = '') {
  await page.goto(origin + '/workspace/health/' + repository + suffix);
  await page.getByRole('button', { name: 'Read Actions usage', exact: true }).click();
  await expect(page.locator('#actions-usage')).toContainText('Source snapshot');
}
test('verified content failure retains only stale bytes with original provenance and unknown billing', async ({ page }) => {
  const state = await fixture(page); await inspect(page);
  const card = page.locator('#actions-usage');
  await expect(card).toContainText('4096 bytes');
  await expect(card).toContainText('128 bytes · partial');
  await expect(card).toContainText('Unknown · unsupported');
  await expect(card).toContainText('Expired listed artifacts: 1 · source artifact count: 101');
  await card.getByText('Current cache source and coverage', { exact: true }).click();
  await expect(card).toContainText('2026-11-11T00:00:00.000Z');
  state.mode = 'content-unavailable';
  await page.getByRole('button', { name: 'Read Actions usage', exact: true }).click();
  await expect(card).toContainText('Stale usage sample');
  await expect(card).toContainText('4096 bytes · available · stale sample');
  await card.getByText('Current cache source and coverage', { exact: true }).click();
  await expect(card).toContainText('2026-11-11T00:00:00.000Z');
  expect(state.methods.every(method => method === 'GET')).toBe(true);
});
for (const mode of ['authority-unverified', 'denied', 'unavailable', 'network', 'wrong-scope', 'unverified-ok']) {
  test(`previous sample is withheld on ${mode}, not retained stale`, async ({ page }) => {
    const state = await fixture(page); await inspect(page);
    await expect(page.locator('#actions-usage')).toContainText('4096 bytes');
    state.mode = mode;
    await page.getByRole('button', { name: 'Read Actions usage', exact: true }).click();
    await expect(page.locator('#actions-usage')).toContainText('Usage unknown.');
    await expect(page.locator('#actions-usage')).not.toContainText('4096');
    await expect(page.locator('#actions-usage')).not.toContainText('Stale usage sample');
    await expect(page.locator('#actions-usage').getByRole('link', { name: 'Open Actions source' })).toHaveCount(0);
  });
}
test('account verification outage clears usage without changing existing Health stale behavior', async ({ page }) => {
  const state = await fixture(page); await inspect(page, '/runs/42');
  await expect(page.locator('#actions-usage')).toContainText('90 seconds');
  state.accountUnavailable = true;
  await page.getByRole('button', { name: 'Refresh health evidence' }).click();
  await expect(page.locator('#actions-usage')).toContainText('Usage unknown.');
  await expect(page.locator('#actions-usage')).not.toContainText('90 seconds');
  await expect(page.locator('.health-detail')).toContainText('Stale');
});
test('exact run drill-down preserves self-hosted unknown costs and literal source text', async ({ page }) => {
  const state = await fixture(page); await inspect(page, '/runs/42');
  const card = page.locator('#actions-usage');
  await expect(card).toContainText('90 seconds');
  await expect(card).toContainText('Collected 1 / 101 jobs for run 42, attempt 2');
  await expect(card).toContainText('<img src=x> Self hosted');
  await expect(card.locator('img')).toHaveCount(0);
  await expect(card.getByRole('link', { name: 'Open Actions source' })).toHaveAttribute('href', 'https://github.com/' + repository + '/actions/runs/42/attempts/2');
  expect(state.methods.every(method => method === 'GET')).toBe(true);
  expect(state.paths.filter(path => path.startsWith('/api/actions/'))).toHaveLength(1);
});
for (const width of [1440, 390]) for (const theme of ['light', 'dark']) test(`actions usage visual contract ${width} ${theme}`, async ({ page }) => {
  const state = await fixture(page); await page.setViewportSize({ width, height: 900 }); await inspect(page);
  await page.getByRole('button', { name: theme[0].toUpperCase() + theme.slice(1) + ' appearance' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
  await mkdir(screenshotDir, { recursive: true });
  await page.screenshot({ path: `${screenshotDir}/actions-usage-${width}-${theme}.png`, fullPage: true });
  state.mode = 'authority-unverified';
  await page.getByRole('button', { name: 'Read Actions usage', exact: true }).click();
  await expect(page.locator('#actions-usage')).toContainText('Usage unknown.');
  await page.screenshot({ path: `${screenshotDir}/actions-usage-withheld-${width}-${theme}.png`, fullPage: true });
});
