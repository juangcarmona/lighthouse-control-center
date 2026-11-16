import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const origin = `http://127.0.0.1:${process.env.SOFA_ISSUE_FIXTURE_PORT || '5171'}`;
const head = 'a'.repeat(40), merged = 'c'.repeat(40), old = 'b'.repeat(40);

// Synthetic handling evidence only. No connected-user result or merge is claimed.
function evidence() {
  return { availability: 'available', dataScope: 'delivery-fixture', repositoryId: 10, issueId: 70, conversationPage: 1,
    observedAt: '2026-11-16T10:00:00Z', scope: 'Controlled delivery fixture; bounded, not source acceptance.',
    reports: [{ commentId: 90, availability: 'available', stage: 'integrate', result: 'blocked',
      sourceUrl: 'https://github.com/example/repository/issues/7#issuecomment-90',
      missingEvidence: ['Required human integration decision is missing.', 'Required result artifact is missing.'], runId: 500, attempt: 2,
      executionStatus: 'completed', executionConclusion: 'success', sourceRevision: head }],
    pullRequests: [{ number: 13, title: 'Controlled squash result', sourceUrl: 'https://github.com/example/repository/pull/13',
      availability: 'available', state: 'closed', headRevision: head, checksAvailability: 'available',
      checks: [{ id: 1, name: 'verify head', status: 'completed', conclusion: 'success', headRevision: old, revisionBinding: 'stale' }],
      reviewsAvailability: 'partial', reviews: [{ id: 80, actor: '<script>unsafe()</script>', state: 'APPROVED', commitId: old, submittedAt: '2026-11-15T10:00:00Z' }],
      integration: { availability: 'available', revision: merged, mergedAt: '2026-11-16T09:00:00Z', targetBranch: 'main', defaultBranch: 'main',
        checksAvailability: 'available', checks: [{ id: 2, name: 'verify integrated', status: 'completed', conclusion: 'success', headRevision: merged, revisionBinding: 'exact' }],
        runsAvailability: 'partial', runs: [{ id: 900, attempt: 2, revision: merged, branch: 'main', event: 'push', status: 'completed', conclusion: 'success',
          sourceUrl: 'https://github.com/example/repository/actions/runs/900', startedAt: '2026-11-16T09:01:00Z', updatedAt: '2026-11-16T09:05:00Z',
          artifactsAvailability: 'available', artifacts: [{ id: 12, name: 'result <script>unsafe()</script>', availability: 'expired', compressedBytes: 10 }] }],
        reason: 'Source-confirmed merge observation, not delivery acceptance. Required-check applicability and integration authorization remain unestablished.' } }] };
}

async function fixture(page) {
  let current = evidence(), denied = false;
  const methods = [];
  await page.route('**/api/session', route => route.fulfill({ json: { authenticated: true, displayName: 'Controlled operator' } }));
  await page.route('**/api/issues/**', route => {
    methods.push(route.request().method());
    const path = new URL(route.request().url()).pathname;
    if (denied) return route.fulfill({ status: 403, json: { availability: 'denied', reason: 'Source authority removed.' } });
    if (path.endsWith('/controls')) return route.fulfill({ json: { availability: 'unsupported', dataScope: 'delivery-fixture', reason: 'Shared source contract unavailable.' } });
    if (path.endsWith('/evidence')) return route.fulfill({ json: current });
    return route.fulfill({ json: { repository: 'example/repository', number: 7, availability: 'available', dataScope: 'delivery-fixture', actingUserId: 71,
      observedAt: '2026-11-16T10:00:00Z', snapshot: 'delivery-page', evidenceReadAllowed: true,
      issue: { id: 70, number: 7, title: 'Inspect exact integration evidence', body: 'Controlled proposal content; inspect its source separately.', state: 'open', labels: [], sourceUrl: 'https://github.com/example/repository/issues/7' },
      conversation: { availability: 'available', items: [], page: 1, nextPage: null, sourceCount: 0, complete: true } } });
  });
  return { methods, replace(value) { current = value; }, deny() { denied = true; } };
}

async function openIntegration(page) {
  await page.locator('.issue-evidence-details > summary').click();
  const pull = page.locator('#related-pr-13');
  await pull.getByText('Integration and exact-commit observations', { exact: true }).focus();
  await page.keyboard.press('Enter');
  return pull;
}

