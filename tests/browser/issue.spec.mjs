import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const origin = `http://127.0.0.1:${process.env.SOFA_ISSUE_FIXTURE_PORT || '5171'}`;
function source(page = 1) {
  return { repository: 'example/repository', number: 7, availability: 'available', observedAt: '2026-11-07T12:00:00Z', actingUserId: 71, dataScope: 'fixture-71', evidenceReadAllowed: true, snapshot: 'bounded-source-snapshot',
    issue: { id: 70, number: 7, title: 'Read an ordinary issue', body: '# Problem\nUse **source evidence**.\n<script>window.sourceExecuted=true</script>\n[unsafe](javascript:alert(1))\n```html\n<img src=x onerror=alert(1)>\n```', state: 'open', author: 'factory-owner', updatedAt: '2026-11-07T11:00:00Z', labels: ['agent-working', 'needs-info'], sourceUrl: 'https://github.com/example/repository/issues/7' },
    conversation: { availability: 'available', items: Array.from({ length: page === 1 ? 100 : 1 }, (_, index) => ({ id: page === 1 ? index + 1 : 101, author: 'participant', body: 'Conversation evidence ' + (index + 1) + '\n```\n' + 'long-source-value'.repeat(12) + '\n```', updatedAt: '2026-11-07T11:00:00Z', sourceUrl: `https://github.com/example/repository/issues/7#issuecomment-${page === 1 ? index + 1 : 101}` })), page, perPage: 100, sourceCount: 101, nextPage: page === 1 ? 2 : null, complete: page === 2, reason: 'Source pagination is not atomic.' } };
}
async function fixture(page, { unavailable = false } = {}) {
  let failure = unavailable, restricted = false, conversationUnavailable = false, scope = 'fixture-71', controls = { availability: 'unsupported', reason: 'Installed contract unavailable.' };
  const methods = [];
  await page.route('**/api/issues/**', async route => {
    methods.push(route.request().method());
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/controls')) return route.fulfill({ json: { ...controls, dataScope: scope, actingUserId: 71, observedAt: '2026-11-08T06:00:00Z' } });
    if (url.pathname.endsWith('/evidence') && restricted) return route.fulfill({ json: { availability: 'restricted', dataScope: scope, reports: [], reason: 'Actions-read access was removed.' } });
    if (url.pathname.endsWith('/evidence')) return route.fulfill({ json: { availability: 'available', dataScope: 'fixture-71', reports: [{ commentId: 90, sourceUrl: 'https://github.com/example/repository/issues/7#issuecomment-90', availability: 'available', stage: 'propose', result: 'blocked', sourceRevision: 'a'.repeat(40), runId: 500, attempt: 2, executionStatus: 'completed', executionConclusion: 'success', reason: 'Published result; current host lease unavailable.', missingEvidence: ['Proposal artifact has expired.'], pendingReview: ['Answer the source question.'] }], scope: 'Synthetic fixture: one source-associated report; other evidence unavailable.' } });
    const data = { ...source(Number(url.searchParams.get('page') || 1)), dataScope: scope, evidenceReadAllowed: !restricted };
    if (conversationUnavailable) data.conversation = { ...data.conversation, availability: 'unavailable', items: [], reason: 'Temporary conversation outage.' };
    return failure ? route.fulfill({ status: failure === true ? 503 : failure, json: {} }) : route.fulfill({ json: data });
  });
  return { methods, fail(value = true) { failure = value; }, restrictEvidence() { restricted = true; }, replaceAccount() { scope = 'replacement-71'; }, failConversation() { conversationUnavailable = true; }, controls(value) { controls = value; } };
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
  await expect(page.locator('#controls-status')).toContainText('Previous shared observations are stale');
  await expect(page.locator('#issue-comments > li')).toHaveCount(100);
  await expect(page.locator('#issue-age')).toContainText('2026-11-07T12:00:00Z');
  harness.fail(403); await page.getByRole('button', { name: 'Refresh source' }).click();
  await expect(page.locator('#issue-comments > li')).toHaveCount(0);
  await expect(page.locator('#issue-body')).toBeEmpty();
  await expect(page.locator('#issue-evidence')).toBeEmpty();
  await expect(page.locator('#issue-title')).toHaveText('Issue workspace');
});
test('initial failure does not invent an ordinary issue or empty conversation', async ({ page }) => {
  await fixture(page, { unavailable: true });
  await page.goto(origin + '/workspace/issues/example/repository/7');
  await expect(page.locator('#issue-status')).toContainText('no issue or empty conversation is inferred');
  await expect(page.locator('#issue-body')).toBeEmpty();
});

