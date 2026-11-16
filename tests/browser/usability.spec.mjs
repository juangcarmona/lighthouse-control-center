import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const origin = `http://127.0.0.1:${process.env.SOFA_ISSUE_FIXTURE_PORT || '5171'}`;
const at = '2026-11-14T11:00:00Z', scope = 'usability-71';
const issues = [
  ['Keep the last view while refreshing', ['refine']], ['Review repository access', ['bot-working']],
  ['Choose the household sharing policy', ['needs-info']], ['Explore the next delivery measure', ['future']],
  ['Inspect a newly reported issue', []],
].map(([title, labels], i) => ({ id: 100 + i, number: i + 1, title, labels, labelsComplete: true, state: 'open', updatedAt: at }));
async function fixture(page) {
  const methods = [];
  await page.route('**/api/**', route => {
    methods.push(route.request().method());
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/session') return route.fulfill({ json: { authenticated: true, displayName: 'Review operator', idleDeadline: '2026-11-14T14:00:00Z', absoluteDeadline: '2026-11-15T00:00:00Z' } });
    if (path === '/api/connections/github') return route.fulfill({ json: { state: 'linked', login: 'review-operator', userId: 71, dataScope: scope,
      repositories: ['example/repository', 'example/other'].map(repository => ({ repository, availability: 'available', issuesRead: true, actionsRead: true, administrationRead: true, administrationAvailability: 'available' })) } });
    if (path.startsWith('/api/factory/')) return route.fulfill({ json: { repository: path.slice('/api/factory/'.length), availability: 'available', dataScope: scope, observedAt: at,
      issues, page: 1, sourceRecords: issues.length, complete: true, nextPage: null } });
    if (path === '/api/observations') return route.fulfill({ json: { dataScope: scope, repositories: ['example/repository', 'example/other'].map(repository => ({ repository, availability: 'available', observedAt: at,
      runs: [{ id: 42, name: 'Verify source checks', status: 'completed', conclusion: 'failure', runAttempt: 1, updatedAt: at, url: 'https://github.com/' + repository + '/actions/runs/42' }], attention: [] })) } });
    if (path.endsWith('/controls')) return route.fulfill({ json: { availability: 'unsupported', reason: 'No supported control contract in this example.', dataScope: scope, actingUserId: 71 } });
    if (path.endsWith('/evidence')) return route.fulfill({ json: { availability: 'available', dataScope: scope, observedAt: at, reports: [], scope: 'Controlled example; associated execution history is not available.' } });
    if (path.startsWith('/api/issues/')) return route.fulfill({ json: { repository: 'example/repository', number: 1, availability: 'available', dataScope: scope, actingUserId: 71, observedAt: at, snapshot: 'example-snapshot', evidenceReadAllowed: true,
      issue: { ...issues[0], author: 'review-operator', body: '## Context\nKeep permitted display data visible while reading current source changes.\n\n- Preserve filters and reading position.\n- Keep an unsent draft.\n- Show the last source observation.', sourceUrl: 'https://github.com/example/repository/issues/1' },
      conversation: { availability: 'available', items: [], page: 1, sourceCount: 0, nextPage: null, complete: true } } });
    if (path === '/api/runtime/host') return route.fulfill({ json: { availability: 'available', observedAt: at, registrationCount: 1, checkoutCount: 1, complete: true,
      observation: { configured: true, registrations: [{ alias: 'Local runner', availability: 'available', repository: 'example/repository', id: 22, name: 'Registered runner', collectedAt: at, modifiedAt: at }],
        adoptions: [{ repository: 'example/repository', availability: 'available', revision: 'a'.repeat(40), declaredCli: '0.12.68', lockedCli: '0.12.68', sdlcVersion: '0.22.7', complete: true, collectedAt: at }] } } });
    if (path.startsWith('/api/runtime/')) return route.fulfill({ json: { availability: 'available', dataScope: scope, observedAt: at, sourceTotal: 1, complete: true, runners: [{ id: 22, name: 'Registered runner', status: 'online', busy: false, os: 'linux', labels: [], labelsComplete: true }] } });
    return route.fulfill({ status: 404, json: {} });
  });
  return methods;
}
for (const width of [1440, 390]) for (const theme of ['light', 'dark']) test(`workspace usability visual contract ${width} ${theme}`, async ({ page }, info) => {
  await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
  await page.clock.setFixedTime(new Date('2026-11-14T12:00:00Z'));
  const methods = await fixture(page);
  for (const [name, path, ready] of [
    ['work', '/workspace/operations', '.factory-issue'], ['repositories', '/workspace/repositories', '.factory-project'],
    ['issues', '/workspace/issues', '.factory-issue'], ['project', '/workspace/repositories/example/repository', '.factory-issue'],
    ['issue', '/workspace/issues/example/repository/1', '#issue-body .source-markdown'],
    ['attention', '/workspace/attention', '[data-attention-key]'], ['health', '/workspace/health', '.health-row'],
    ['health-project', '/workspace/health/example/repository', '.health-family'], ['runtime', '/workspace/runtime', '.runtime-card'],
  ]) {
    await page.goto(origin + path); await expect(page.locator(ready + ':visible').first()).toBeVisible();
    await page.getByRole('button', { name: (theme === 'light' ? 'Light' : 'Dark') + ' appearance' }).click();
    if (name === 'attention') await expect(page.locator('.header-context')).toHaveText('Attention', { useInnerText: true });
    if (name === 'issue') expect(await page.locator('#issue-state').evaluate(value => getComputedStyle(value).whiteSpace)).toBe('nowrap');
    expect((await new AxeBuilder({ page }).analyze()).violations, name).toEqual([]);
    expect(await page.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), name + ' images').toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), name).toBe(true);
    await page.screenshot({ path: info.outputPath(`implemented-${name}-${width}-${theme}.png`), fullPage: false });
    await page.setViewportSize({ width: 320, height: 900 });
    await page.evaluate(() => document.documentElement.style.fontSize = '200%');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).fontSize)).toBe('32px');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), name + ' at 200%').toBe(true);
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
  }
  expect(methods.every(method => method === 'GET')).toBe(true);
});

