import test from 'node:test';
import assert from 'node:assert/strict';
import { observeRepositories, parseGitHubResponse } from '../src/observation/github.mjs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
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

const attemptCases = [
  ['1', 1], ['2', 2], ['1.0', 1], ['1e0', 1], ['20e-1', 2], ['0.02e2', 2],
  ['1.00000000000000000', 1], ['9007199254740991', 9007199254740991],
  ['90071992547409910e-1', 9007199254740991], ['1e+0000000000000000000000000000000', 1],
  [undefined, null], ['null', null], ['"2"', null], ['true', null], ['{}', null], ['[]', null],
  ['0', null], ['-0', null], ['-1', null], ['1.5', null], ['1.00000000000000001', null],
  ['9007199254740991.00000000000000001', null], ['9007199254740992', null],
  ['1e999999999999999999999999999', null], ['1e-999999999999999999999999999', null],
  ['1e309', null], ['1e-309', null], ['100e-3', null],
];
const sourceRows = attemptCases.map(([token], id) => `{"id":${id + 1}${token === undefined ? '' : `,"run_attempt":${token}`},"event":"workflow_dispatch"}`);

test('raw source attempts remain exact through production parsing and serialized collection', async () => {
  const json = `{"workflow_runs":[${sourceRows.join(',')}]}`;
  const [repo] = await observeRepositories(['owner/repo'], async path => parseGitHubResponse(path.includes('/actions/runs') ? json : '[]'));
  const serialized = JSON.parse(JSON.stringify(repo));
  assert.deepEqual(serialized.runs.map(run => run.runAttempt), attemptCases.map(([, expected]) => expected));
  assert(serialized.runs.every(run => run.event === 'workflow_dispatch'));
  assert.deepEqual(serialized.runs.map(run => run.id), attemptCases.map((_, i) => i + 1));
  assert.throws(() => parseGitHubResponse('{'), SyntaxError);
});

test('default CLI stdout parsing preserves fractional evidence without a real GitHub credential', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'sofa-attempt-'));
  try {
    const json = `{"workflow_runs":[${sourceRows.join(',')}]}`;
    await writeFile(join(directory, 'gh'), `#!${process.execPath}\nconst path = process.argv[3];\nif (process.argv[2] !== 'api' || !/^repos\\/owner\\/repo\\/(actions\\/runs\\?per_page=20|issues\\?state=open&per_page=100)$/.test(path)) process.exit(1);\nconsole.log(path.includes('/actions/runs') ? ${JSON.stringify(json)} : '[]');\n`, { mode: 0o700 });
    const { stdout } = await promisify(execFile)(process.execPath, [fileURLToPath(new URL('../src/observation/github.mjs', import.meta.url)), 'owner/repo'], { env: { ...process.env, PATH: directory } });
    const [repo] = JSON.parse(stdout);
    assert.equal(repo.availability, 'available');
    assert.deepEqual(repo.runs.map(run => run.runAttempt), attemptCases.map(([, expected]) => expected));
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('injected objects require safe attempts and source event strings without coercion', async () => {
  const attempts = [1, 2, undefined, null, '2', true, 0, -1, 1.5, 9007199254740992];
  const events = ['push', ' workflow_dispatch ', undefined, null, '', ' \t\n', false, 2, {}, '<img src=x onerror=alert(1)>'];
  const [repo] = await observeRepositories(['owner/repo'], async path => path.includes('/actions/runs')
    ? { workflow_runs: attempts.map((run_attempt, id) => ({ id, run_attempt, event: events[id] })) } : []);
  const runs = JSON.parse(JSON.stringify(repo)).runs;
  assert.deepEqual(runs.map(run => run.runAttempt), [1, 2, ...Array(8).fill(null)]);
  assert.deepEqual(runs.map(run => run.event), ['push', ' workflow_dispatch ', ...Array(7).fill(null), events[9]]);
});
