import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');

test('the selected visual profile retains its package-owned guide and agent entrypoint', () => {
  const manifest = JSON.parse(read('lighthouse.json'));
  assert.ok(manifest.profiles.includes('visual-theme'));
  assert.equal(manifest.packages.ui.name, '@juangcarmona/lighthouse-ui');
  assert.equal(read('docs/design/DESIGN.md'), readFileSync(require.resolve('@juangcarmona/lighthouse-ui/DESIGN.md'), 'utf8'));
  assert.ok(read('AGENTS.md').includes('docs/design/control-center.md'));
});

test('workspace styles reference real Lighthouse semantic roles instead of silent fallback palettes', () => {
  const tokens = readFileSync(require.resolve('@juangcarmona/lighthouse-ui/tokens.css'), 'utf8');
  const defined = new Set([...tokens.matchAll(/(--lh-[a-z0-9-]+)\s*:/g)].map(match => match[1]));
  for (const file of readdirSync(new URL('src/web/public/', root)).filter(file => file.endsWith('.css'))) {
    for (const match of read('src/web/public/' + file).matchAll(/var\((--lh-[a-z0-9-]+)/g)) {
      assert.ok(defined.has(match[1]), `${file} references undefined Lighthouse token ${match[1]}`);
    }
  }
});
