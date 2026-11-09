import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const origin = `http://127.0.0.1:${process.env.SOFA_ISSUE_FIXTURE_PORT || '5171'}`;
async function fixture(page) {
  let labels = ['needs-info', 'waiting-review'], status = 200, scope = 'attention-owner';
  const methods = [];
  await page.route('**/api/**', async route => {
    methods.push(route.request().method());
    if (route.request().url().endsWith('/api/connections/github')) return route.fulfill({ json: { state: 'linked', login: 'verified-user', dataScope: scope,
      repositories: [{ repository: 'example/repo', availability: 'available', issuesRead: true }] } });
    return route.fulfill({ status, json: { repository: 'example/repo', availability: status === 200 ? 'available' : 'unavailable', dataScope: scope,
      observedAt: '2026-11-08T01:00:00Z', issues: [{ id: 77, number: 7, title: '<img src=x onerror=alert(1)> question', state: 'open', labels,
        labelsComplete: true, updatedAt: '2026-11-07T10:00:00Z' }], page: 1, sourceRecords: 1, nextPage: 2, complete: false } });
  });
  return { methods, removeLabel() { labels = ['waiting-review']; }, fail(value) { status = value; }, changeAccount() { scope = 'new-account'; labels = []; } };
}
for (const [width, theme] of [[1280, 'dark'], [390, 'light']]) test(`inbox ${width} ${theme}: factual contexts, deduplication and keyboard`, async ({ page }, info) => {
  await page.setViewportSize({ width, height: 900 }); const source = await fixture(page);
  await page.goto(origin + '/workspace/attention');
  await page.locator('html').evaluate((element, value) => element.dataset.lhTheme = value, theme);
  await expect(page.locator('[data-attention-key]')).toHaveCount(2);
  await expect(page.locator('#factory-results')).toContainText('Needs information · open issue');
  await page.locator('[data-attention-key] details').first().click();
  await expect(page.locator('#factory-results')).toContainText('GitHub label: needs-info');
  await expect(page.locator('#factory-results')).toContainText('(not wait duration)');
  await expect(page.locator('#factory-results img, #factory-results script')).toHaveCount(0);
  const focus = page.locator('[data-attention-key]').first().getByRole('link').first();
  await focus.focus(); const key = await focus.getAttribute('data-focus-key');
  await page.locator('#factory-refresh').evaluate(button => button.click());
  await expect(page.locator('[data-attention-key]')).toHaveCount(2);
  await expect(page.locator(`[data-focus-key="${key}"]`)).toBeFocused();
  await expect(page.locator('#factory-status')).toContainText('received');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(source.methods.every(method => method === 'GET')).toBe(true);
  await page.screenshot({ path: info.outputPath(`inbox-${width}-${theme}.png`), fullPage: true });
});
test('inbox label removal and failed refresh preserve uncertainty; denial and account switch clear private history', async ({ page }) => {
  const source = await fixture(page); await page.goto(origin + '/workspace/attention');
  await expect(page.locator('[data-attention-key]')).toHaveCount(2);
  source.removeLabel(); await page.getByRole('button', { name: 'Refresh collection' }).click();
  await expect(page.locator('#factory-results')).toContainText('Not observed in this collection; resolution is unknown.');
  source.fail(503); await page.getByRole('button', { name: 'Refresh collection' }).click();
  await expect(page.locator('#factory-results')).toContainText('Stale observation');
  await page.locator('[data-attention-key] details').first().click();
  await expect(page.locator('#factory-results')).toContainText('2026-11-08T01:00:00.000Z');
  source.fail(403); await page.getByRole('button', { name: 'Refresh collection' }).click();
  await expect(page.locator('[data-attention-key]')).toHaveCount(0);
  source.fail(200); source.changeAccount(); await page.getByRole('button', { name: 'Refresh collection' }).click();
  await expect(page.locator('[data-attention-key]')).toHaveCount(0);
});

