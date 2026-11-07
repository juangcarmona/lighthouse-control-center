import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve, relative, sep } from 'node:path';
import browser from '../playwright.config.mjs';

test('browser result cleanup cannot remove the independent provider evidence', () => {
  const cleanup = resolve(browser.outputDir ?? 'test-results');
  const identity = resolve('test-results/identity');
  const path = relative(cleanup, identity);
  assert.ok(path === '..' || path.startsWith('..' + sep), 'Playwright cleanup must own a disjoint directory.');
});
