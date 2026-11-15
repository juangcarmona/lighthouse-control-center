import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { adoptionFacts, evidenceLink, issueHistory } from '../src/web/public/evidence-projections.js';

const scope = { repository: 'example/repository', number: 7, repositoryId: 10, issueId: 70, observedAt: '2026-11-14T10:00:00Z' };
const report = { commentId: 1, sourceUrl: 'https://github.com/example/repository/issues/7#issuecomment-1', availability: 'available',
  stage: 'implement', result: 'blocked', runId: 500, attempt: 1, executionStatus: 'completed', executionConclusion: 'success',
  reportCreatedAt: '2026-11-13T10:00:00Z', runStartedAt: '2026-11-13T09:00:00Z' };
test('exact repeats collapse, retries and changed results remain distinct', () => {
  const first = issueHistory({ ...scope, reports: [report, report] });
  assert.equal(first.events.length, 2);
  const retry = issueHistory({ ...scope, reports: [{ ...report, attempt: 2, result: 'passed' }] }, first.events);
  assert.equal(retry.events.length, 4);
  const changed = issueHistory({ ...scope, reports: [{ ...report, result: 'failed' }] }, first.events);
  assert.equal(changed.events.length, 3);
  assert.match(changed.events.find(row => row.kind === 'workflow execution').detail, /accepted delivery unknown/);
});
test('invalid time stays undated, observation time never dates evidence, inclusive window filters only dated rows', () => {
  const result = issueHistory({ ...scope, reports: [report, { ...report, commentId: 2, reportCreatedAt: 'invalid', runStartedAt: null }] }, [],
    { start: '2026-11-13T10:00:00Z', end: '2026-11-13T10:00:00Z' });
  assert.equal(result.dated.length, 1);
  assert.equal(result.undated.length, 2);
  assert.match(result.gaps, /denominator and autonomy rates unavailable/);
});
test('missing identity cannot authorize a rename or conflicting issue join', () => {
  const original = issueHistory({ ...scope, reports: [report] });
  assert.equal(issueHistory({ ...scope, repository: 'example/renamed' }, original.events).events.length, 0);
  assert.equal(issueHistory({ ...scope, issueId: 71 }, original.events).events.length, 0);
});
test('skipped execution, blocked result, human review and missing histories do not establish approval', () => {
  const result = issueHistory({ ...scope, reports: [{ ...report, executionConclusion: 'skipped' }], pullRequests: [{ number: 3,
    reviews: [{ id: 88, actor: 'maintainer', actorType: 'User', state: 'APPROVED' }] }] });
  assert.match(result.events.find(row => row.kind === 'workflow execution').detail, /skipped/);
  assert.match(result.events.find(row => row.kind === 'stage report').detail, /blocked/);
  assert.match(result.events.find(row => row.kind === 'PR review').detail, /Protected human approval unknown/);
  assert.equal(result.undated.length, 2);
});
test('safe links remain repository-bound and unsafe content stays data', () => {
  for (const url of ['javascript:alert(1)', 'https://github.com.evil/example/repository/7', 'https://user@github.com/example/repository/7', 'https://github.com/other/repository/7']) assert.equal(evidenceLink(url, scope.repository), null);
  const result = issueHistory({ ...scope, reports: [{ ...report, question: '<script>unsafe()</script>' }] });
  assert.match(result.events.find(row => row.kind === 'source question').detail, /<script>/);
});
test('history stays within row and byte limits with visible omissions', () => {
  const previous = Array.from({ length: 1005 }, (_, index) => ({ ...scope, identity: index, kind: 'test', time: null, detail: 'x' }));
  const result = issueHistory(scope, previous);
  assert.equal(result.events.length, 1000); assert.equal(result.omitted, 5);
  assert.equal(issueHistory(scope, [{ ...scope, identity: 1, detail: 'x'.repeat(1024 * 1024) }]).omitted, 1);
});
test('retained real #99 source associations remain undated, without native parser bypass', () => {
  const path = 'docs/delivery/evidence/issue-88/native-qualification/qualification.json';
  const source = JSON.parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
  const repository = source.native.binding.repository;
  const replay = issueHistory({ repository, number: 99, observedAt: source.observedAt,
    reports: [{ commentId: null, runId: source.native.run, attempt: source.native.attempt, executionStatus: 'retained-source demonstration',
      executionConclusion: source.native.status, availability: 'unavailable', reason: 'Retained native summary, not a production receipt', sourceRevision: source.native.binding.sourceRevision }],
    pullRequests: [{ number: source.native.publication.pr, headRevision: source.native.publication.head, sourceUrl: `https://github.com/${repository}/pull/113` }] });
  assert.equal(replay.dated.length, 0); assert.equal(replay.undated.length, 3);
  assert.equal(replay.events[0].identity, 42452259718); assert.equal(replay.events[0].attempt, 1);
  assert.equal(replay.events[2].revision, '6b5b4219d20df81e73c9656b1e139cc3c8ba062a');
  assert.equal(source.nativeMerge.sha, 'a9e06e0376f28dd5a3075cfd26c81fcb98130db0');
  assert.equal(source.eligibleCi.run, 42455503204); assert.equal(source.postMergeReview.worker, 42459934534);
  assert.equal(source.nativeMerge.result.postMerge[0].state, 'missing');
});
test('committed declaration and lock resolution never become installed or current policy', () => {
  const facts = adoptionFacts({ declaredCli: '0.12.65', lockedCli: '0.12.65', sdlcVersion: '0.22.4', revision: 'a'.repeat(40) });
  assert.ok(facts.facts.every(row => row.category === 'declared'));
  assert.match(facts.installed, /unknown/); assert.match(facts.policy, /unknown/); assert.match(facts.baseline, /No compatible baseline/);
});
