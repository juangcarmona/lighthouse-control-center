import test from 'node:test';
import assert from 'node:assert/strict';
import { observeRepositories, parseGitHubResponse } from '../src/observation/github.mjs';
test('observation preserves source facts and never dispatches work', async () => {
  const paths = [];
  const result = await observeRepositories(['owner/repo'], async path => {
    paths.push(path);
    return path.includes('/actions/runs') ? { workflow_runs: [{ id: 4, status: 'completed', conclusion: 'success', head_sha: 'abc', html_url: 'run-url' }] } : [{ number: 18, labels: [{ name: 'ready' }], html_url: 'issue-url' }];
  });
  assert.equal(result[0].runs[0].sourceRevision, 'abc');
  assert.equal(result[0].attention[0].number, 18);
  assert.equal(paths.length, 2);
  assert(paths.every(path => path.startsWith('repos/owner/repo/')));
  assert.equal(result[0].availability, 'available');
});
test('unavailable evidence stays unknown and invalid repository input is rejected', async () => {
  const [result] = await observeRepositories(['owner/repo'], async () => { throw Error('denied'); });
  assert.equal(result.availability, 'unavailable'); assert.equal(result.runs, undefined);
  await assert.rejects(observeRepositories(['../repo']), /owner\/repository/);
});

test('raw source attempts remain exact through parsing, collection and snapshot serialization', async () => {
  const cases = [
    ['1', 1], ['2', 2], ['1.0', 1], ['2e0', 2], ['100e-2', 1], ['0.02e2', 2],
    ['9007199254740991', Number.MAX_SAFE_INTEGER], ['9007199254740992', null],
    ['1.00000000000000001', null], ['9007199254740990.9', null], ['1.5', null],
    ['0', null], ['-1', null], ['null', null], ['"2"', null], ['true', null],
    ['{}', null], ['[]', null], ['1e999999999999', null], ['1e-999999999999', null],
    ['0e999999999999', null], [undefined, null],
  ];
  for (const [raw, expected] of cases) {
    const source = `{"workflow_runs":[{"id":71,"status":"in_progress","head_sha":"abc","html_url":"run-url","updated_at":"source-time","event":"workflow_dispatch"${raw === undefined ? '' : `,"run_attempt":${raw}`}}]}`;
    const paths = [];
    const snapshot = await observeRepositories(['owner/repo'], async path => {
      paths.push(path);
      return parseGitHubResponse(path.includes('/actions/runs') ? source : '[]');
    });
    const run = JSON.parse(JSON.stringify(snapshot))[0].runs[0];
    assert.equal(run.runAttempt, expected, raw);
    assert.equal(run.event, 'workflow_dispatch');
    assert.equal(run.id, 71); assert.equal(run.sourceRevision, 'abc');
    assert.equal(run.url, 'run-url'); assert.equal(run.updatedAt, 'source-time');
    assert.deepEqual(paths, ['repos/owner/repo/actions/runs?per_page=20', 'repos/owner/repo/issues?state=open&per_page=100']);
  }
});

test('injected callers retain known attempts and bounded inert events without inferring absence', async () => {
  const events = [undefined, null, '', 2, {}, 'push', '<img src=x onerror=alert(1)>', 'x'.repeat(257)];
  const [repo] = await observeRepositories(['owner/repo'], async path => path.includes('/actions/runs')
    ? { workflow_runs: events.map((event, id) => ({ id, event, run_attempt: id === 0 ? 2 : undefined })) } : []);
  assert.deepEqual(repo.runs.map(run => run.event), [null, null, null, null, null, 'push', events[6], null]);
  assert.deepEqual(repo.runs.map(run => run.runAttempt), [2, null, null, null, null, null, null, null]);
});

test('review waits remain visible without claiming agent work or including PR records', async () => {
  const issues = [
    { number: 40, labels: [{ name: 'waiting-review' }, { name: 'bug' }] },
    { number: 41, labels: [{ name: 'waiting-review' }], pull_request: { url: 'pr-url' } },
    { number: 42, labels: [{ name: 'bug' }] },
    { number: 43, labels: [{ name: 'agent-working' }] },
    { number: 44, labels: [{ name: 'needs-info' }] },
  ];
  const [result] = await observeRepositories(['owner/repo'], async path => path.includes('/actions/runs') ? { workflow_runs: [] } : issues);
  assert.deepEqual(result.attention.map(issue => issue.number), [40, 43, 44]);
  assert.deepEqual(result.attention[0].labels, ['waiting-review', 'bug']);
});

test('source states and optional timing are additive and repository failures are independent', async () => {
  const states = ['in_progress', 'queued', 'pending', 'requested', 'waiting', 'completed'];
  const starts = ['2026-11-07T06:00:00Z', undefined, null, 'invalid', '2026-11-07T06:10:00Z', '2026-11-07T05:00:00Z'];
  const paths = [];
  const results = await observeRepositories(['owner/repo', 'owner/denied'], async path => {
    paths.push(path);
    if (path.includes('owner/denied')) throw Error('denied');
    return path.includes('/actions/runs') ? { workflow_runs: states.map((status, id) => ({ id, status, run_started_at: starts[id], updated_at: '2026-11-07T06:30:00Z', head_sha: `revision-${id}`, html_url: `https://github.com/owner/repo/actions/runs/${id}` })) } : [
      { number: 1, title: 'Both reasons', labels: [{ name: 'needs-info' }, { name: 'waiting-review' }, { name: 'ready' }], updated_at: 'invalid' },
      { number: 2, labels: [{ name: 'agent-working' }] },
      { number: 3, labels: [{ name: 'ready' }] },
    ];
  });
  assert.deepEqual(results[0].runs.map(run => run.status), states);
  assert.deepEqual(results[0].runs.map(run => run.startedAt), starts);
  assert(results[0].runs.every(run => run.updatedAt === '2026-11-07T06:30:00Z'));
  assert.deepEqual(results[0].attention.map(issue => issue.number), [1, 2, 3]);
  assert.deepEqual(results[0].attention[0].labels, ['needs-info', 'waiting-review', 'ready']);
  assert.equal(results[0].attention[0].updatedAt, 'invalid');
  assert.match(results[0].scope, /Latest 20.*first 100/);
  assert(Number.isFinite(Date.parse(results[0].observedAt)));
  assert.equal(results[1].availability, 'unavailable');
  assert.equal(results[1].runs, undefined);
  assert.equal(results[1].attention, undefined);
  assert.equal(paths.length, 4);
  assert(paths.every(path => /\?(per_page=20|state=open&per_page=100)$/.test(path)));
});
