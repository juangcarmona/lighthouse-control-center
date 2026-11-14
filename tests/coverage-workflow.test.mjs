import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';

test('coverage collection is bounded, optional and cannot replace the required verification job', async () => {
  const workflow = parse(await readFile(new URL('../.github/workflows/verify.yml', import.meta.url), 'utf8'));
  const verify = workflow.jobs.verify;
  const coverage = workflow.jobs.coverage;
  assert.equal(verify['timeout-minutes'], 30);
  assert.equal(coverage.needs, 'verify');
  assert.equal(coverage.if, "needs.verify.result == 'success'");
  assert.equal(coverage['continue-on-error'], true);
  assert.equal(coverage['timeout-minutes'], 10);
  assert.equal(coverage.steps.find(step => step.name === 'Produce optional exact-attempt coverage evidence')['continue-on-error'], true);
  assert.equal(coverage.steps.find(step => step.name === 'Retain exact-attempt coverage evidence')['continue-on-error'], true);
  assert.equal(coverage.steps.find(step => step.uses?.startsWith('actions/upload-artifact@'))?.with?.name,
    'lighthouse-coverage-${{ github.run_id }}-${{ github.run_attempt }}');
});
