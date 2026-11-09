import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { loadBindings, validateBindings, validateCaseCoverage, bindingsFor, root } from './product-behaviours/bindings.mjs';

test('structured example bindings retain exact product sources and canonical requirement digests', () => {
  const ledger = loadBindings();
  assert.equal(ledger.bindings.length, 9);
  for (const requirement of new Map(ledger.bindings.map(binding => [binding.requirement.id, binding.requirement])).values()) {
    const inspected = JSON.parse(execFileSync(process.execPath, ['node_modules/@prodshape/cli/dist/bin.js', 'inspect', requirement.id, '--format', 'json'], { cwd: root, encoding: 'utf8' }));
    assert.equal(inspected.digest, requirement.digest);
  }
});
test('stale sources, duplicate identities and missing discovered cases are rejected', () => {
  const ledger = loadBindings();
  assert.throws(() => validateBindings(ledger, path => readFileSync(new URL('../' + path, import.meta.url), 'utf8') + '\n'), /Product source changed/);
  const duplicate = structuredClone(ledger); duplicate.bindings.push(duplicate.bindings[0]);
  assert.throws(() => validateBindings(duplicate), /duplicate/);
  assert.throws(() => validateCaseCoverage(ledger, ['unrelated test'], 'fixture'), /not discovered/);
  const titles = ledger.bindings.flatMap(binding => binding.cases.fixture.map(prefix => prefix + 'concrete case'));
  assert.doesNotThrow(() => validateCaseCoverage(ledger, titles, 'fixture'));
  assert.ok(bindingsFor(ledger, 'explicit source action 390: confirmation', 'fixture').some(binding => binding.id === 'SB-UNCERTAIN-ISSUE-COMMENT'));
  assert.deepEqual(bindingsFor(ledger, 'unrelated test', 'live'), []);
});
test('every declared fixture case is discoverable by the actual Playwright runner', () => {
  const listing = JSON.parse(execFileSync(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', '--list', '--reporter=json'], { cwd: root, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 }));
  const titles = [];
  const collect = suite => { for (const spec of suite.specs ?? []) titles.push(spec.title); for (const child of suite.suites ?? []) collect(child); };
  for (const suite of listing.suites) collect(suite);
  validateCaseCoverage(loadBindings(), titles, 'fixture');
});
