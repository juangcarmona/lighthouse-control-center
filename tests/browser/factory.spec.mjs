import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const origin = `http://127.0.0.1:${process.env.SOFA_ISSUE_FIXTURE_PORT || '5171'}`;
const makeIssue = (number, title, state = 'open', labels = []) => ({ id: number + 1000, number, title, state, labels,
  labelsComplete: true, updatedAt: '2026-11-07T10:00:00Z', sourceUrl: `https://github.com/example/repository/issues/${number}` });
async function fixture(page) {
  let failure = 0, scope = 'factory-71', title = 'Ordinary work';
  const methods = [];
  await page.route('**/api/**', async route => {
    methods.push(route.request().method()); const url = new URL(route.request().url());
    if (url.pathname === '/api/connections/github') return route.fulfill({ json: { state: 'linked', login: 'verified-user', userId: 71, dataScope: scope, repositories: ['example/repository', 'example/other'].map(repository => ({ repository, availability: 'available', issuesRead: true })) } });
    if (url.pathname.startsWith('/api/issues/')) return route.fulfill({ json: url.pathname.endsWith('/evidence')
      ? { availability: 'available', dataScope: scope, observedAt: '2026-11-07T12:00:00Z', reports: [{ availability: 'available', stage: 'propose', result: 'blocked', executionStatus: 'completed', executionConclusion: 'success', runId: 500, attempt: 2 }], scope: 'Synthetic one-page report fixture; live lease unknown.' }
      : { availability: 'available', dataScope: scope, snapshot: 'bounded-snapshot', issue: { id: 1007 } } });
    const repository = url.pathname.replace('/api/factory/', ''), selectedPage = Number(url.searchParams.get('page') || 1), number = Number(url.searchParams.get('number'));
    if (failure && repository === 'example/repository') return route.fulfill({ status: failure, json: { availability: 'unavailable' } });
    const issues = number ? [makeIssue(number, 'Uncollected target')] : repository === 'example/other' ? [makeIssue(2, 'Other repository work')]
      : selectedPage === 1 ? [makeIssue(7, title, 'open', ['needs-info', 'waiting-review']), makeIssue(8, '<img src=x onerror=alert(1)>', 'closed')]
        : [makeIssue(26, 'Find beyond the first page')];
    return route.fulfill({ json: { repository, availability: 'available', observedAt: '2026-11-07T12:00:00Z', dataScope: scope,
      issues, page: selectedPage, sourceRecords: issues.length + (selectedPage === 1 && repository === 'example/repository' && !number ? 23 : 0),
      nextPage: selectedPage === 1 && repository === 'example/repository' && !number ? 2 : null, complete: selectedPage > 1 || repository === 'example/other' || !!number,
      configuredBranch: 'expected', observedBranch: 'main', reason: 'Synthetic collection: bounded live pages, not an atomic snapshot.' } });
  });
  return { methods, fail(status) { failure = status; }, replace() { scope = 'factory-replacement'; title = 'Replacement account work'; } };
}
for (const width of [1280, 390]) test(`factory ${width}: list board filters evidence paging and keyboard`, async ({ page }, info) => {
  await page.setViewportSize({ width, height: 900 }); const source = await fixture(page);
  await page.goto(origin + '/workspace/factory');
  await expect(page.locator('.factory-issue')).toHaveCount(3);
  await expect(page.locator('#factory-results img, #factory-results script')).toHaveCount(0);
  await expect(page.getByText('Configured and observed default branches conflict.', { exact: true })).toHaveCount(2);
  await page.locator('#factory-project-summary').click();
  await page.locator('.factory-project').filter({ has: page.getByRole('heading', { name: 'example/repository', exact: true }) }).getByRole('button', { name: 'Load next issue page' }).click();
  await expect(page.getByRole('link', { name: /Find beyond the first page/ })).toBeVisible();
  await page.selectOption('#factory-repository', 'example/repository');
  await expect(page.locator('.factory-issue')).toHaveCount(2);
  await page.locator('.factory-issue').filter({ hasText: 'Ordinary work' }).getByRole('button', { name: 'Read issue evidence' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#factory-results')).toContainText('propose · Result blocked');
  await expect(page.locator('#factory-results')).toContainText('completed / success');
  await page.locator('#factory-more-filters summary').click();
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
test('exact-number lookup finds uncollected ordinary work and title mode returns to pages', async ({ page }) => {
  await fixture(page); await page.goto(origin + '/workspace/factory');
  await page.fill('#factory-search', '#701'); await page.getByRole('button', { name: 'Apply search' }).click();
  await expect(page.locator('.factory-issue')).toHaveCount(2);
  await expect(page.locator('#factory-scope')).toContainText('Exact-number lookup');
  await expect(page.getByRole('link', { name: /example\/repository#701/ })).toHaveAttribute('href', '/workspace/issues/example/repository/701');
  await page.fill('#factory-search', 'Ordinary'); await page.getByRole('button', { name: 'Apply search' }).click();
  await expect(page.locator('.factory-issue')).toHaveCount(1);
  await expect(page.locator('#factory-scope')).toContainText('Title search and filters cover collected');
  await page.selectOption('#factory-view', 'board'); await page.locator('#factory-more-filters summary').click(); await page.selectOption('#factory-state', 'open');
  await page.reload(); await expect(page.locator('#factory-view')).toHaveValue('board'); await expect(page.locator('#factory-state')).toHaveValue('open');
  await expect(page.locator('.factory-issue')).toHaveCount(1);
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
