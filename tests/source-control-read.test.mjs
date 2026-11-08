import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const helper = new URL('../src/workspace-tools/issue-control-read.mjs', import.meta.url).pathname;
const initial = { version: 1, operation: 'observe', repository: 'example/repository', number: 7 };
async function exercise(scenario, reply = request => request.kind === 'authority' ? { actorId: 11, repositoryId: 22, commentWrite: false, dispatchWrite: false }
  : request.kind === 'artifact' ? { source: 'bounded-json' }
    : request.path === 'user' ? { id: 11, type: 'User', login: 'owner' }
      : request.path.startsWith('actions/runs/') ? { total_count: 1, artifacts: [{ id: 9, name: 'lighthouse-input-7-1', expired: false, size_in_bytes: 100 }] }
        : { id: 22, full_name: 'example/repository' }, input = initial, publicSdk = null) {
  const root = await mkdtemp(join(tmpdir(), 'sofa-source-read-'));
  let child;
  try {
    const module = join(root, 'sdk.mjs');
    await writeFile(module, `export function createIssueControl(options) { return { async observe({number}) {
      const scenario=${JSON.stringify(scenario)};
      if(scenario==='optional') { const missing=await options.transport({scope:'repository',repository:options.repository,path:'contents/.lighthouse/issue-control.json',method:'GET',optional:true});return {availability:'available',missing}; }
      if(scenario==='write') { await options.transport({scope:'repository',repository:options.repository,path:'issues/7/comments',method:'POST',body:{body:'Do not send'}}); }
      if(scenario==='foreign') { await options.transport({scope:'repository',repository:'other/repository',path:'',method:'GET'}); }
      if(scenario==='ambient') { try { await fetch('https://example.invalid'); } catch {} return {availability:'available'}; }
      if(scenario==='bound') { for(let n=0;n<65;n++) { try { await options.transport({scope:'repository',repository:options.repository,path:'',method:'GET'}); } catch {} } return {availability:'available'}; }
      let actor;
      try { actor=await options.transport({scope:'account',path:'user',method:'GET'}); } catch { return {availability:'available'}; }
      const values=await Promise.all([options.transport({scope:'repository',repository:options.repository,path:'',method:'GET'}), options.transport({scope:'repository',repository:options.repository,path:'issues/'+number,method:'GET'})]);
      const authority=await options.readAuthority({actor,metadata:values[0]});
      const artifact=await options.readArtifact(path=>options.transport({scope:'repository',repository:options.repository,path,method:'GET'}),options.repository,'17','lighthouse-input-7-1','request.json');
      return {availability:'available',actor,authority,artifact,number};
    } }; }`);
    const preload = join(root, 'preload.mjs');
    await writeFile(preload, `import {registerHooks} from 'node:module'; registerHooks({resolve(specifier,context,next){
      if(specifier==='@juangcarmona/lighthouse-sdlc/issue-control') {
        ${scenario === 'missing' ? "throw Object.assign(Error('Not exported'),{code:'ERR_PACKAGE_PATH_NOT_EXPORTED'});" : `return {shortCircuit:true,url:${JSON.stringify(pathToFileURL(publicSdk ?? module).href)}};`}
      } return next(specifier,context);
    }});`);
    child = spawn(process.execPath, ['--import', preload, helper], { env: { PATH: process.env.PATH, NODE_NO_WARNINGS: '1' }, stdio: ['pipe', 'pipe', 'pipe'] });
    const requests = [], results = []; let pending = '', stderr = '';
    child.stdin.on('error', () => {});
    child.stderr.on('data', bytes => { stderr += bytes.toString(); });
    child.stdout.on('data', bytes => {
      pending += bytes.toString();
      let newline;
      while ((newline = pending.indexOf('\n')) >= 0) {
        const message = JSON.parse(pending.slice(0, newline)); pending = pending.slice(newline + 1);
        if (message.type === 'result') { results.push(message.result); child.stdin.end(); }
        else {
          requests.push(message);
          const value = reply(message), failed = value?.fixtureStatus !== undefined;
          child.stdin.write(JSON.stringify({ type: 'response', id: scenario === 'bad-id' ? message.id + 1 : message.id, ok: !failed, ...(failed ? { status: value.fixtureStatus } : { value }) }) + '\n');
        }
      }
    });
    child.stdin.write(typeof input === 'string' ? input : JSON.stringify(input) + '\n');
    const exit = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => { child.kill('SIGKILL'); reject(Error('Read helper did not exit')); }, 5000);
      child.once('error', error => { clearTimeout(timeout); reject(error); });
      child.once('exit', code => { clearTimeout(timeout); resolve(code); });
    });
    assert.equal(exit, 0); assert.equal(stderr, ''); assert.equal(results.length, 1);
    return { result: results[0], requests };
  } finally { if (child?.exitCode === null) child.kill('SIGKILL'); await rm(root, { recursive: true, force: true }); }
}

