import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { generateKeyPairSync } from 'node:crypto';
import { admitUnattended, validateUnattendedPolicy, unattendedImplementationPolicy } from '../node_modules/@juangcarmona/lighthouse-sdlc/src/unattended.mjs';
import { validateImplementationPolicy, withinScope } from '../node_modules/@juangcarmona/lighthouse-sdlc/src/implementation.mjs';
import { verificationIntegrity } from '../node_modules/@juangcarmona/lighthouse-sdlc/src/verification-integrity.mjs';
import { resolveModelProfile } from '@juangcarmona/lighthouse-sdlc/model-profiles';
import { githubAppCiTrigger } from '../node_modules/@juangcarmona/lighthouse-sdlc/src/github-app-ci.mjs';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root));
const json = path => JSON.parse(read(path));
const policy = json('.lighthouse/unattended.json');
const implementation = json('.lighthouse/implement.json').defaults;

test('native FF delegates only the authorized operational slice and retains supervised defaults', () => {
  assert.equal(implementation.reviewRequired, true);
  assert.equal(policy.enabled, true);
  assert.equal(policy.merge, true);
  assert.throws(() => validateUnattendedPolicy({ ...policy, enabled: false }, 'ff'), /disabled/);
  const entries = json('.lighthouse/implement.json');
  assert.deepEqual(Object.keys(entries).sort(), ['99', 'defaults']);
  assert.equal(entries['99'].reviewRequired, false);
  assert.deepEqual(entries['99'].paths, policy.paths);
  assert.deepEqual(entries['99'].checks, implementation.checks);
  assert.deepEqual(entries['99'].verification.paths, [...implementation.verification.paths, 'tests/observation.test.mjs', 'tests/browser/observation.spec.mjs', 'tests/SoFa.Web.Tests/GitHubAuthorizationTests.cs']);
  assert.deepEqual(Object.keys(entries['99'].verification.corrections).sort(), ['tests/SoFa.Web.Tests/GitHubAuthorizationTests.cs', 'tests/browser/observation.spec.mjs', 'tests/observation.test.mjs']);
  validateImplementationPolicy(entries['99'], 99);
  const enabled = policy;
  validateUnattendedPolicy(enabled, 'ff');
  assert.throws(() => validateUnattendedPolicy(enabled, 'hotfix'));
  const eligibility = { risk: 'low', reversible: true, dependenciesResolved: true, scopeKnown: true,
    productChangeNeeded: false, humanDecisionRequired: false, reason: 'Small observer presentation correction.', points: 3 };
  assert.equal(admitUnattended(eligibility, enabled, 'ff'), true);
  for (const denied of [{ points: 5 }, { risk: 'high' }, { humanDecisionRequired: true }]) {
    assert.throws(() => admitUnattended({ ...eligibility, ...denied }, enabled, 'ff'));
  }
  const scoped = unattendedImplementationPolicy(implementation, enabled, 88, 'ff');
  assert.equal(withinScope('src/web/public/app.js', scoped), true);
  assert.equal(withinScope('src/SoFa.Modules.Workspace/Source/GitHubObservations.cs', scoped), true);
  for (const path of ['src/SoFa.Runtime/Program.cs', 'docs/product/model/README.md', '.github/workflows/verify.yml', '.lighthouse/unattended.json', 'src/web/public/account.js', 'src/SoFa.Modules.Workspace/Identity/OwnerSessions.cs', 'src/SoFa.Modules.Workspace/Source/GitHubTransport.cs']) {
    assert.equal(withinScope(path, scoped), false, path);
  }
});

test('verification integrity freezes Node, browser, .NET and CI inputs including newly added tests', () => {
  validateImplementationPolicy(implementation, 88);
  assert.deepEqual(implementation.verification.corrections, {});
  const paths = [...implementation.verification.paths.filter(path => !path.endsWith('/')),
    'scripts/verify-runtime.mjs', 'scripts/verify-container.mjs', 'tests/browser/observation.spec.mjs',
    'tests/SoFa.Runtime.Tests/packages.lock.json', 'src/tooling/security/check-secrets.mjs', '.github/workflows/verify.yml'];
  const before = new Map(paths.map(path => [path, { mode: '100644', content: read(path) }]));
  const baselineSpec = 'openspec/specs/accepted/spec.md';
  before.set(baselineSpec, { mode: '100644', content: Buffer.from('Accepted delivery specification\n') });
  paths.push(baselineSpec);
  assert.equal(verificationIntegrity(before, before, implementation, 88).status, 'passed');
  for (const path of paths) {
    const changed = new Map(before).set(path, { mode: '100644', content: Buffer.from('changed verification input') });
    assert.throws(() => verificationIntegrity(before, changed, implementation, 88), /Verification inputs changed/, path);
  }
  const added = new Map(before).set('tests/new.test.mjs', { mode: '100644', content: Buffer.from('new assertion') });
  assert.throws(() => verificationIntegrity(before, added, implementation, 88), /Verification inputs changed/);
});


