import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Reporter from './product-behaviours/reporter.mjs';

test('executed, failed and skipped cases retain different outcomes and all structured clauses', () => {
  const output = mkdtempSync(join(tmpdir(), 'lcc-product-evidence-'));
  try {
    const reporter = new Reporter({ kind: 'fixture', output });
    reporter.onBegin({}, { allTests: () => [] });
    for (const [index, status] of ['passed', 'failed', 'skipped'].entries()) {
      reporter.onTestEnd({ title: 'explicit source action ' + index, titlePath: () => ['fixture', String(index)] }, { status, duration: 10 });
    }
    reporter.onEnd({ status: 'failed' });
    const directory = join(output, readdirSync(output)[0]);
    const evidence = JSON.parse(readFileSync(join(directory, 'verification-evidence.json')));
    assert.deepEqual(evidence.results.map(result => result.outcome), ['passed', 'failed', 'inconclusive']);
    assert.ok(evidence.results.every(result => result.level === 'integration' && result.citations.length === 1));
    const structured = JSON.parse(readFileSync(join(directory, 'structured-behaviours.json')));
    assert.equal(structured.evidenceKind, 'fixture');
    assert.ok(structured.results.every(result => result.examples.length === 2));
    assert.ok(structured.results.flatMap(result => result.examples).every(example => example.given.length && example.when && example.then.length));
    assert.match(structured.productAcceptance, /Draft/);
  } finally { rmSync(output, { recursive: true, force: true }); }
});
test('a focused suite with no mapped behaviour does not publish an empty verification claim', () => {
  const output = mkdtempSync(join(tmpdir(), 'lcc-product-evidence-'));
  try {
    const reporter = new Reporter({ kind: 'fixture', output });
    reporter.onBegin({}, { allTests: () => [] });
    reporter.onTestEnd({ title: 'unrelated visual check', titlePath: () => ['unrelated'] }, { status: 'passed', duration: 10 });
    reporter.onEnd({ status: 'passed' });
    const directory = join(output, readdirSync(output)[0]);
    assert.equal(existsSync(join(directory, 'verification-evidence.json')), false);
    assert.equal(JSON.parse(readFileSync(join(directory, 'structured-behaviours.json'))).uncoveredExamples.length, 9);
  } finally { rmSync(output, { recursive: true, force: true }); }
});