for (const [view, path, ready] of [
  ['health', '/workspace/health', '.health-row'],
  ['issue', '/workspace/issues/example/repository/1', '#issue-body .source-markdown'],
  ['runtime', '/workspace/runtime', '[data-registration="Local runner"]'],
]) test(`${view} restores permitted display while every fresh read is held`, async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-14T12:00:00Z'));
  await fixture(page);
  const context = { dataScope: scope, actingUserId: 71, expiresAt: '2026-11-14T12:02:00Z',
    repositories: ['example/repository', 'example/other'].map(repository => ({ repository, issuesRead: true, actionsRead: true })) };
  await page.route('**/workspace/**', async route => {
    const response = await route.fetch();
    const body = (await response.text()).replace('</head>', '<meta name="lcc-display-context" content="' + JSON.stringify(context).replaceAll('"', '&quot;') + '"></head>');
    await route.fulfill({ response, body });
  });
  await page.goto(origin + path);
  await expect(page.locator(ready).first()).toBeVisible();
  await page.waitForFunction(key => sessionStorage.getItem(key), 'lcc:read-projection:v1:' + scope + ':' + view);
  let release; const held = new Promise(resolve => { release = resolve; });
  await page.route('**/api/**', async route => { await held; return route.fallback(); });
  try {
    await page.reload({ waitUntil: 'commit' });
    await expect(page.locator(ready).first()).toBeVisible({ timeout: 1000 });
    await expect(page.locator('#' + (view === 'runtime' ? 'runtime' : view) + '-status')).toContainText(/Saved|Refreshing source authority/i);
    if (view === 'issue') await expect(page.getByRole('button', { name: 'Review comment' })).toBeDisabled();
  } finally { release(); }
});
