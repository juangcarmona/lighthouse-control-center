import { defineConfig } from '@playwright/test';

const origin = new URL(process.env.LCC_E2E_ORIGIN ?? '');
if (origin.protocol !== 'https:' || origin.username || origin.password || origin.search || origin.hash || origin.pathname !== '/')
  throw Error('LCC_E2E_ORIGIN must be an explicit HTTPS origin without credentials.');

export default defineConfig({
  testDir: './tests/e2e', outputDir: './test-results/e2e', workers: 1, retries: 0,
  timeout: 120000, expect: { timeout: 45000 },
  reporter: [['list'], ['html', { outputFolder: 'test-reports/e2e', open: 'never' }],
    ['./tests/product-behaviours/reporter.mjs', { kind: 'live', output: 'test-results/product-behaviours-live' }]],
  use: {
    baseURL: origin.origin, headless: true, ignoreHTTPSErrors: false,
    actionTimeout: 15000, navigationTimeout: 45000,
    trace: 'off', screenshot: 'off', video: 'off',
    launchOptions: process.env.LCC_E2E_BROWSER_HOME ? { env: { ...process.env, HOME: process.env.LCC_E2E_BROWSER_HOME } } : {},
  },
});
