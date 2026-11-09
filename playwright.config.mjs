import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
import { testPort } from './tests/browser/ports.mjs';
const browserPort = await testPort('SOFA_BROWSER_PORT');
const browserOrigin = `http://127.0.0.1:${browserPort}`;
let issuePort = await testPort('SOFA_ISSUE_FIXTURE_PORT');
if (issuePort === browserPort) throw Error('The issue fixture must use a distinct port.');
export default defineConfig({
  testDir: './tests/browser', outputDir: './test-results/browser', workers: 1, retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'test-reports/browser', open: 'never' }],
    ['./tests/product-behaviours/reporter.mjs', { kind: 'fixture' }]],
  use: { baseURL: browserOrigin, headless: true, launchOptions: { executablePath: existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined }, trace: 'retain-on-failure' },
  webServer: [{ command: 'node src/web/server.mjs', env: { SOFA_PORT: String(browserPort), SOFA_HOST: '127.0.0.1' }, url: browserOrigin, reuseExistingServer: false },
    { command: 'node tests/browser/issue-fixture-server.mjs', env: { SOFA_ISSUE_FIXTURE_PORT: String(issuePort) }, url: `http://127.0.0.1:${issuePort}/issue.html`, reuseExistingServer: false }],
});
