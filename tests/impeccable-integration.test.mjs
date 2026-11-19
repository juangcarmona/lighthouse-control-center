import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, lstatSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const adapters = ['.agents/context/PRODUCT.md', '.agents/context/DESIGN.md'];
test('Impeccable adapters point to existing canonical sources without linking through managed files', () => {
  for (const file of adapters) {
    assert.equal(lstatSync(file).isSymbolicLink(), false, `${file} must not write through to a managed source`);
    const content = readFileSync(file, 'utf8');
    const links = [...content.matchAll(/\]\(([^)]+)\)/g)].map(match => match[1]);
    assert.ok(links.length > 0, `${file} must point to its sources`);
    for (const link of links) assert.ok(existsSync(resolve(dirname(file), link)), `${file}: missing ${link}`);
  }
  const product = readFileSync(adapters[0], 'utf8');
  const design = readFileSync(adapters[1], 'utf8');
  assert.match(product, /impeccable:product-schema 1/);
  assert.match(product, /docs\/product\/model\//);
  assert.match(design, /docs\/design\/DESIGN\.md/);
  assert.match(design, /docs\/design\/control-center\.md/);
});