test('the exact operational test corrections remain required and cannot open other verification inputs', () => {
  const granted = json('.lighthouse/implement.json')['99'];
  const exact = ['tests/observation.test.mjs', 'tests/browser/observation.spec.mjs', 'tests/SoFa.Web.Tests/GitHubAuthorizationTests.cs'];
  const files = [...granted.verification.paths.filter(path => !path.endsWith('/')), 'tests/web.test.mjs', 'tests/SoFa.Web.Tests/GitHubAuthorizationTests.cs'];
  const before = new Map(files.map(path => [path, { mode: '100644', content: read(path) }]));
  for (const path of exact) {
    const extended = new Map(before).set(path, { mode: '100644', content: Buffer.concat([read(path), Buffer.from('\n// new behavior coverage\n')]) });
    assert.equal(verificationIntegrity(before, extended, granted, 99).corrections[0].path, path);
    const removed = new Map(before); removed.delete(path);
    assert.throws(() => verificationIntegrity(before, removed, granted, 99), /Required verification input is absent/);
  }
  for (const path of ['tests/web.test.mjs', 'package.json', '.lighthouse/unattended.json']) {
    const changed = new Map(before).set(path, { mode: '100644', content: Buffer.from('changed') });
    assert.throws(() => verificationIntegrity(before, changed, granted, 99), /Verification inputs changed/);
  }
});

test('project profiles resolve distinct models and unavailable review capabilities cannot fall back', () => {
  const project = json('.lighthouse/models.json');
  const operator = { modelProfiles: { schemaVersion: 1, enabled: true }, modelCapabilities: {
    'openai/gpt-6.1-sol': { available: true, tools: true, reasoningEfforts: ['medium'] },
    'openai/gpt-6-luna': { available: true, tools: true, reasoningEfforts: ['high'] },
  } };
  const producer = resolveModelProfile({ project, operator, worker: 'implement' });
  const reviewer = resolveModelProfile({ project, operator, worker: 'independent-review', profile: policy.reviewerProfile });
  assert.notEqual(producer.model, reviewer.model);
  delete operator.modelCapabilities[reviewer.model];
  assert.throws(() => resolveModelProfile({ project, operator, worker: 'independent-review', profile: policy.reviewerProfile }), /unavailable/);
});

test('App preflight mints only a repository-scoped token, revokes it and creates no ref', async () => {
  const privateKey = generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey.export({ type: 'pkcs8', format: 'pem' });
  const env = { GITHUB_REPOSITORY: 'juangcarmona/sofa', LIGHTHOUSE_CI_APP_CLIENT_ID: 'test-client', LIGHTHOUSE_CI_APP_PRIVATE_KEY: privateKey };
  const now = Date.now();
  for (const excessiveScope of [false, true]) {
    const calls = [];
    const trigger = githubAppCiTrigger(env, { now: () => now, fetchImpl: async (url, options) => {
      calls.push({ url, method: options.method, body: options.body && JSON.parse(options.body) });
      if (url.endsWith('/installation')) return Response.json({ id: 1 });
      if (url.endsWith('/access_tokens')) return Response.json({ token: 'synthetic-token', expires_at: new Date(now + 3600000).toISOString(),
        permissions: { contents: 'write', ...(excessiveScope ? { issues: 'write' } : {}) }, repositories: [{ full_name: env.GITHUB_REPOSITORY }] });
      if (url.endsWith('/installation/token')) return new Response(null, { status: 204 });
      throw Error('Unexpected App effect');
    } });
    if (excessiveScope) await assert.rejects(trigger({ probe: true }), /authorization failed/);
    else {
      const receipt = await trigger({ probe: true });
      assert.equal(receipt.tokenRevoked, true);
      assert.equal(receipt.ref, undefined);
      assert.equal(JSON.stringify(receipt).includes('synthetic-token'), false);
    }
    assert.deepEqual(calls[1].body, { repositories: ['sofa'], permissions: { contents: 'write' } });
    assert.equal(calls.at(-1).method, 'DELETE');
    assert.equal(calls.some(call => call.url.endsWith('/git/refs')), false);
  }
  assert.equal(githubAppCiTrigger({}), null);
  assert.throws(() => githubAppCiTrigger({ ...env, LIGHTHOUSE_CI_APP_PRIVATE_KEY: '' }), /Configure/);
});

test('credential preflight is owner-triggered on the default branch and uses only pinned trusted code', () => {
  const workflow = read('.github/workflows/lighthouse-ci-app-preflight.yml').toString();
  assert.match(workflow, /on:\n  workflow_dispatch:\n/);
  assert.doesNotMatch(workflow, /pull_request:|push:|schedule:|secrets: inherit|persist-credentials: true/);
  assert.match(workflow, /github\.actor == github\.repository_owner/);
  assert.match(workflow, /github\.triggering_actor == github\.repository_owner/);
  assert.match(workflow, /github\.event\.repository\.default_branch/);
  assert.match(workflow, /repository: juangcarmona\/lighthouse\n          ref: 59ded863109b045e399931dbad61e6cfdb698107/);
  assert.match(workflow, /assert\.equal\(receipt\.tokenRevoked, true/);
  const verify = read('.github/workflows/verify.yml').toString();
  assert.match(verify, /branches: \[main, 'lighthouse\/verification-\*'\]/);
  assert.match(verify, /jobs:\n  verify:/);
  assert.match(verify, /run: npm run verify/);
});
