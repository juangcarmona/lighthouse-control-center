import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { createIssueControl } from '@juangcarmona/lighthouse-sdlc/issue-control';

const root = new URL('../', import.meta.url), revision = 'a'.repeat(40), repository = 'example/repository';
const owner = { id: 71, login: 'factory-owner', type: 'User' };
const blob = path => {
  const bytes = readFileSync(new URL(path, root));
  return { type: 'file', encoding: 'base64', size: bytes.length, content: bytes.toString('base64'),
    sha: createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex') };
};
function consumer(missing = false) {
  const requests = [];
  const sdk = createIssueControl({ repository, transport: async request => {
    requests.push(request); assert.equal(request.method, 'GET'); assert.equal(request.body, undefined);
    if (request.scope === 'account') { assert.equal(request.path, 'user'); return owner; }
    assert.equal(request.scope, 'repository'); assert.equal(request.repository, repository);
    const path = request.path;
    if (path === '') return { id: 22, full_name: repository, owner, default_branch: 'main' };
    if (path === 'issues/7') return { id: 70, number: 7, title: 'Controlled adopter input', body: 'Small reversible work', state: 'open', labels: [], user: owner };
    if (path === 'commits/main') return { sha: revision };
    if (path.startsWith('issues/7/comments?')) return [];
    if (path.startsWith('contents/')) {
      if (missing && path.includes('issue-control.json')) return null;
      const selected = path.split('?ref='); assert.equal(selected[1], revision);
      assert.ok(['contents/.lighthouse/issue-control.json', 'contents/.github/workflows/lighthouse-sdlc-router.yml'].includes(selected[0]));
      return blob(selected[0].slice('contents/'.length));
    }
    if (path === 'actions/variables/LIGHTHOUSE_AUTOMATION_ENABLED') return { name: 'LIGHTHOUSE_AUTOMATION_ENABLED', value: 'true' };
    if (path === 'actions/variables/LIGHTHOUSE_EPIC_ENABLED') return { name: 'LIGHTHOUSE_EPIC_ENABLED', value: 'false' };
    if (/^actions\/workflows\/lighthouse-sdlc-unattended.yml\/runs\?status=(queued|in_progress|waiting|requested|pending)&per_page=100$/.test(path)) return { total_count: 0, workflow_runs: [] };
    throw Error('Unexpected consumer callback: ' + path);
  }, readAuthority: async () => ({ actorId: 71, repositoryId: 22, commentWrite: true, dispatchWrite: true }),
  readArtifact: async () => { throw Error('No artifact is part of this controlled observation'); } });
  return { sdk, requests };
}

test('the released public SDK verifies the officially installed issue-control projection', async () => {
  const { sdk, requests } = consumer();
  const facts = await sdk.observe({ number: 7 });
  assert.equal(facts.availability, 'available'); assert.equal(facts.capability.availability, 'available');
  assert.equal(facts.actions.comment.eligible, true); assert.equal(facts.actions.refine.eligible, true);
  const prepared = await sdk.prepare({ number: 7, action: 'refine', id: randomUUID() });
  assert.equal(prepared.version, 1); assert.equal(prepared.intent.scope, 'stage-only');
  assert.equal(prepared.effect.path, 'actions/workflows/lighthouse-sdlc-router.yml/dispatches');
  assert.equal(prepared.effect.body.inputs.stage, 'refine'); assert.equal(prepared.effect.body.inputs.merge, undefined);
  assert.ok(requests.every(request => request.method === 'GET'));
});

test('the public consumer reports an absent installed contract without inventing an eligible action', async () => {
  const { sdk, requests } = consumer(true);
  const facts = await sdk.observe({ number: 7 });
  assert.equal(facts.availability, 'available'); assert.equal(facts.capability.availability, 'unsupported');
  assert.equal(facts.actions.comment.eligible, false); assert.equal(facts.actions.refine.eligible, false);
  assert.ok(requests.every(request => request.method === 'GET'));
});
