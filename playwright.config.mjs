import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
import { testPort } from './tests/browser/ports.mjs';
const browserPort = await testPort('SOFA_BROWSER_PORT');
const browserOrigin = `http://127.0.0.1:${browserPort}`;
export default defineConfig({
  testDir: './tests/browser', outputDir: './test-results/browser', workers: 1, retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'test-reports/browser', open: 'never' }]],
  use: { baseURL: browserOrigin, headless: true, launchOptions: { executablePath: existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined }, trace: 'retain-on-failure' },
  webServer: { command: 'node src/web/server.mjs', env: { SOFA_PORT: String(browserPort), SOFA_HOST: '127.0.0.1' }, url: browserOrigin, reuseExistingServer: false },
});
