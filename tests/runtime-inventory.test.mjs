import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, rename, symlink, chmod } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { observeRuntime, validateRuntimeInput } from '../src/workspace-tools/runtime-inventory.mjs';

const config = scratch => ({ scratch, registrations: [], checkouts: [], trustedGroupIds: [process.getgid()] });
async function fixture(run) {
  const root = await mkdtemp(join(tmpdir(), 'sofa-runtime-inventory-'));
  try { await run(root); } finally { await rm(root, { recursive: true, force: true }); }
}
const git = (root, ...args) => execFileSync('git', ['-c', 'user.name=Runtime fixture', '-c', 'user.email=fixture@example.invalid', '-c', 'core.hooksPath=/dev/null', ...args], {
  cwd: root, encoding: 'utf8', env: { PATH: process.env.PATH, HOME: root, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null' }, stdio: ['ignore', 'pipe', 'pipe'],
}).trim();
async function checkout(root) {
  const source = join(root, 'source'); await mkdir(source);
  git(source, 'init', '--initial-branch=main');
  git(source, 'remote', 'add', 'origin', 'git@github.com:example/repository.git');
  await mkdir(join(source, '.lighthouse'));
  await mkdir(join(source, '.github/workflows'), { recursive: true });
  await writeFile(join(source, 'package.json'), JSON.stringify({ devDependencies: { '@juangcarmona/lighthouse': '0.12.55' } }));
  await writeFile(join(source, 'package-lock.json'), JSON.stringify({ packages: { 'node_modules/@juangcarmona/lighthouse': { version: '0.12.55' } } }));
  await writeFile(join(source, '.lighthouse/sdlc.json'), JSON.stringify({ package: { name: '@juangcarmona/lighthouse-sdlc', version: '0.21.6' } }));
  await writeFile(join(source, '.github/workflows/lighthouse-sdlc-unattended.yml'), 'with:\n  repository: juangcarmona/lighthouse\n  ref: ' + 'a'.repeat(40) + '\n');
  git(source, 'add', '.'); git(source, 'commit', '-m', 'Fixture');
  return source;
}

test('registration BOM is accepted, secrets and paths are absent, missing source is not an empty host', async () => fixture(async root => {
  const runner = join(root, 'runner'); await mkdir(runner);
  await writeFile(join(runner, '.runner'), '\uFEFF' + JSON.stringify({ agentId: 22, agentName: 'example-runner', gitHubUrl: 'https://github.com/example/repository', workFolder: 'private-secret' }));
  await writeFile(join(runner, '.credentials'), 'never-read-secret');
  const input = { ...config(root), registrations: [{ alias: 'registered', directory: runner }, { alias: 'missing', directory: join(root, 'absent') }] };
  const result = await observeRuntime(input);
  assert.equal(result.registrationCount, 2); assert.equal(result.complete, false);
  assert.deepEqual(result.registrations.map(r => r.availability), ['available', 'unavailable']);
  assert.equal(result.registrations[0].repository, 'example/repository');
  assert.equal(result.registrations[0].id, 22);
  assert.ok(result.registrations[0].modifiedAt);
  assert.doesNotMatch(JSON.stringify(result), /private-secret|never-read-secret|serverUrl|directory|\/tmp\//);
  assert.equal((await observeRuntime(config(root))).configured, false);
}));

test('fixed-file size/type, unsafe scope and untrusted writers are unavailable', async () => fixture(async root => {
  const runner = join(root, 'runner'); await mkdir(runner);
  const input = { ...config(root), registrations: [{ alias: 'runner', directory: runner }] };
  for (const row of [
    { agentId: 1, agentName: 'org', gitHubUrl: 'https://github.com/example' },
    { agentId: Number.MAX_SAFE_INTEGER + 1, agentName: 'bad', gitHubUrl: 'https://github.com/example/repository' },
    { agentId: 1, agentName: 'x'.repeat(32769), gitHubUrl: 'https://github.com/example/repository' },
  ]) {
    await writeFile(join(runner, '.runner'), JSON.stringify(row));
    assert.equal((await observeRuntime(input)).registrations[0].availability, 'unavailable');
  }
  await rm(join(runner, '.runner'));
  execFileSync('mkfifo', [join(runner, '.runner')]);
  assert.equal((await observeRuntime(input)).registrations[0].availability, 'unavailable');
  await rm(join(runner, '.runner'));
  await writeFile(join(root, 'outside'), JSON.stringify({ agentId: 9, agentName: 'outside', gitHubUrl: 'https://github.com/example/repository' }));
  await symlink(join(root, 'outside'), join(runner, '.runner'));
  assert.equal((await observeRuntime(input)).registrations[0].availability, 'unavailable');
  await chmod(runner, 0o777);
  assert.equal((await observeRuntime(input)).registrations[0].availability, 'unavailable');
}));

test('pinned file and parent replacement never redirect registration reads', async () => fixture(async root => {
  const runner = join(root, 'runner'), outside = join(root, 'outside'); await mkdir(runner); await mkdir(outside);
  const row = name => JSON.stringify({ agentId: 1, agentName: name, gitHubUrl: 'https://github.com/example/repository' });
  await writeFile(join(runner, '.runner'), row('original')); await writeFile(join(outside, '.runner'), row('outside'));
  let changed = false;
  const result = await observeRuntime({ ...config(root), registrations: [{ alias: 'runner', directory: runner }] }, { opened: async path => {
    if (!changed && path.endsWith('/runner')) { changed = true; await rename(runner, join(root, 'old')); await symlink(outside, runner); }
    if (path.endsWith('/.runner')) { await rename(join(root, 'old/.runner'), join(root, 'old/previous')); await symlink(join(outside, '.runner'), join(root, 'old/.runner')); }
  } });
  assert.equal(result.registrations[0].name, 'original');
}));

test('committed adoption works for loose and packed storage, ignores dirty files and does not execute source configuration', async () => fixture(async root => {
  const source = await checkout(root); const head = git(source, 'rev-parse', 'HEAD');
  const initialHead = await readFile(join(source, '.git/HEAD'), 'utf8');
  await writeFile(join(source, 'package.json'), '{"devDependencies":{"@juangcarmona/lighthouse":"dirty"}}');
  const input = { ...config(root), checkouts: [{ repository: 'example/repository', directory: source }] };
  const first = await observeRuntime(input);
  assert.equal(first.adoptions[0].availability, 'available'); assert.equal(first.adoptions[0].revision, head);
  assert.equal(first.adoptions[0].declaredCli, '0.12.55'); assert.equal(first.adoptions[0].workflowRef, 'a'.repeat(40));
  assert.equal(first.complete, true);
  git(source, 'gc', '--prune=now'); git(source, 'pack-refs', '--all');
  const sentinel = join(root, 'executed');
  await writeFile(join(root, 'evil'), '#!/bin/sh\ntouch ' + sentinel + '\n', { mode: 0o755 });
  await writeFile(join(source, '.git/config'), '[remote "origin"]\n url = git@github.com:example/repository.git\n[core]\n fsmonitor = ' + join(root, 'evil')
    + '\n[credential]\n helper = !' + join(root, 'evil') + '\n[include]\n path = ' + join(root, 'evil') + '\n[url "ssh://evil/"]\n insteadOf = git@github.com:\n');
  const sourceConfig = await readFile(join(source, '.git/config'), 'utf8');
  await mkdir(join(root, 'scratch2'), { mode: 0o700 });
  const second = await observeRuntime({ ...input, scratch: join(root, 'scratch2') });
  assert.equal(second.adoptions[0].availability, 'available'); assert.equal(second.adoptions[0].lockedCli, '0.12.55');
  assert.equal(await readFile(join(source, '.git/HEAD'), 'utf8'), initialHead);
  assert.equal(await readFile(join(source, '.git/config'), 'utf8'), sourceConfig);
  await assert.rejects(readFile(sentinel), { code: 'ENOENT' });
}));

test('worktree and detached HEAD resolve exact objects without loading checkout configuration', async () => fixture(async root => {
  const source = await checkout(root); const head = git(source, 'rev-parse', 'HEAD');
  const worktree = join(root, 'linked'); git(source, 'worktree', 'add', '--detach', worktree);
  await mkdir(join(root, 'scratch'), { mode: 0o700 });
  const result = await observeRuntime({ ...config(join(root, 'scratch')), checkouts: [{ repository: 'example/repository', directory: worktree }] });
  assert.equal(result.adoptions[0].availability, 'available'); assert.equal(result.adoptions[0].revision, head);
}));

test('configuration form/count bounds reject ambiguous source identities before observation', () => {
  const input = config('/tmp/scratch');
  validateRuntimeInput(input);
  for (const alias of ['x'.repeat(65), '../runner', 'bad\nname', 'bad\n']) assert.throws(() => validateRuntimeInput({ ...input, registrations: [{ alias, directory: '/tmp' }] }));
  for (const directory of ['/tmp/../outside', '/tmp/' + 'é'.repeat(2048), '/tmp/\u0000bad', 'relative'])
    assert.throws(() => validateRuntimeInput({ ...input, registrations: [{ alias: 'runner', directory }] }));
  assert.throws(() => validateRuntimeInput({ ...input, checkouts: Array.from({ length: 11 }, (_, i) => ({ repository: 'example/r' + i, directory: '/tmp' })) }));
  assert.throws(() => validateRuntimeInput({ ...input, checkouts: [{ repository: 'example/repository', directory: '/tmp' }, { repository: 'Example/Repository', directory: '/tmp' }] }));
});

async function observedCheckout(root, source) {
  const scratch = await mkdtemp(join(root, 'observation-'));
  return (await observeRuntime({ ...config(scratch), checkouts: [{ repository: 'example/repository', directory: source }] })).adoptions[0];
}

test('metadata byte boundaries accept exact maxima and reject oversized HEAD, config, loose and packed refs', async () => fixture(async root => {
  const source = await checkout(root), gitDir = join(source, '.git');
  for (const [path, maximum] of [['HEAD', 8192], ['config', 65536], ['refs/heads/main', 1024]]) {
    const original = await readFile(join(gitDir, path));
    await writeFile(join(gitDir, path), Buffer.concat([original, Buffer.alloc(maximum - original.length, 32)]));
    assert.equal((await observedCheckout(root, source)).availability, 'available', path + ' at maximum');
    await writeFile(join(gitDir, path), Buffer.concat([original, Buffer.alloc(maximum + 1 - original.length, 32)]));
    assert.equal((await observedCheckout(root, source)).availability, 'unavailable', path + ' over maximum');
    await writeFile(join(gitDir, path), original);
  }
  const head = git(source, 'rev-parse', 'HEAD'); await rm(join(gitDir, 'refs/heads/main'));
  const original = head + ' refs/heads/main\n';
  await writeFile(join(gitDir, 'packed-refs'), original + '#' + 'x'.repeat(2 * 1024 * 1024 - original.length - 2) + '\n');
  assert.equal((await observedCheckout(root, source)).availability, 'available');
  await writeFile(join(gitDir, 'packed-refs'), original + '#' + 'x'.repeat(2 * 1024 * 1024 - original.length - 1) + '\n');
  assert.equal((await observedCheckout(root, source)).availability, 'unavailable');
}));

test('five reference hops work, six hops, cycles and traversal are unsupported', async () => fixture(async root => {
  const source = await checkout(root), head = git(source, 'rev-parse', 'HEAD'), gitDir = join(source, '.git');
  await writeFile(join(gitDir, 'HEAD'), 'ref: refs/heads/chain-0\n');
  for (let i = 0; i < 5; i++) await writeFile(join(gitDir, 'refs/heads/chain-' + i), i === 4 ? head + '\n' : 'ref: refs/heads/chain-' + (i + 1) + '\n');
  assert.equal((await observedCheckout(root, source)).availability, 'available');
  await writeFile(join(gitDir, 'refs/heads/chain-4'), 'ref: refs/heads/chain-5\n');
  await writeFile(join(gitDir, 'refs/heads/chain-5'), head + '\n');
  assert.equal((await observedCheckout(root, source)).availability, 'unavailable');
  await writeFile(join(gitDir, 'refs/heads/chain-1'), 'ref: refs/heads/chain-0\n');
  assert.equal((await observedCheckout(root, source)).availability, 'unavailable');
  await writeFile(join(gitDir, 'HEAD'), 'ref: refs/heads/../../outside\n');
  assert.equal((await observedCheckout(root, source)).availability, 'unavailable');
}));

test('committed file bound is checked against the object before reading its body', async () => fixture(async root => {
  const source = await checkout(root), text = await readFile(join(source, 'package.json'), 'utf8');
  await writeFile(join(source, 'package.json'), text + ' '.repeat(2 * 1024 * 1024 - Buffer.byteLength(text)));
  git(source, 'add', '.'); git(source, 'commit', '-m', 'At file boundary');
  assert.equal((await observedCheckout(root, source)).declaredCli, '0.12.55');
  await writeFile(join(source, 'package.json'), text + ' '.repeat(2 * 1024 * 1024 + 1 - Buffer.byteLength(text)));
  git(source, 'add', '.'); git(source, 'commit', '-m', 'Over file boundary');
  assert.equal((await observedCheckout(root, source)).availability, 'unavailable');
}));

test('registration byte maximum, source count and directory traversal limits remain explicit', async () => fixture(async root => {
  const runner = join(root, 'runner'); await mkdir(runner);
  const row = JSON.stringify({ agentId: 1, agentName: 'bounded', gitHubUrl: 'https://github.com/example/repository' });
  const input = { ...config(root), registrations: Array.from({ length: 10 }, (_, i) => ({ alias: 'r' + i, directory: runner })) };
  await writeFile(join(runner, '.runner'), row + ' '.repeat(32768 - row.length));
  assert.equal((await observeRuntime(input)).registrations.filter(r => r.availability === 'available').length, 10);
  await writeFile(join(runner, '.runner'), row + ' '.repeat(32769 - row.length));
  assert.equal((await observeRuntime(input)).registrations[0].availability, 'unavailable');
  const parts = root.split('/').filter(Boolean).length;
  const deep = join(root, ...Array.from({ length: 64 - parts }, () => 'd')); await mkdir(deep, { recursive: true });
  await writeFile(join(deep, '.runner'), row);
  assert.equal((await observeRuntime({ ...config(root), registrations: [{ alias: 'x'.repeat(64), directory: deep }] })).registrations[0].availability, 'available');
  assert.equal((await observeRuntime({ ...config(root), registrations: [{ alias: 'deep', directory: join(deep, 'one-more') }] })).registrations[0].availability, 'unavailable');
}));

test('stdin bytes are bounded by the real tokenless CLI without echoing private input', async () => fixture(async root => {
  const script = fileURLToPath(new URL('../src/workspace-tools/runtime-inventory.mjs', import.meta.url));
  const body = JSON.stringify(config(root));
  const options = { input: body + ' '.repeat(128 * 1024 - Buffer.byteLength(body)), encoding: 'utf8', env: { PATH: process.env.PATH }, timeout: 10000 };
  assert.equal(JSON.parse(execFileSync(process.execPath, [script], options)).availability, 'available');
  try {
    execFileSync(process.execPath, [script], { ...options, input: options.input + ' ' });
    assert.fail('Oversized input passed');
  } catch (error) {
    assert.equal(error.status, 1); assert.equal(JSON.parse(error.stdout).availability, 'unavailable');
    assert.doesNotMatch(error.stdout, /directory|private|\/tmp\//);
  }
}));


test('linked git metadata redirection byte bounds cannot select an oversized or replaced source', async () => fixture(async root => {
  const source = await checkout(root), worktree = join(root, 'linked');
  git(source, 'worktree', 'add', '--detach', worktree);
  const gitFile = join(worktree, '.git');
  const pointer = await readFile(gitFile, 'utf8');
  const selected = pointer.trim().slice(8);
  for (const path of [gitFile, join(selected, 'commondir')]) {
    const original = await readFile(path);
    await writeFile(path, Buffer.concat([original, Buffer.alloc(8192 - original.length, 32)]));
    assert.equal((await observedCheckout(root, worktree)).availability, 'available');
    await writeFile(path, Buffer.concat([original, Buffer.alloc(8193 - original.length, 32)]));
    assert.equal((await observedCheckout(root, worktree)).availability, 'unavailable');
    await writeFile(path, original);
  }
  git(source, 'gc', '--prune=now');
  const packDir = join(source, '.git/objects/pack');
  const { readdir } = await import('node:fs/promises');
  const pack = (await readdir(packDir)).find(name => name.endsWith('.pack'));
  const originalPack = join(packDir, pack);
  await rename(originalPack, join(root, 'outside.pack'));
  await symlink(join(root, 'outside.pack'), originalPack);
  assert.equal((await observedCheckout(root, worktree)).availability, 'unavailable');
}));

test('private configuration exact field, group, source and UTF8 path maxima are enforced', () => {
  const input = config('/tmp/scratch');
  const registrations = Array.from({ length: 10 }, (_, i) => ({ alias: 'r' + i, directory: '/tmp' }));
  const checkouts = Array.from({ length: 10 }, (_, i) => ({ repository: 'example/r' + i, directory: '/tmp' }));
  validateRuntimeInput({ ...input, registrations, checkouts, trustedGroupIds: Array.from({ length: 10 }, (_, i) => i) });
  assert.throws(() => validateRuntimeInput({ ...input, registrations: [...registrations, { alias: 'extra', directory: '/tmp' }] }));
  for (const trustedGroupIds of [[-1], [0x1_0000_0000], [1, 1], Array.from({ length: 11 }, (_, i) => i)])
    assert.throws(() => validateRuntimeInput({ ...input, trustedGroupIds }));
  validateRuntimeInput({ ...input, trustedGroupIds: [0, 0xffff_ffff] });
  validateRuntimeInput({ ...input, registrations: [{ alias: 'x'.repeat(64), directory: '/' + 'é'.repeat(2047) + 'x' }] });
  assert.throws(() => validateRuntimeInput({ ...input, registrations: [{ alias: 'x', directory: '/' + 'é'.repeat(2048) }] }));
  assert.throws(() => validateRuntimeInput({ ...input, extra: 'unexpected' }));
  assert.throws(() => validateRuntimeInput({ ...input, registrations: [{ alias: 'x', directory: '/tmp', extra: true }] }));
});