test('losing Actions access removes execution evidence while authorized issue context remains readable', async ({ page }) => {
  const harness = await fixture(page);
  await page.goto(origin + '/workspace/issues/example/repository/7');
  await expect(page.locator('#issue-evidence')).toContainText('propose · blocked');
  harness.restrictEvidence(); await page.getByRole('button', { name: 'Load more comments' }).click();
  await expect(page.locator('#evidence-status')).toContainText('Actions-read access was removed');
  await expect(page.locator('#issue-evidence')).toBeEmpty();
  await expect(page.locator('#issue-comments > li')).toHaveCount(101);
  await expect(page.locator('#issue-title')).toContainText('Read an ordinary issue');
});
test('very long source text keeps a bounded DOM and preserves the full remaining content', async ({ page }) => {
  await page.route('**/api/issues/**', route => {
    if (new URL(route.request().url()).pathname.endsWith('/controls')) return route.fulfill({ json: { availability: 'unsupported', dataScope: 'fixture-71' } });
    if (new URL(route.request().url()).pathname.endsWith('/evidence')) return route.fulfill({ json: { availability: 'available', dataScope: 'fixture-71', reports: [], scope: 'Synthetic fixture.' } });
    const data = source(); data.issue.body = '# Source paragraph\n'.repeat(10000) + 'end-of-source-body';
    data.conversation = { ...data.conversation, items: [], sourceCount: 0, nextPage: null, complete: true };
    return route.fulfill({ json: data });
  });
  await page.goto(origin + '/workspace/issues/example/repository/7');
  await expect(page.locator('#issue-status')).toContainText('loaded from GitHub');
  expect(await page.locator('#issue-body *').count()).toBeLessThan(12000);
  await expect(page.locator('#issue-body .source-markdown > pre')).toContainText('end-of-source-body');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('a changed connection during pagination removes the earlier account context', async ({ page }) => {
  const harness = await fixture(page);
  await page.goto(origin + '/workspace/issues/example/repository/7');
  await expect(page.locator('#issue-comments > li')).toHaveCount(100);
  await expect(page.locator('#issue-evidence')).toContainText('propose · blocked');
  harness.replaceAccount(); await page.getByRole('button', { name: 'Load more comments' }).click();
  await expect(page.locator('#issue-status')).toContainText('connected account changed');
  await expect(page.locator('#issue-title')).toHaveText('Issue workspace');
  await expect(page.locator('#issue-comments > li')).toHaveCount(0);
  await expect(page.locator('#issue-body')).toBeEmpty();
  await expect(page.locator('#issue-evidence')).toBeEmpty();
});

test('known Actions grant loss removes old evidence even when conversation refresh is unavailable', async ({ page }) => {
  const harness = await fixture(page);
  await page.goto(origin + '/workspace/issues/example/repository/7');
  await expect(page.locator('#issue-evidence')).toContainText('propose · blocked');
  harness.restrictEvidence(); harness.failConversation();
  await page.getByRole('button', { name: 'Refresh source' }).click();
  await expect(page.locator('#issue-evidence')).toBeEmpty();
  await expect(page.locator('#evidence-status')).toContainText('Actions-read access is unavailable');
  await expect(page.locator('#issue-comments > li')).toHaveCount(100);
  await expect(page.locator('#issue-status')).toContainText('stale');
});

for (const width of [1280, 390]) test(`shared source question ${width}: safe text, separate eligibility and no submission`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  const harness = await fixture(page);
  harness.controls({ availability: 'available', facts: {
    repository: { id: 22, name: 'example/repository' }, issue: { id: 70, number: 7 }, actor: { id: 71 },
    question: { availability: 'available', current: true, text: '<script>window.questionExecuted=true</script> Which repository?',
      sourceUpdatedAt: '2026-11-07T10:00:00Z', source: 'https://github.com/example/repository/issues/7#issuecomment-90' },
    reservation: { availability: 'unavailable', reason: 'reservation-evidence-unavailable' },
    actions: { comment: { eligible: true, availability: 'available' }, continue: { eligible: false, availability: 'unavailable', reason: 'reservation-evidence-unavailable' } }
  } });
  await page.goto(origin + '/workspace/issues/example/repository/7');
  await expect(page.locator('#issue-controls')).toContainText('Verified current question');
  await expect(page.locator('#issue-controls')).toContainText('<script>window.questionExecuted=true</script>');
  await expect(page.locator('#issue-controls')).toContainText('Question source updated: 2026-11-07T10:00:00Z · Observed: 2026-11-08T06:00:00Z');
  await expect(page.locator('#issue-controls')).toContainText('Ordinary comment · Source: eligible · SoFa submission: unavailable');
  await expect(page.locator('#issue-controls button, #issue-controls script')).toHaveCount(0);
  expect(await page.evaluate(() => window.questionExecuted)).toBeUndefined();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(harness.methods.every(method => method === 'GET')).toBe(true);
  await page.locator('#issue-controls').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `test-results/issue/shared-question-${width}.png`, fullPage: false });
});

