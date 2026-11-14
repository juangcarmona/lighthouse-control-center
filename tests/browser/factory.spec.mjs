import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const origin = `http://127.0.0.1:${process.env.SOFA_ISSUE_FIXTURE_PORT || '5171'}`;
const makeIssue = (number, title, state = 'open', labels = []) => ({ id: number + 1000, number, title, state, labels,
  labelsComplete: true, updatedAt: '2026-11-07T10:00:00Z', sourceUrl: `https://github.com/example/repository/issues/${number}` });

test('adoption is explicit committed evidence, not installed capability or policy; denial clears it', async ({ page }) => {
  await fixture(page);
  let denied = false;
  await page.route('**/api/repositories/**/adoption', route => route.fulfill({ status: denied ? 403 : 200, json: {
    availability: denied ? 'denied' : 'available', dataScope: 'factory-71', observedAt: '2026-11-14T10:00:00Z', complete: false,
    observation: { adoptions: [{ repository: 'example/repository', revision: 'a'.repeat(40), collectedAt: '2026-11-14T09:00:00Z',
      declaredCli: '0.12.65', lockedCli: '0.12.65', sdlcVersion: '0.22.4', workflowRef: '<script>source()</script>' }] }
  } }));
  await page.goto(origin + '/workspace/repositories/example/repository');
  await page.locator('#factory-project-summary').click();
  const disclosure = page.locator('.lighthouse-adoption');
  await disclosure.locator('summary').click();
  await disclosure.getByRole('button', { name: 'Read adoption evidence' }).click();
  await expect(disclosure).toContainText('declared: 0.12.65');
  await expect(disclosure).toContainText('Installed: unknown');
  await expect(disclosure).toContainText('No compatible baseline available');
  await expect(disclosure.locator('script')).toHaveCount(0);
  await expect(disclosure.getByRole('link', { name: 'Inspect committed revision' })).toHaveAttribute('href', 'https://github.com/example/repository/tree/' + 'a'.repeat(40));
  denied = true;
  await disclosure.getByRole('button', { name: 'Read adoption evidence' }).click();
  await expect(page.locator('#factory-projects')).not.toContainText('0.12.65');
});
async function fixture(page) {
  let accountStatus = 0, accountState = 'linked', failure = 0, scope = 'factory-71', title = 'Ordinary work', actionsRead = true, configured = ['example/repository', 'example/other'], otherWait, pageWait;
  const methods = [], requests = [];
  await page.route('**/api/**', async route => {
    methods.push(route.request().method()); const url = new URL(route.request().url()); requests.push(url.pathname + url.search);
    if (url.pathname === '/api/session') return route.fulfill({ json: { authenticated: true, displayName: 'Fixture owner' } });
    if (url.pathname === '/api/connections/github' && accountStatus) return route.fulfill({ status: accountStatus, body: 'Session ended' });
    if (url.pathname === '/api/connections/github') return route.fulfill({ json: { state: accountState, login: 'verified-user', userId: 71, dataScope: scope, repositories: configured.map(repository => ({ repository, availability: 'available', issuesRead: true, actionsRead })) } });
    if (url.pathname.startsWith('/api/issues/')) return route.fulfill({ json: url.pathname.endsWith('/evidence')
      ? { availability: 'available', dataScope: scope, observedAt: '2026-11-07T12:00:00Z', reports: [{ availability: 'available', stage: 'propose', result: 'blocked', executionStatus: 'completed', executionConclusion: 'success', runId: 500, attempt: 2 }], scope: 'Synthetic one-page report fixture; live lease unknown.' }
      : { availability: 'available', dataScope: scope, snapshot: 'bounded-snapshot', issue: { id: 1007 } } });
    const repository = url.pathname.replace('/api/factory/', ''), selectedPage = Number(url.searchParams.get('page') || 1), number = Number(url.searchParams.get('number'));
    if (pageWait) await pageWait;
    if (repository === 'example/other' && otherWait) await otherWait;
    if (failure && repository === 'example/repository') return route.fulfill({ status: failure, json: { availability: 'unavailable' } });
    const issues = number ? [makeIssue(number, 'Uncollected target')] : repository === 'example/other' ? [makeIssue(2, 'Other repository work')]
      : selectedPage === 1 ? [makeIssue(7, title, 'open', ['needs-info', 'waiting-review']), makeIssue(8, '<img src=x onerror=alert(1)>', 'closed')]
        : [makeIssue(26, 'Find beyond the first page')];
    return route.fulfill({ json: { repository, availability: 'available', observedAt: '2026-11-07T12:00:00Z', dataScope: scope,
      issues, page: selectedPage, sourceRecords: issues.length + (selectedPage === 1 && repository === 'example/repository' && !number ? 23 : 0),
      nextPage: selectedPage === 1 && repository === 'example/repository' && !number ? 2 : null, complete: selectedPage > 1 || repository === 'example/other' || !!number,
      configuredBranch: 'expected', observedBranch: 'main', reason: 'Synthetic collection: bounded live pages, not an atomic snapshot.' } });
  });
  return { methods, requests, expireAccount() { accountStatus = 401; }, failAccount(status) { accountStatus = status; }, unavailableAccount() { accountState = 'unavailable'; }, unlinkAccount() { accountState = 'unlinked'; }, reconnect() { accountStatus = 0; accountState = 'linked'; }, revokeActions() { actionsRead = false; }, removeFirst() { configured = ['example/other']; }, pauseOther() { let release; otherWait = new Promise(resolve => { release = resolve; }); return release; }, pausePages() { let release; pageWait = new Promise(resolve => { release = resolve; }); return () => { pageWait = undefined; release(); }; }, fail(status) { failure = status; }, replace() { scope = 'factory-replacement'; title = 'Replacement account work'; } };
}
for (const width of [1280, 390]) test(`factory ${width}: list board filters evidence paging and keyboard`, async ({ page }, info) => {
  await page.setViewportSize({ width, height: 900 }); const source = await fixture(page);
  await page.goto(origin + '/workspace/factory');
  await expect(page.locator('.factory-issue')).toHaveCount(3);
  await expect(page.locator('#factory-results img, #factory-results script')).toHaveCount(0);
  await page.locator('#factory-project-summary').click();
  await page.locator('.factory-project details').first().click();
  await page.locator('.factory-project details').nth(1).click();
  await expect(page.getByText('Configured and observed default branches conflict.', { exact: true })).toHaveCount(2);
  await page.locator('.factory-project').filter({ has: page.getByRole('heading', { name: 'example/repository', exact: true }) }).getByRole('button', { name: 'Load next issue page' }).click();
  await expect(page.getByRole('link', { name: /Find beyond the first page/ })).toBeVisible();
  await page.selectOption('#factory-repository', 'example/repository');
  await expect(page.locator('.factory-issue')).toHaveCount(2);
  const ordinary = page.locator('.factory-issue').filter({ hasText: 'Ordinary work' });
  await ordinary.locator('details summary').click();
  await ordinary.getByRole('button', { name: 'Read issue evidence' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#factory-results')).toContainText('propose · Result blocked');
  await expect(page.locator('#factory-results')).toContainText('completed / success');
  await page.getByText('Evidence filters and coverage', { exact: true }).click();
  await page.selectOption('#factory-stage', 'propose'); await page.selectOption('#factory-wait', 'both');
  const listLinks = await page.locator('.factory-issue h3 a').evaluateAll(links => links.map(link => link.getAttribute('href')));
  expect(listLinks).toEqual(['/workspace/issues/example/repository/7']);
  await page.selectOption('#factory-view', 'board');
  expect(await page.locator('.factory-issue h3 a').evaluateAll(links => links.map(link => link.getAttribute('href')))).toEqual(listLinks);
  await expect(page.getByRole('heading', { name: 'Open issues', exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath(`fixture-factory-${width}.png`), fullPage: true });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  expect(source.methods.every(method => method === 'GET')).toBeTruthy();
});
test('global issue list finds uncollected work by number and title, preserving list state', async ({ page }) => {
  const source = await fixture(page); await page.goto(origin + '/workspace/issues');
  await page.fill('#factory-search', '#701'); await page.locator('#factory-search').press('Enter');
  await expect(page.locator('.factory-issue')).toHaveCount(2);
  await expect(page.locator('#factory-scope')).toContainText('Exact-number lookup');
  await expect(page.getByRole('link', { name: /example\/repository #701/ })).toHaveAttribute('href', '/workspace/issues/example/repository/701');
  await page.fill('#factory-search', '#702'); await page.locator('#factory-search').press('Enter');
  await expect(page.locator('.factory-issue')).toHaveCount(2);
  await expect(page.getByRole('link', { name: /example\/repository #702/ })).toHaveAttribute('href', '/workspace/issues/example/repository/702');
  expect(source.requests).toContain('/api/factory/example/repository?number=702');
  await page.fill('#factory-search', 'Ordinary'); await page.locator('#factory-search').press('Enter');
  await expect(page.locator('.factory-issue')).toHaveCount(1);
  await expect(page.locator('#factory-scope')).toContainText('Title search and filters cover collected');
  await page.selectOption('#factory-view', 'board'); await page.getByText('Evidence filters and coverage', { exact: true }).click(); await page.selectOption('#factory-state', 'open');
  await page.reload(); await expect(page.locator('#factory-view')).toHaveValue('board'); await expect(page.locator('#factory-state')).toHaveValue('open');
  await expect(page.locator('.factory-issue')).toHaveCount(1);
});

test('canonical repository inventory opens a compact scoped issue list with semantic state badges', async ({ page }, info) => {
  await page.setViewportSize({ width: 1280, height: 900 }); await fixture(page);
  await page.goto(origin + '/workspace/repositories');
  await expect(page.locator('body')).toHaveAttribute('data-collection', 'repositories');
  await page.getByRole('link', { name: 'example/repository', exact: true }).click();
  await expect(page).toHaveURL(/\/workspace\/repositories\/example\/repository(?:\?.*)?$/);
  await expect(page.locator('body')).toHaveAttribute('data-repository-scoped', 'true');
  await page.getByRole('button', { name: 'Dark appearance' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-lh-theme', 'dark');
  await expect(page.locator('#factory-repository')).toBeHidden();
  const first = page.locator('.factory-issue').first();
  await expect(first.locator('h3 a')).toHaveText('#7 · Ordinary work');
  const geometry = await first.boundingBox();
  expect(geometry).not.toBeNull();
  expect(geometry.y).toBeLessThan(230);
  await expect(first.locator('.issue-row-meta .badge.positive')).toHaveText('Open');
  await expect(first.locator('.issue-row-meta .badge.caution')).toHaveCount(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: info.outputPath('repository-scope-desktop-dark.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Light appearance' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-lh-theme', 'light');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath('repository-scope-mobile-light.png'), fullPage: true });

  await page.goto(origin + '/workspace/repositories/example/repository?repository=example/other');
  await expect(page.locator('body')).toHaveAttribute('data-repository-scoped', 'true');
  const issueLinks = await page.locator('.factory-issue h3 a').evaluateAll(links => links.map(link => link.getAttribute('href')));
  expect(issueLinks.length).toBeGreaterThan(0);
  expect(issueLinks.every(href => href.startsWith('/workspace/issues/example/repository/'))).toBe(true);
});
test('transient failure retains stale times while denied and replacement scopes remove old rows', async ({ page }) => {
  const source = await fixture(page); await page.goto(origin + '/workspace/factory');
  await expect(page.locator('.factory-issue')).toHaveCount(3);
  source.fail(503); await page.getByRole('button', { name: 'Refresh collection' }).click();
  await expect(page.locator('.factory-stale')).toHaveCount(2);
  await expect(page.locator('#factory-projects')).toContainText('2026-11-07T12:00:00.000Z');
  source.fail(403); await page.getByRole('button', { name: 'Refresh collection' }).click();
  await expect(page.locator('.factory-issue')).toHaveCount(1); await expect(page.locator('#factory-results')).not.toContainText('Ordinary work');
  source.fail(0); source.replace(); await page.getByRole('button', { name: 'Refresh collection' }).click();
  await expect(page.locator('#factory-results')).toContainText('Replacement account work'); await expect(page.locator('#factory-results')).not.toContainText('Ordinary work');
});


test('removed repository titles and evidence disappear before a slow remaining refresh completes', async ({ page }) => {
  const source = await fixture(page); await page.goto(origin + '/workspace/factory');
  const ordinary = page.locator('.factory-issue').filter({ hasText: 'Ordinary work' });
  await ordinary.locator('details summary').click();
  await ordinary.getByRole('button', { name: 'Read issue evidence' }).click();
  await expect(page.locator('#factory-results')).toContainText('propose · Result blocked');
  source.removeFirst(); const release = source.pauseOther();
  try {
    await page.getByRole('button', { name: 'Refresh collection' }).click();
    await expect(page.locator('#factory-repository option[value="example/repository"]')).toHaveCount(0);
    await expect(page.locator('#factory-results')).not.toContainText('Ordinary work');
    await expect(page.locator('#factory-results')).not.toContainText('Result blocked');
    await expect(page.getByRole('button', { name: 'Refresh collection' })).toBeDisabled();
  } finally { release(); }
  await expect(page.getByRole('button', { name: 'Refresh collection' })).toBeEnabled();
  await expect(page.locator('.factory-issue')).toHaveCount(1);
});

test('a denied page removes old titles before a slow sibling response settles', async ({ page }) => {
  const source = await fixture(page); await page.goto(origin + '/workspace/factory');
  await expect(page.locator('.factory-issue')).toHaveCount(3);
  source.fail(403); const release = source.pauseOther();
  try {
    await page.getByRole('button', { name: 'Refresh collection' }).click();
    await expect(page.locator('#factory-results')).not.toContainText('Ordinary work');
    await expect(page.locator('.factory-issue')).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Refresh collection' })).toBeDisabled();
  } finally { release(); }
  await expect(page.getByRole('button', { name: 'Refresh collection' })).toBeEnabled();
});


test('session loss clears source data and offers account recovery instead of a false empty backlog', async ({ page }) => {
  const source = await fixture(page); await page.goto(origin + '/workspace/factory');
  await expect(page.locator('.factory-issue')).toHaveCount(3);
  source.expireAccount(); await page.getByRole('button', { name: 'Refresh collection' }).click();
  await expect(page.locator('.factory-issue')).toHaveCount(0);
  await expect(page.locator('#factory-count')).toHaveText('No authorized collection is available.');
  await expect(page.locator('#factory-results').getByRole('link', { name: 'Open account' })).toHaveAttribute('href', '/workspace');
  await expect(page.locator('#factory-results')).not.toContainText('contains no ordinary issues');
});

test('temporary account failure keeps the last authorized collection visibly stale', async ({ page }) => {
  const source = await fixture(page); await page.goto(origin + '/workspace/issues?state=open&view=board');
  await expect(page.locator('.factory-issue')).toHaveCount(2);
  source.failAccount(503); await page.getByRole('button', { name: 'Refresh collection' }).click();
  await expect(page.locator('.factory-stale')).toHaveCount(2);
  await expect(page.locator('#factory-results')).toContainText('Ordinary work');
  await expect(page.locator('#factory-status')).toContainText('Source refresh failed');
  await expect(page.locator('#factory-view')).toHaveValue('board');
  await expect(page.locator('#factory-state')).toHaveValue('open');
  source.reconnect(); await page.getByRole('button', { name: 'Refresh collection' }).click();
  await expect(page.locator('.factory-stale')).toHaveCount(0);
});

test('project and issue navigation retain filters and restore the list position on return', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 400 }); await fixture(page);
  await page.goto(origin + '/workspace/issues?state=open&view=board&wait=both');
  await expect(page.locator('.factory-issue')).toHaveCount(1);
  await page.locator('#factory-project-summary').click();
  const project = page.getByRole('link', { name: 'example/repository', exact: true });
  const projectUrl = new URL(await project.getAttribute('href'), origin);
  expect(Object.fromEntries(['state', 'view', 'wait'].map(key => [key, projectUrl.searchParams.get(key)]))).toEqual({ state: 'open', view: 'board', wait: 'both' });
  await project.click();
  await expect(page.locator('#factory-state')).toHaveValue('open');
  await expect(page.locator('#factory-view')).toHaveValue('board');
  await expect(page.locator('#factory-wait')).toHaveValue('both');
  await expect(page.locator('.factory-issue')).toHaveCount(1);
  await page.locator('.factory-issue details summary').click();
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const before = await page.evaluate(() => window.scrollY);
  await page.locator('.factory-issue h3 a').evaluate(link => link.click());
  await page.waitForURL('**/workspace/issues/example/repository/7');
  await page.goBack({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('.factory-issue')).toHaveCount(1);
  await expect(page.locator('#factory-state')).toHaveValue('open');
  await expect(page.locator('#factory-view')).toHaveValue('board');
  await expect(page.locator('.factory-issue details')).toHaveAttribute('open', '');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(Math.max(0, before - 2));
});

test('returning restores same-scope read rows as stale, then refreshes them in the background', async ({ page }) => {
  const source = await fixture(page); await page.goto(origin + '/workspace/factory');
  const ordinary = page.locator('.factory-issue').filter({ hasText: 'Ordinary work' });
  await expect(ordinary).toBeVisible();
  await ordinary.locator('details summary').click();
  await ordinary.getByRole('button', { name: 'Read issue evidence' }).click();
  await expect(ordinary).toContainText('propose · Result blocked');
  const stored = await page.evaluate(() => Object.entries(sessionStorage).filter(([key]) => key.startsWith('lcc:read-projection:v1:') && !key.endsWith(':active-scope'))
    .map(([, value]) => JSON.parse(value).projection));
  expect(stored.length).toBeGreaterThan(0);
  expect(JSON.stringify(stored)).not.toMatch(/"evidence"|"reports"/i);
  expect(JSON.stringify(stored)).not.toMatch(/"(?:eligible|eligibility|token|snapshot|preparation)"/i);

  const release = source.pausePages();
  try {
    await page.reload();
    const restored = page.locator('.factory-issue').filter({ hasText: 'Ordinary work' });
    await expect(restored).toContainText('Stale collection; current activity and labels are unknown.');
    await restored.locator('details summary').click();
    await expect(restored.getByRole('button', { name: /issue evidence/ })).toBeDisabled();
    await expect(restored).toContainText('unknown / unread');
    await expect(restored).not.toContainText('propose · Result blocked');
  } finally { release(); }
  await expect(page.locator('.factory-stale')).toHaveCount(0);
  expect(source.methods.every(method => method === 'GET')).toBeTruthy();
});

test('permission downgrade restores issue rows but never reuses cached private evidence', async ({ page }) => {
  const source = await fixture(page); await page.goto(origin + '/workspace/factory');
  await expect(page.locator('.factory-issue').filter({ hasText: 'Ordinary work' })).toBeVisible();
  await page.evaluate(() => {
    const key = 'lcc:read-projection:v1:factory-71:factory';
    const envelope = JSON.parse(sessionStorage.getItem(key));
    envelope.projection.evidence = [['example/repository:1007', {
      availability: 'available', observedAt: '2026-11-07T12:00:00Z',
      reports: [{ stage: 'propose', result: 'Result blocked', runId: 500 }],
    }]];
    sessionStorage.setItem(key, JSON.stringify(envelope));
  });
  source.revokeActions(); const release = source.pausePages();
  try {
    await page.reload();
    const restored = page.locator('.factory-issue').filter({ hasText: 'Ordinary work' });
    await expect(restored).toContainText('Stale collection; current activity and labels are unknown.');
    await restored.locator('details summary').click();
    await expect(restored).toContainText('unknown / unread');
    await expect(restored).not.toContainText('propose · Result blocked');
    await expect(page.locator('#factory-results')).not.toContainText('Run 500');
  } finally { release(); }
  expect(source.methods.every(method => method === 'GET')).toBeTruthy();
});

test('an unauthorized account response clears the session projection before a later reconnect', async ({ page }) => {
  const source = await fixture(page); await page.goto(origin + '/workspace/factory');
  await expect(page.locator('.factory-issue')).toHaveCount(3);
  source.expireAccount(); await page.reload();
  await expect(page.locator('.factory-issue')).toHaveCount(0);
  await expect(page.locator('#factory-count')).toHaveText('No authorized collection is available.');
  source.reconnect(); const release = source.pausePages();
  try {
    await page.reload();
    await expect(page.locator('.factory-issue')).toHaveCount(0);
  } finally { release(); }
  await expect(page.locator('.factory-issue')).toHaveCount(3);
});


test('owner expiry removes the connected name and signed-in claim from the shared shell', async ({ page }) => {
  const source = await fixture(page); await page.goto(origin + '/workspace/issues');
  await expect(page.locator('.sidebar-identity strong')).toHaveText('verified-user');
  source.expireAccount(); await page.getByRole('button', { name: 'Refresh collection' }).click();
  await expect(page.locator('.sidebar-identity')).not.toContainText('verified-user');
  await expect(page.locator('.sidebar-identity')).not.toContainText('Fixture owner');
  await expect(page.locator('.sidebar-identity')).not.toContainText('Signed in');
});


test('temporary unavailable account retains visible rows but never opens stored rows until verification', async ({ page }) => {
  const source = await fixture(page); await page.goto(origin + '/workspace/issues');
  await expect(page.locator('.factory-issue')).toHaveCount(3);
  source.unavailableAccount(); await page.getByRole('button', { name: 'Refresh collection' }).click();
  await expect(page.locator('.factory-stale')).toHaveCount(3);
  await expect(page.locator('#factory-status')).toContainText('Source refresh failed');
  await expect(page.locator('.factory-issue').first()).toContainText('Ordinary work');
  expect(await page.evaluate(() => Object.keys(sessionStorage).some(key => key.startsWith('lcc:read-projection:')))).toBe(true);
  await page.reload();
  await expect(page.locator('#factory-status')).toContainText('Source refresh failed');
  await expect(page.locator('.factory-issue')).toHaveCount(0);
  source.reconnect(); const release = source.pausePages();
  try {
    await page.reload();
    await expect(page.locator('.factory-stale')).toHaveCount(3);
  } finally { release(); }
  await expect(page.locator('.factory-stale')).toHaveCount(0);
  source.unlinkAccount(); await page.getByRole('button', { name: 'Refresh collection' }).click();
  await expect(page.locator('.factory-issue')).toHaveCount(0);
  expect(await page.evaluate(() => Object.keys(sessionStorage).filter(key => key.startsWith('lcc:read-projection:')))).toEqual([]);
});

test('local filtering and refresh retain disclosures, while a replacement source starts them closed', async ({ page }) => {
  const source = await fixture(page); await page.goto(origin + '/workspace/issues');
  await expect(page.locator('.factory-issue')).toHaveCount(3);
  await page.locator('#factory-project-summary').click();
  const coverage = page.locator('.factory-project').filter({ has: page.getByRole('heading', { name: 'example/repository', exact: true }) }).locator('details').filter({ has: page.locator('summary', { hasText: 'Branch and source coverage' }) });
  const issueDetails = page.locator('.factory-issue').filter({ hasText: 'Ordinary work' }).locator('details');
  await coverage.locator('summary').click(); await issueDetails.locator('summary').click();
  await page.locator('#factory-search').fill('Ordinary');
  await expect(coverage).toHaveAttribute('open', ''); await expect(issueDetails).toHaveAttribute('open', '');
  await page.locator('#factory-search').fill('No matching work');
  await expect(page.locator('.factory-issue')).toHaveCount(0);
  await page.locator('#factory-search').fill('');
  await expect(issueDetails).toHaveAttribute('open', '');
  await page.getByRole('button', { name: 'Refresh collection' }).click();
  await expect(page.locator('#factory-refresh')).toBeEnabled();
  await expect(coverage).toHaveAttribute('open', ''); await expect(issueDetails).toHaveAttribute('open', '');
  source.replace(); await page.getByRole('button', { name: 'Refresh collection' }).click();
  await expect(page.locator('.factory-issue').filter({ hasText: 'Replacement account work' })).toBeVisible();
  await expect(coverage).not.toHaveAttribute('open', '');
  await expect(page.locator('.factory-issue').filter({ hasText: 'Replacement account work' }).locator('details')).not.toHaveAttribute('open', '');
});