test('read helper serializes explicit SDK callbacks and delegates bounded artifact JSON to its host', async () => {
  const { result, requests } = await exercise('read');
  assert.equal(result.availability, 'available'); assert.equal(result.actor.id, 11);
  assert.deepEqual(result.artifact, { source: 'bounded-json' });
  assert.deepEqual(requests.map(row => row.id), [1, 2, 3, 4, 5, 6]);
  assert.equal(requests.at(-1).kind, 'artifact'); assert.equal(requests.at(-1).artifactId, 9);
  assert.ok(requests.every(row => !Object.hasOwn(row, 'token') && !Object.hasOwn(row, 'authorization')));
});
for (const scenario of ['write', 'foreign', 'ambient']) test('read helper blocks ' + scenario + ' effects before a host request', async () => {
  const { result, requests } = await exercise(scenario);
  assert.equal(result.availability, 'unavailable'); assert.equal(requests.length, 0);
});
test('a swallowed bad callback identity cannot become an available source observation', async () => {
  const { result, requests } = await exercise('bad-id');
  assert.equal(result.availability, 'unavailable'); assert.equal(requests.length, 1);
});
test('read callback work is bounded even when an SDK swallows the refusal', async () => {
  const { result, requests } = await exercise('bound');
  assert.equal(result.availability, 'unavailable'); assert.equal(requests.length, 64);
});
test('an unavailable public export stays unsupported without a legacy/internal SDK fallback', async () => {
  const { result, requests } = await exercise('missing');
  assert.equal(result.availability, 'unsupported'); assert.equal(requests.length, 0);
});
test('source observation accepts no extra initial credential or effect fields', async () => {
  const { result, requests } = await exercise('read', undefined, { ...initial, token: 'fixture-do-not-disclose' });
  assert.equal(result.availability, 'unavailable'); assert.equal(requests.length, 0);
  assert.ok(!JSON.stringify(result).includes('fixture-do-not-disclose'));
});

test('optional source 404 is absence while other HTTP failures stay unavailable', async () => {
  const missing = await exercise('optional', () => ({ fixtureStatus: 404 }));
  assert.deepEqual(missing.result, { availability: 'available', missing: null });
  const denied = await exercise('optional', () => ({ fixtureStatus: 403 }));
  assert.equal(denied.result.availability, 'unavailable');
});

test('the selected public SDK observes through host callbacks without requiring an installed source contract', async () => {
  // An isolated packed candidate may be exercised before publication; this never changes application dependencies.
  const selected = createRequire(process.env.SOFA_TEST_PUBLIC_SDK_ROOT
    ? join(process.env.SOFA_TEST_PUBLIC_SDK_ROOT, 'package.json') : new URL('../package.json', import.meta.url));
  let sdk;
  try { sdk = selected.resolve('@juangcarmona/lighthouse-sdlc/issue-control'); }
  catch (error) {
    assert.ok(['ERR_PACKAGE_PATH_NOT_EXPORTED', 'MODULE_NOT_FOUND'].includes(error.code));
    assert.equal((await exercise('missing')).result.availability, 'unsupported');
    return;
  }
  const owner = { id: 11, login: 'owner', type: 'User' };
  const { result, requests } = await exercise('public', request => {
    if (request.kind === 'authority') return { actorId: 11, repositoryId: 22, commentWrite: false, dispatchWrite: false };
    if (request.path === 'user') return owner;
    if (request.path === '') return { id: 22, full_name: initial.repository, owner, default_branch: 'main' };
    if (request.path === 'issues/7') return { id: 70, number: 7, title: 'Ordinary issue', body: 'Read only', state: 'open', labels: [], user: owner };
    if (request.path === 'commits/main') return { sha: 'a'.repeat(40) };
    if (request.path.startsWith('issues/7/comments?')) return [];
    if (request.path.startsWith('contents/.lighthouse/issue-control.json?')) return { fixtureStatus: 404 };
    throw Error('Unexpected public SDK callback: ' + request.path);
  }, initial, sdk);
  assert.equal(result.availability, 'available');
  assert.equal(result.question.availability, 'none');
  assert.equal(result.actions.refine.eligible, false);
  assert.equal(result.actions.refine.availability, 'unsupported');
  assert.equal(result.actor.id, 11); assert.equal(result.repository.id, 22);
  assert.ok(requests.some(request => request.kind === 'authority'));
});
