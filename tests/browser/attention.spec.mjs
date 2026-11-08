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
  await expect(page.locator('#factory-results')).toContainText('Question: unverified · Responsible actor: unknown');
  await expect(page.locator('#factory-results')).toContainText('not the start of this wait');
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
  await expect(page.locator('#factory-results')).toContainText('2026-11-08T01:00:00.000Z');
  source.fail(403); await page.getByRole('button', { name: 'Refresh collection' }).click();
  await expect(page.locator('[data-attention-key]')).toHaveCount(0);
  source.fail(200); source.changeAccount(); await page.getByRole('button', { name: 'Refresh collection' }).click();
  await expect(page.locator('[data-attention-key]')).toHaveCount(0);
});
