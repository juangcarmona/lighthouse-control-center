import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const origin = 'http://127.0.0.1:5171';
function source(page = 1) {
  return { repository: 'example/repository', number: 7, availability: 'available', observedAt: '2026-11-07T12:00:00Z', actingUserId: 71, snapshot: 'bounded-source-snapshot',
    issue: { id: 70, number: 7, title: 'Read an ordinary issue', body: '# Problem\nUse **source evidence**.\n<script>window.sourceExecuted=true</script>\n[unsafe](javascript:alert(1))\n```html\n<img src=x onerror=alert(1)>\n```', state: 'open', author: 'factory-owner', updatedAt: '2026-11-07T11:00:00Z', labels: ['agent-working', 'needs-info'], sourceUrl: 'https://github.com/example/repository/issues/7' },
    conversation: { availability: 'available', items: Array.from({ length: page === 1 ? 100 : 1 }, (_, index) => ({ id: page === 1 ? index + 1 : 101, author: 'participant', body: 'Conversation evidence ' + (index + 1) + '\n```\n' + 'long-source-value'.repeat(12) + '\n```', updatedAt: '2026-11-07T11:00:00Z', sourceUrl: `https://github.com/example/repository/issues/7#issuecomment-${page === 1 ? index + 1 : 101}` })), page, perPage: 100, sourceCount: 101, nextPage: page === 1 ? 2 : null, complete: page === 2, reason: 'Source pagination is not atomic.' } };
}
async function fixture(page, { unavailable = false } = {}) {
  let failure = unavailable;
  const methods = [];
  await page.route('**/api/issues/**', async route => {
    methods.push(route.request().method());
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/evidence')) return route.fulfill({ json: { availability: 'available', reports: [{ commentId: 90, sourceUrl: 'https://github.com/example/repository/issues/7#issuecomment-90', availability: 'available', stage: 'propose', result: 'blocked', sourceRevision: 'a'.repeat(40), runId: 500, attempt: 2, executionStatus: 'completed', executionConclusion: 'success', reason: 'Published result; current host lease unavailable.', missingEvidence: ['Proposal artifact has expired.'], pendingReview: ['Answer the source question.'] }], scope: 'Synthetic fixture: one source-associated report; other evidence unavailable.' } });
    return failure ? route.fulfill({ status: failure === true ? 503 : failure, json: {} }) : route.fulfill({ json: source(Number(url.searchParams.get('page') || 1)) });
  });
  return { methods, fail(value = true) { failure = value; } };
}
for (const width of [1280, 390]) test(`issue context ${width}: paginated, inert Markdown, blocked result, keyboard and accessibility`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  const harness = await fixture(page);
  await page.goto(origin + '/workspace/issues/example/repository/7');
  await expect(page.locator('#issue-title')).toContainText('Read an ordinary issue');
  await expect(page.locator('#issue-comments > li')).toHaveCount(100);
  await expect(page.locator('#issue-evidence')).toContainText('propose · blocked');
  await expect(page.locator('#issue-evidence')).toContainText('completed / success');
  expect(await page.evaluate(() => window.sourceExecuted)).toBeUndefined();
  await expect(page.locator('#issue-body script, #issue-body img, #issue-body a[href^="javascript:"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Load more comments' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#issue-comments > li')).toHaveCount(101);
  await expect(page.locator('#conversation-coverage')).toContainText('End observed');
  await expect(page.getByRole('button', { name: 'Load more comments' })).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(harness.methods.every(method => method === 'GET')).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `test-results/issue/context-${width}.png`, fullPage: false });
});
test('temporary failure retains stale context; source authority loss removes every prior record', async ({ page }) => {
  const harness = await fixture(page);
  await page.goto(origin + '/workspace/issues/example/repository/7');
  await expect(page.locator('#issue-comments > li')).toHaveCount(100);
  harness.fail(); await page.getByRole('button', { name: 'Refresh source' }).click();
  await expect(page.locator('#issue-status')).toContainText('stale');
  await expect(page.locator('#issue-comments > li')).toHaveCount(100);
  await expect(page.locator('#issue-age')).toContainText('2026-11-07T12:00:00Z');
  harness.fail(403); await page.getByRole('button', { name: 'Refresh source' }).click();
  await expect(page.locator('#issue-comments > li')).toHaveCount(0);
  await expect(page.locator('#issue-body')).toBeEmpty();
  await expect(page.locator('#issue-evidence')).toBeEmpty();
});
test('initial failure does not invent an ordinary issue or empty conversation', async ({ page }) => {
  await fixture(page, { unavailable: true });
  await page.goto(origin + '/workspace/issues/example/repository/7');
  await expect(page.locator('#issue-status')).toContainText('no issue or empty conversation is inferred');
  await expect(page.locator('#issue-body')).toBeEmpty();
});
