import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const origin = `http://127.0.0.1:${process.env.SOFA_ISSUE_FIXTURE_PORT || '5171'}`;
const at = '2026-11-07T12:00:00Z';

async function fixture(page) {
  const state = { scope: 'runtime-71', sessionStatus: 0, hostStatus: 0, repositories: ['example/repository', 'example/other'],
    runnerStatus: {}, authority: {}, hold: {}, methods: [], name: 'Scoped runner', expiry: Date.now() + 600000 };
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url()); state.methods.push(route.request().method());
    if (url.pathname === '/api/session') return state.sessionStatus ? route.fulfill({ status: state.sessionStatus, body: 'Owner ended' })
      : route.fulfill({ json: { authenticated: true, idleDeadline: new Date(state.expiry).toISOString(), absoluteDeadline: new Date(Date.now() + 3600000).toISOString() } });
    if (url.pathname === '/api/runtime/host') return state.hostStatus ? route.fulfill({ status: state.hostStatus, json: { availability: 'unavailable' } }) : route.fulfill({ json: {
      availability: 'available', observedAt: at, registrationCount: 2, checkoutCount: 1, complete: true,
      observation: { configured: true, registrations: [
        { alias: 'host-A', availability: 'available', repository: 'example/repository', id: 22, name: 'Scoped runner', collectedAt: at, modifiedAt: at },
        { alias: 'host-B', availability: 'available', repository: 'example/other', id: 99, name: '<img src=x onerror=alert(1)>', collectedAt: at, modifiedAt: at }],
      adoptions: [{ repository: 'example/repository', availability: 'available', revision: 'b'.repeat(40), declaredCli: '0.12.55', lockedCli: '0.12.55',
        sdlcVersion: '0.21.6', workflowRef: 'a'.repeat(40), complete: true, collectedAt: at }] }
    } });
    if (url.pathname === '/api/connections/github') return route.fulfill({ json: { state: 'linked', dataScope: state.scope,
      repositories: state.repositories.map(repository => ({ repository, availability: state.authority[repository] ?? 'available', administrationRead: true })) } });
    const repository = url.pathname.replace('/api/runtime/', '');
    if (state.hold[repository]) await state.hold[repository];
    if (state.runnerStatus[repository]) return route.fulfill({ status: state.runnerStatus[repository], json: { availability: 'unavailable' } });
    return route.fulfill({ json: { repository, availability: 'available', observedAt: at, dataScope: state.scope,
      sourceTotal: repository === 'example/repository' ? 300 : 1, complete: repository !== 'example/repository', runners: [
        { id: 22, name: repository === 'example/repository' ? state.name : 'Different scoped runner', status: 'online', busy: null, os: 'linux', labels: [], labelsComplete: false }]
    } });
  });
  return state;
}

test('separate sources preserve scoped identities, committed versions, unknown facts and safe text', async ({ page }) => {
  const source = await fixture(page); let dialogs = 0; page.on('dialog', dialog => { dialogs++; dialog.dismiss(); });
  await page.goto(origin + '/runtime.html');
  await expect(page.locator('[data-repository="example/repository"]')).toContainText('Collected 1 / 300');
  await expect(page.locator('[data-registration="host-A"]')).toContainText('Repository and runner ID match');
  await expect(page.locator('[data-repository="example/other"]')).toContainText('Physical location unknown');
  await expect(page.locator('#runtime-adoptions')).toContainText('0.12.55');
  await expect(page.locator('#runtime-adoptions a')).toHaveAttribute('href', 'https://github.com/example/repository/tree/' + 'b'.repeat(40));
  await expect(page.locator('#host-registrations')).toContainText('<img src=x onerror=alert(1)>');
  await expect(page.locator('#host-registrations img')).toHaveCount(0);
  await expect(page.locator('[data-repository="example/repository"]')).toContainText('Unknown / incomplete');
  expect(dialogs).toBe(0); expect(source.methods.every(method => method === 'GET')).toBe(true);
  source.name = 'Renamed in GitHub'; await page.getByRole('button', { name: 'Refresh GitHub evidence' }).click();
  await expect(page.locator('[data-registration="host-A"]')).toContainText('Name conflict: GitHub reports Renamed in GitHub.');
});

test('known repository denial clears old runners immediately while another source is held', async ({ page }) => {
  const source = await fixture(page); await page.goto(origin + '/runtime.html');
  await expect(page.locator('[data-repository="example/repository"] h4')).toHaveText('Scoped runner');
  let release; source.hold['example/other'] = new Promise(resolve => { release = resolve; }); source.runnerStatus['example/repository'] = 403;
  await page.getByRole('button', { name: 'Refresh GitHub evidence' }).click();
  try {
    await expect(page.locator('[data-repository="example/repository"]')).toContainText('earlier inventory was removed');
    await expect(page.locator('[data-repository="example/repository"] h4')).toHaveCount(0);
    await expect(page.locator('[data-registration="host-A"]')).toContainText('Scoped runner');
    await expect(page.getByRole('button', { name: 'Refresh GitHub evidence' })).toBeDisabled();
  } finally { release(); }
});

