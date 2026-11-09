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
  signedPage: async ({ owner }, use, info) => {
    const page = await owner.newPage();
    await use(page);
    if (info.status !== info.expectedStatus && page.url().startsWith(origin + '/workspace/')) {
      await page.screenshot({ path: info.outputPath('authenticated-failure.png') });
      await info.attach('authenticated-action-state', { body: Buffer.from(JSON.stringify(await page.evaluate(() => ({
        sourceStatus: document.querySelector('#issue-status')?.textContent,
        controlsStatus: document.querySelector('#controls-status')?.textContent,
        actionMessage: document.querySelector('.action-message')?.textContent,
      })))), contentType: 'application/json' });
    }
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
  await test.step('Open the issue and wait for current comment authority', async () => {
    await page.goto(issuePath, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: 'Review comment', exact: true })).toBeEnabled();
  });
  await test.step('Recover the existing journal before preparing another action', async () => {
    const recovered = page.waitForResponse(response => response.url().endsWith(controlsPath) && response.request().method() === 'POST'
      && response.request().postDataJSON()?.operation === 'receipt');
    await page.getByRole('button', { name: 'Recover previous action', exact: true }).click();
    const previous = await (await recovered).json();
    expect(previous.availability).toBe('available');
    if (previous.receipt?.state !== 'comment-published') expect(['claimed', 'uncertain']).not.toContain(previous.journalState);
  });
  const body = 'Lighthouse Control Center E2E: ordinary comment confirmation ' + new Date().toISOString() + '. This action requests no continuation.';
  const confirmation = page.getByRole('region', { name: 'Action confirmation', exact: true });
  await test.step('Prepare an ordinary comment without dispatching continuation', async () => {
    await page.getByLabel('Your comment or answer').fill(body);
    const prepared = page.waitForResponse(response => new URL(response.url()).pathname === controlsPath
      && response.request().method() === 'POST' && response.request().postDataJSON()?.operation === 'prepare', { timeout: 45000 });
    await page.getByRole('button', { name: 'Review comment', exact: true }).click();
    const preparation = await (await prepared).json();
    expect(preparation.availability, preparation.reason ?? 'Current preparation must be verified.').toBe('available');
    expect(preparation.journalState).toBe('prepared');
    expect(preparation.intent?.body).toBe(body);
    await expect(confirmation).toContainText('does not resume work');
    await expect(page.getByRole('button', { name: 'Confirm and send', exact: true })).toBeEnabled();
  });
  const result = await test.step('Send once and inspect the actual source receipt', async () => {
    const submitted = page.waitForResponse(response => response.url().endsWith(controlsPath) && response.request().method() === 'POST'
      && response.request().postDataJSON()?.operation === 'submit', { timeout: 45000 });
    await page.getByRole('button', { name: 'Confirm and send', exact: true }).click();
    return (await submitted).json();
  });
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

test('live ordinary comment recovery confirms the existing source result without resending', async ({ signedPage: page }, info) => {
  const expectedId = Number(process.env.LCC_E2E_RECOVER_COMMENT_ID);
  test.skip(!Number.isSafeInteger(expectedId) || expectedId < 1, 'Recovery needs the exact source comment ID of a previously submitted action.');
  let submissions = 0;
  page.on('request', request => {
    if (new URL(request.url()).pathname === controlsPath && request.method() === 'POST'
        && ['prepare', 'submit'].includes(request.postDataJSON()?.operation)) submissions++;
  });
  await page.goto(issuePath, { waitUntil: 'domcontentloaded' });
  const recover = page.getByRole('button', { name: 'Recover previous action', exact: true });
  await expect(recover).toBeEnabled();
  const response = page.waitForResponse(value => new URL(value.url()).pathname === controlsPath
    && value.request().method() === 'POST' && value.request().postDataJSON()?.operation === 'receipt', { timeout: 45000 });
  await recover.click();
  let result = await (await response).json();
  expect(result.availability).toBe('available');
  expect(result.intent?.action).toBe('comment');
  if (result.receipt?.state !== 'comment-published') {
    const reconciled = page.waitForResponse(value => new URL(value.url()).pathname === controlsPath
      && value.request().method() === 'POST' && value.request().postDataJSON()?.operation === 'reconcile', { timeout: 45000 });
    await page.getByRole('button', { name: 'Reconcile source result', exact: true }).click();
    result = await (await reconciled).json();
  }
  expect(result.receipt?.state).toBe('comment-published');
  expect(result.receipt?.commentId).toBe(expectedId);
  expect(result.receipt?.source).toBe('https://github.com/' + repository + '/issues/' + issue + '#issuecomment-' + expectedId);
  expect(result.receipt?.questionResolved).toBe(false);
  const confirmation = page.getByRole('region', { name: 'Action confirmation', exact: true });
  await expect(confirmation).toContainText('GitHub confirmed that the comment was published.');
  await expect(page.getByRole('button', { name: 'Confirm and send', exact: true })).toHaveCount(0);
  await expect(page.locator('#source-comment-' + expectedId)).toContainText(result.intent.body);
  expect(submissions).toBe(0);
  await info.attach('recovered-source-comment', { body: Buffer.from(JSON.stringify({ commentId: expectedId,
    source: result.receipt.source, actingUserId: result.actingUserId, questionResolved: false,
    sourceWritePerformed: false, prepareOrSubmitRequests: submissions })), contentType: 'application/json' });
  await confirmation.screenshot({ path: info.outputPath('recovered-comment.png') });
});