for (const width of [1280, 390]) for (const theme of ['light', 'dark']) {
  test(`delivery visual contract ${width} ${theme}: exact commit, limits and unavailable actions`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    const harness = await fixture(page);
    await page.goto(origin + '/workspace/issues/example/repository/7');
    await page.evaluate(theme => document.documentElement.dataset.lhTheme = theme, theme);
    const pull = await openIntegration(page);
    await expect(pull).toContainText('Integrated revision: ' + merged);
    await expect(pull.getByRole('link', { name: 'Inspect integrated commit' })).toHaveAttribute('href', 'https://github.com/example/repository/commit/' + merged);
    await expect(pull).toContainText('Deployment evidence is unavailable');
    await expect(pull).toContainText('not delivery acceptance');
    await pull.getByText('PR head, checks and reviews', { exact: true }).click();
    await expect(pull).toContainText('Head revision: ' + head);
    await expect(pull).toContainText('Binding stale');
    await expect(pull).toContainText('Protected human approval and integration authorization are not established');
    await expect(pull.locator('script')).toHaveCount(0);
    await pull.getByText('Workflow 900 · Attempt 2 · completed / success', { exact: true }).click();
    await expect(pull).toContainText('expired');
    await expect(pull).toContainText('contents and provenance are not verified');
    await expect(page.locator('#issue-evidence')).toContainText('Required human integration decision is missing.');
    await expect(page.locator('#issue-evidence')).toContainText('Required result artifact is missing.');
    await page.getByText('Implement, Integrate and Review unavailable', { exact: true }).focus();
    await page.keyboard.press('Enter');
    const unavailable = page.locator('#later-stage-capabilities');
    await expect(unavailable).toContainText('does not expose typed Implement, Integrate or Review actions');
    await expect(unavailable.locator('button')).toHaveCount(0);
    expect(harness.methods.every(method => method === 'GET')).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    const focus = unavailable.locator('summary');
    await expect(focus).toBeFocused();
    expect(await focus.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe('none');
    await unavailable.screenshot({ path: info.outputPath(`unavailable-${width}-${theme}.png`) });
    await pull.screenshot({ path: info.outputPath(`exact-commit-${width}-${theme}.png`) });
    await page.locator('#issue-evidence').screenshot({ path: info.outputPath(`human-gate-${width}-${theme}.png`) });
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: info.outputPath(`delivery-layout-${width}-${theme}.png`), fullPage: true });
  });
}

test('failed integration and missing artifacts remain explicit after refresh', async ({ page }) => {
  const harness = await fixture(page);
  await page.goto(origin + '/workspace/issues/example/repository/7');
  await openIntegration(page);
  const failed = evidence();
  failed.pullRequests[0].integration = { availability: 'unconfirmed', reason: 'Integration failed; no resulting commit is source-confirmed.' };
  harness.replace(failed);
  await page.getByRole('button', { name: 'Refresh source' }).click();
  const pull = page.locator('#related-pr-13');
  await pull.getByText('Integration and exact-commit observations', { exact: true }).click();
  await expect(pull).toContainText('Integration failed');
  await expect(pull.getByRole('link', { name: 'Inspect integrated commit' })).toHaveCount(0);
  await expect(pull).toContainText('verification remains unknown');
  await expect(page.locator('#issue-evidence')).toContainText('Required result artifact is missing.');
  expect(harness.methods.every(method => method === 'GET')).toBe(true);
});

test('source authority loss clears integrated observations', async ({ page }) => {
  const harness = await fixture(page);
  await page.goto(origin + '/workspace/issues/example/repository/7');
  await openIntegration(page);
  await expect(page.locator('#issue-evidence')).toContainText(merged);
  harness.deny();
  await page.getByRole('button', { name: 'Refresh source' }).click();
  await expect(page.locator('#issue-evidence')).toBeEmpty();
  await expect(page.locator('#issue-body')).toBeEmpty();
});

test('a changed PR head and unknown checks never expose a later-stage send path', async ({ page }) => {
  const harness = await fixture(page);
  const data = evidence();
  data.pullRequests[0].headRevision = 'd'.repeat(40);
  data.pullRequests[0].checks[0].revisionBinding = 'unknown';
  data.pullRequests[0].checks[0].headRevision = null;
  harness.replace(data);
  await page.goto(origin + '/workspace/issues/example/repository/7');
  const pull = await openIntegration(page);
  await pull.getByText('PR head, checks and reviews', { exact: true }).click();
  await pull.getByText('verify head: completed / success · Binding unknown', { exact: true }).click();
  await expect(pull).toContainText('does not establish verification for the displayed revision');
  await expect(pull).toContainText('Head revision: ' + 'd'.repeat(40));
  await expect(page.getByRole('button', { name: /Implement|Integrate|Review (?:Implement|Integrate|Review)/ })).toHaveCount(0);
  expect(harness.methods.every(method => method === 'GET')).toBe(true);
});