test('account generation changes and catalog removal cannot retain prior source inventory', async ({ page }) => {
  const source = await fixture(page); await page.goto(origin + '/runtime.html');
  await expect(page.locator('[data-repository="example/repository"] h4')).toHaveText('Scoped runner');
  let release; source.hold['example/other'] = new Promise(resolve => { release = resolve; }); source.scope = 'runtime-72'; source.name = 'New account runner';
  await page.getByRole('button', { name: 'Refresh GitHub evidence' }).click();
  try {
    await expect(page.locator('[data-repository="example/repository"] h4')).toHaveText('New account runner');
    await expect(page.locator('[data-repository="example/other"] h4')).toHaveCount(0);
  } finally { release(); }
  await expect(page.getByRole('button', { name: 'Refresh GitHub evidence' })).toBeEnabled();
  source.hold['example/other'] = new Promise(resolve => { release = resolve; }); source.repositories = ['example/other'];
  await page.getByRole('button', { name: 'Refresh GitHub evidence' }).click();
  try { await expect(page.locator('[data-repository="example/repository"]')).toHaveCount(0); }
  finally { release(); }
});

test('transient host/source/authority failures preserve old collection time with a stale warning', async ({ page }) => {
  const source = await fixture(page); await page.goto(origin + '/runtime.html');
  await expect(page.locator('[data-repository="example/repository"] h4')).toHaveText('Scoped runner');
  source.hostStatus = 503;
  await page.getByRole('button', { name: 'Refresh host evidence' }).click();
  await expect(page.locator('[data-registration="host-A"]')).toContainText('Stale host observation');
  await expect(page.locator('[data-registration="host-A"]')).toContainText('2026-11-07T12:00:00.000Z');
  source.runnerStatus['example/repository'] = 429;
  await page.getByRole('button', { name: 'Refresh GitHub evidence' }).click();
  await expect(page.locator('[data-repository="example/repository"]')).toContainText('Runner read is busy. Retry explicitly.');
  await expect(page.locator('[data-repository="example/repository"]')).toContainText('2026-11-07T12:00:00.000Z');
  source.authority['example/repository'] = 'unavailable';
  await page.getByRole('button', { name: 'Refresh GitHub evidence' }).click();
  await expect(page.locator('[data-repository="example/repository"]')).toContainText('Stale GitHub evidence');
});

test('owner denial clears all sources and late GitHub results cannot repopulate them', async ({ page }) => {
  const source = await fixture(page); await page.goto(origin + '/runtime.html');
  await expect(page.locator('[data-registration="host-A"]')).toBeVisible();
  await expect(page.locator('[data-repository="example/other"] h4')).toBeVisible();
  let release; source.hold['example/other'] = new Promise(resolve => { release = resolve; });
  await page.getByRole('button', { name: 'Refresh GitHub evidence' }).click();
  source.sessionStatus = 401; await page.getByRole('button', { name: 'Refresh host evidence' }).click();
  try {
    await expect(page.locator('#host-registrations article')).toHaveCount(0);
    await expect(page.locator('#github-runners article')).toHaveCount(0);
    await expect(page.locator('#runtime-adoptions article')).toHaveCount(0);
  } finally { release(); }
  await expect(page.getByRole('button', { name: 'Refresh GitHub evidence' })).toBeEnabled();
  await expect(page.locator('#github-runners article')).toHaveCount(0);
});

test('admitted owner deadline clears displayed evidence without polling', async ({ page }) => {
  const source = await fixture(page); source.expiry = Date.now() + 2500;
  await page.goto(origin + '/runtime.html');
  await expect(page.locator('[data-registration="host-A"]')).toBeVisible();
  await expect(page.locator('#host-registrations article')).toHaveCount(0, { timeout: 6000 });
  await expect(page.locator('#github-runners article')).toHaveCount(0);
  await expect(page.locator('#runtime-status')).toContainText('Sign in');
});

test('independent source completion preserves keyboard focus on a retained source link', async ({ page }) => {
  const source = await fixture(page); let release;
  source.hold['example/other'] = new Promise(resolve => { release = resolve; });
  await page.goto(origin + '/runtime.html');
  const selected = page.locator('[data-repository="example/repository"]').getByRole('link', { name: 'Runner settings' });
  await expect(selected).toBeVisible(); await selected.focus();
  release();
  await expect(page.locator('[data-repository="example/other"] h4')).toBeVisible();
  await expect(selected).toBeFocused();
});

for (const theme of ['dark', 'light']) test(`runtime inventory is readable at390px with keyboard and ${theme} theme`, async ({ page }, info) => {
  await fixture(page); await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(origin + '/runtime.html'); await page.evaluate(value => { document.documentElement.dataset.lhTheme = value; }, theme);
  await expect(page.locator('[data-repository="example/other"] h4')).toBeVisible();
  await page.keyboard.press('Tab'); await expect(page.getByRole('link', { name: 'Skip to runtime inventory' })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
  await info.attach(`runtime-390-${theme}`, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
});