for (const width of [1280, 390]) test(`verified intervention ${width}: inspect on demand and reconcile explicit Continue`, async ({ page }, info) => {
  await page.setViewportSize({ width, height: 900 }); await fixture(page);
  let reads = 0; const operations = [];
  const facts = { repository: { name: 'example/repo' }, issue: { id: 77, number: 7 }, actor: { id: 71 },
    question: { availability: 'available', current: true, text: '<script>window.questionRan=true</script> Choose the scoped answer.', commentId: 91, sourceUpdatedAt: '2026-11-07T10:00:00Z' },
    reservation: { availability: 'available' }, actions: { comment: { eligible: true }, continue: { eligible: true } } };
  await page.route('**/api/controls/csrf', route => route.fulfill({ json: { token: 'scoped-fixture-token' } }));
  await page.route('**/api/issues/**/controls', route => {
    if (route.request().method() === 'GET') { reads++; return route.fulfill({ json: { availability: 'available', dataScope: 'attention-owner', actingUserId: 71, observedAt: '2026-11-08T08:00:00Z', submissionAvailable: true, facts } }); }
    const input = route.request().postDataJSON(); operations.push(input.operation);
    return route.fulfill({ json: { availability: 'available', dataScope: 'attention-owner', actingUserId: 71,
      observedAt: '2026-11-08T08:00:00Z', id: 'a'.repeat(32), journalState: input.operation === 'prepare' ? 'prepared' : 'claimed',
      intent: { action: 'continue', body: 'The original scoped answer.' }, effect: { kind: 'comment' },
      ...(input.operation !== 'prepare' ? { receiptObservedAt: '2026-11-08T08:00:00Z', receipt: {
        state: input.operation === 'reconcile' ? 'source-admitted' : 'submitted', sourceAcknowledged: input.operation === 'reconcile', questionResolved: input.operation === 'reconcile' } } : {}) } });
  });
  await page.goto(origin + '/workspace/attention'); await expect(page.locator('[data-attention-key]')).toHaveCount(2);
  expect(reads).toBe(0);
  const card = page.locator('[data-attention-key]').first();
  await card.getByRole('button', { name: 'Inspect current question' }).focus(); await page.keyboard.press('Enter');
  const context = card.getByRole('region', { name: /Current source context/ });
  await expect(context).toContainText('Verified current question'); await expect(context.getByRole('heading', { name: 'Verified source context' })).toBeFocused();
  await expect(context).toContainText('<script>window.questionRan=true</script>'); await expect(context.locator('script')).toHaveCount(0);
  expect(reads).toBe(1);
  await context.getByLabel('Your comment or answer').fill('The original scoped answer.');
  await context.getByRole('button', { name: 'Review answer and continue' }).click();
  await expect(context.getByRole('button', { name: 'Confirm and send' })).toBeVisible();
  expect(operations).toEqual(['prepare']);
  await context.getByRole('button', { name: 'Confirm and send' }).click();
  await expect(context).toContainText('Question resolved: unconfirmed');
  await context.getByRole('button', { name: 'Reconcile source result' }).click();
  await expect(context).toContainText('Question resolved: yes');
  expect(operations).toEqual(['prepare', 'submit', 'reconcile']);
  await expect(page.locator('[data-attention-key]')).toHaveCount(2);
  expect(await page.evaluate(() => window.questionRan)).toBeUndefined();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('[data-attention-key]').nth(1).getByRole('button', { name: 'Inspect current question' }).click();
  await expect(page.getByRole('heading', { name: 'Verified source context' })).toHaveCount(2);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await context.screenshot({ path: info.outputPath(`verified-question-${width}.png`) });
});

test('a late verified question cannot repopulate an inbox after its acting account changed', async ({ page }) => {
  const source = await fixture(page); let release, started;
  const held = new Promise(resolve => { release = resolve; }), began = new Promise(resolve => { started = resolve; });
  await page.route('**/api/issues/**/controls', async route => {
    started(); await held;
    return route.fulfill({ json: { availability: 'available', dataScope: 'attention-owner', actingUserId: 71,
      observedAt: '2026-11-08T08:00:00Z', facts: { repository: { name: 'example/repo' }, issue: { id: 77, number: 7 }, actor: { id: 71 },
        question: { availability: 'available', current: true, text: 'Old account private question' } } } });
  });
  await page.goto(origin + '/workspace/attention');
  await page.locator('[data-attention-key]').first().getByRole('button', { name: 'Inspect current question' }).click(); await began;
  source.changeAccount(); await page.getByRole('button', { name: 'Refresh collection' }).click();
  await expect(page.locator('[data-attention-key]')).toHaveCount(0); release();
  await expect(page.locator('#factory-results')).not.toContainText('Old account private question');
});