test('shared source authority loss clears the earlier private issue and question', async ({ page }) => {
  const harness = await fixture(page);
  harness.controls({ availability: 'available', facts: { repository: { name: 'example/repository' }, issue: { number: 7 }, actor: { id: 71 },
    question: { availability: 'available', current: true, text: 'Private source question' } } });
  await page.goto(origin + '/workspace/issues/example/repository/7');
  await expect(page.locator('#issue-controls')).toContainText('Private source question');
  await page.route('**/api/issues/**/controls', route => route.fulfill({ status: 403, json: { availability: 'denied' } }));
  await page.getByRole('button', { name: 'Refresh source' }).click();
  await expect(page.locator('#issue-controls')).toBeEmpty();
  await expect(page.locator('#issue-body')).toBeEmpty();
  await expect(page.locator('#issue-status')).toContainText('Source authority changed');
});

for (const width of [1280, 390]) test(`explicit source action ${width}: confirmation, lost response and recovery without another send`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  const harness = await fixture(page);
  harness.controls({ availability: 'available', submissionAvailable: true, facts: {
    repository: { name: 'example/repository' }, issue: { number: 7 }, actor: { id: 71 },
    actions: { comment: { eligible: true }, refine: { eligible: true }, continue: { eligible: false } }
  } });
  let entry = null; const operations = [];
  await page.route('**/api/controls/csrf', route => route.fulfill({ json: { token: 'browser-test-csrf' } }));
  await page.route('**/api/issues/**/controls', route => {
    if (route.request().method() === 'GET') return route.fallback();
    expect(route.request().headers()['x-sofa-csrf']).toBe('browser-test-csrf');
    const input = route.request().postDataJSON(); operations.push(input.operation);
    if (input.operation === 'prepare') entry = { availability: 'available', dataScope: 'fixture-71', actingUserId: 71,
      observedAt: '2026-11-08T08:00:00Z', id: 'a'.repeat(32), journalState: 'prepared',
      intent: { action: input.action, body: input.body }, effect: { kind: 'comment' } };
    if (input.operation === 'submit') { entry = { ...entry, journalState: 'claimed' }; return route.fulfill({ status: 503, json: { reason: 'Response lost; recover the same confirmation.' } }); }
    if (input.operation === 'reconcile') entry = { ...entry, receipt: { state: 'comment-published', questionResolved: false,
      source: 'https://github.com/example/repository/issues/7#issuecomment-91' } };
    return route.fulfill({ json: entry });
  });
  await page.goto(origin + '/workspace/issues/example/repository/7');
  await expect(page.getByRole('button', { name: 'Prepare ordinary comment' })).toBeVisible();
  await page.getByLabel('Your comment or answer').fill('<script>window.replyExecuted=true</script>');
  await page.getByRole('button', { name: 'Prepare ordinary comment' }).focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('region', { name: 'Action confirmation' })).toContainText('does not resume work');
  expect(operations).toEqual(['prepare']);
  await expect(page.locator('#control-actions script')).toHaveCount(0);
  await page.getByRole('button', { name: 'Confirm and send' }).focus(); await page.keyboard.press('Enter');
  await expect(page.locator('#control-actions')).toContainText('No automatic resend');
  await expect(page.getByRole('button', { name: 'Confirm and send' })).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: 'Recover previous action' }).click();
  await expect(page.getByRole('region', { name: 'Action confirmation' })).toContainText('a'.repeat(32));
  await page.getByRole('button', { name: 'Reconcile source result' }).click();
  await expect(page.getByRole('region', { name: 'Action confirmation' })).toContainText('comment-published');
  await expect(page.locator('#control-actions')).toContainText('Question resolved: unconfirmed');
  expect(operations.filter(item => item === 'submit')).toHaveLength(1);
  expect(await page.evaluate(() => window.replyExecuted)).toBeUndefined();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.locator('#control-actions').screenshot({ path: `test-results/issue/controls-${width}.png` });
});
