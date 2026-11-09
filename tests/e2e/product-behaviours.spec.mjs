import { test as base, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const repository = process.env.LCC_E2E_REPOSITORY;
const issue = Number(process.env.LCC_E2E_ISSUE);
if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository ?? '') || !Number.isSafeInteger(issue) || issue < 1)
  throw Error('Explicit LCC_E2E_REPOSITORY and positive LCC_E2E_ISSUE are required.');
const origin = process.env.LCC_E2E_ORIGIN;
const issuePath = '/workspace/issues/' + repository + '/' + issue;
const controlsPath = '/api/issues/' + repository + '/' + issue + '/controls';

const test = base.extend({
  owner: [async ({ browser }, use) => {
    if (!process.env.LCC_E2E_REALM_FILE || !process.env.LCC_E2E_USER) throw Error('Explicit development realm file and user are required.');
    const realm = JSON.parse(await readFile(process.env.LCC_E2E_REALM_FILE, 'utf8'));
    const user = realm.users?.find(value => value.username === process.env.LCC_E2E_USER);
    const password = user?.credentials?.find(value => value.type === 'password')?.value;
    if (!password) throw Error('Selected development test user is unavailable.');
    const context = await browser.newContext({ baseURL: origin, ignoreHTTPSErrors: false });
    const page = await context.newPage();
    try {
      try {
        await page.goto('/');
        await page.getByRole('button', { name: 'Sign in', exact: true }).click();
        await page.locator('#username').fill(user.username);
        await page.locator('#password').fill(password);
        await page.locator('#kc-login').click();
        await page.waitForURL(url => url.origin === new URL(origin).origin && !url.pathname.startsWith('/signin'));
        expect((await context.request.get('/api/session')).status()).toBe(200);
      } catch { throw Error('Trusted development sign-in failed; login data and traces are intentionally not retained.'); }
      await page.close();
      await use(context);
    } finally { await context.close(); }
  }, { scope: 'worker' }],
  signedPage: async ({ owner }, use) => {
    const page = await owner.newPage();
    await use(page);
    await page.close();
  },
});

test('live repository discovery preserves source identity and collection coverage', async ({ signedPage: page }, info) => {
  await page.goto('/workspace/repositories');
  const repositoryLink = page.getByRole('link', { name: repository, exact: true });
  await expect(repositoryLink).toBeVisible();
  await repositoryLink.click();
  await expect(page).toHaveURL(url => url.pathname === '/workspace/repositories/' + repository);
  await expect(page.locator('.factory-issue').first()).toBeVisible();
  await expect(page.locator('#factory-count')).toContainText('issues');
  await expect(page.locator('#factory-projects')).toContainText('coverage');
  const source = await page.request.get('/api/factory/' + repository + '?number=' + issue);
  expect(source.status()).toBe(200);
  const exact = await source.json();
  expect(exact.availability).toBe('available');
  expect(exact.issues).toHaveLength(1);
  expect(exact.issues[0].number).toBe(issue);
  expect(exact.issues[0].sourceUrl).toBe('https://github.com/' + repository + '/issues/' + issue);
  await page.screenshot({ path: info.outputPath('repository.png') });
});

test('live issue context retains actual description conversation and source provenance', async ({ signedPage: page }, info) => {
  const response = await page.request.get('/api/issues/' + repository + '/' + issue);
  expect(response.status()).toBe(200);
  const source = await response.json();
  expect(source.availability).toBe('available');
  expect(source.issue.number).toBe(issue);
  await page.goto(issuePath);
  await expect(page.locator('#issue-title')).toHaveText(source.issue.title);
  await expect(page.locator('#issue-body')).not.toBeEmpty();
  await expect(page.locator('#conversation-coverage')).toContainText('Source');
  await expect(page.locator('#issue-comments > li')).toHaveCount(source.conversation.items.length);
  await page.screenshot({ path: info.outputPath('issue.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('.header-identity strong')).not.toBeEmpty();
  await page.screenshot({ path: info.outputPath('issue-narrow.png') });
});

test('live action authority explains unavailable dependencies without granting a write', async ({ signedPage: page }, info) => {
  const response = await page.request.get(controlsPath);
  const source = await response.json();
  await page.goto(issuePath);
  await expect(page.locator('#controls-status')).not.toContainText('Checking');
  const blocked = source.availability !== 'available' || Object.values(source.facts?.actions ?? {}).some(action => !action.eligible);
  test.skip(!blocked, 'This configured source has no unavailable action prerequisite; the negative example needs another scope.');
  await expect(page.locator('#control-actions button:disabled').first()).toBeVisible();
  await expect(page.locator('#mission-actions')).toContainText(/unavailable|permission|authority|supported/i);
  await info.attach('source-authority', { body: Buffer.from(JSON.stringify({ availability: source.availability, reason: source.reason,
    missingReadScopes: source.missingReadScopes, sourceWritePerformed: false })), contentType: 'application/json' });
});

test('live anonymous denial returns no protected issue information', async ({ request }) => {
  const response = await request.get('/api/issues/' + repository + '/' + issue, { maxRedirects: 0 });
  expect([401, 403]).toContain(response.status());
  expect(await response.text()).not.toContain('"issue"');
});

test('live ordinary comment is confirmed by its source identity without continuation', async ({ signedPage: page }, info) => {
  test.skip(process.env.LCC_E2E_ALLOW_COMMENT !== 'true', 'Actual comment publication requires explicit opt-in on the selected issue.');
  const source = await (await page.request.get(controlsPath)).json();
  expect(source.availability, 'Actual source preflight is required; unavailable authority is not a successful comment test.').toBe('available');
  expect(source.facts?.actions?.comment?.eligible).toBe(true);
  expect(source.submissionAvailable).toBe(true);
  await page.goto(issuePath);
  const body = 'Lighthouse Control Center E2E: ordinary comment confirmation ' + new Date().toISOString() + '. This action requests no continuation.';
  await page.getByLabel('Your comment or answer').fill(body);
  await page.getByRole('button', { name: 'Review comment', exact: true }).click();
  const confirmation = page.getByRole('region', { name: 'Action confirmation', exact: true });
  await expect(confirmation).toContainText('does not resume work');
  const submitted = page.waitForResponse(response => response.url().endsWith(controlsPath) && response.request().method() === 'POST'
    && response.request().postDataJSON()?.operation === 'submit');
  await page.getByRole('button', { name: 'Confirm and send', exact: true }).click();
  const result = await (await submitted).json();
  expect(result.receipt?.state).toBe('comment-published');
  expect(result.intent?.action).toBe('comment');
  expect(result.receipt?.questionResolved).toBe(false);
  await expect(confirmation).toContainText('GitHub confirmed that the comment was published.');
  await expect(page.getByRole('button', { name: 'Confirm and send', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Refresh source', exact: true }).click();
  await expect(page.locator('#issue-comments')).toContainText(body);
  await info.attach('confirmed-source-comment', { body: Buffer.from(JSON.stringify({ commentId: result.receipt.commentId,
    source: result.receipt.source, actingUserId: result.actingUserId, questionResolved: false, sourceWritePerformed: true })), contentType: 'application/json' });
  await page.locator('#conversation-panel').screenshot({ path: info.outputPath('confirmed-comment.png') });
});
