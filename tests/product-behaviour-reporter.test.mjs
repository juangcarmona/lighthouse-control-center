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

test('source receipts retain attributable outcomes without copying arbitrary attachments or credentials', () => {
  const output = mkdtempSync(join(tmpdir(), 'lcc-product-evidence-'));
  try {
    const reporter = new Reporter({ kind: 'live', output });
    reporter.onBegin({}, { allTests: () => [] });
    reporter.onTestEnd({ title: 'live ordinary comment recovery', titlePath: () => ['recovery'] }, {
      status: 'passed', duration: 10, attachments: [
        { name: 'recovered-source-comment', contentType: 'application/json', body: Buffer.from(JSON.stringify({
          commentId: 123, actingUserId: 456, sourceWritePerformed: false, prepareOrSubmitRequests: 0, token: 'must-not-copy',
        })) },
        { name: 'uncertain-comment-recovery', contentType: 'application/json', body: Buffer.from(JSON.stringify({
          actionId: 'abc', journalState: 'uncertain', receiptState: 'unknown', sourceWritePerformed: false,
          prepareRequests: 0, submitRequests: 0, receiptRequests: 1, reconcileRequests: 1, body: 'must-not-copy', token: 'must-not-copy',
        })) },
        { name: 'unreviewed-debug', contentType: 'application/json', body: Buffer.from('{"secret":"must-not-copy"}') },
      ],
    });
    reporter.onEnd({ status: 'passed' });
    const raw = readFileSync(join(output, readdirSync(output)[0], 'structured-behaviours.json'), 'utf8');
    const evidence = JSON.parse(raw).results[0].sourceEvidence;
    assert.deepEqual(evidence, [
      { name: 'recovered-source-comment', commentId: 123, actingUserId: 456, sourceWritePerformed: false, prepareOrSubmitRequests: 0 },
      { name: 'uncertain-comment-recovery', sourceWritePerformed: false, actionId: 'abc', journalState: 'uncertain', receiptState: 'unknown',
        prepareRequests: 0, submitRequests: 0, receiptRequests: 1, reconcileRequests: 1 },
    ]);
    assert.equal(raw.includes('must-not-copy'), false);
  } finally { rmSync(output, { recursive: true, force: true }); }
});
