import test from 'node:test';
import assert from 'node:assert/strict';
import { practiceCatalog } from '@juangcarmona/lighthouse-sdlc/practice-catalog';
import { evaluatePractices } from '@juangcarmona/lighthouse-sdlc/practice-evaluator';
import { aggregatePracticeHistory } from '@juangcarmona/lighthouse-sdlc/practice-history';

const context = { repository: { id: 42, fullName: 'example/consumer' }, ref: 'refs/heads/main', commit: 'a'.repeat(40), scope: { id: 'node-tests', modules: ['application'] }, profile: 'web-application' };

test('installed practice reporting preserves missing evidence and common criteria without activating gates', async () => {
  assert.equal(practiceCatalog.practices.find(p => p.id === 'coverage').criteria.lines, 80);
  assert.equal(practiceCatalog.practices.find(p => p.id === 'coverage').criteria.branches, 70);
  assert.ok(!practiceCatalog.levels.L3.includes('mutation'));
  const report = await evaluatePractices({ context, now: '2026-11-16T12:00:00Z' });
  assert.equal(report.level, 'unverified');
  assert.ok(report.practices.every(p => p.state === 'missing'));
  const history = aggregatePracticeHistory({ assessments: [report, report], period: { start: '2026-11-16T00:00:00Z', end: '2026-11-17T00:00:00Z' } });
  assert.equal(history.currentCertification, false);
  assert.equal(history.groups[0].coverage.observedSamples, 1);
  assert.equal(history.groups[0].levelDistribution.L0, 0);
  assert.equal(history.groups[0].coverage.unknownSamplingCoverage, true);
});
