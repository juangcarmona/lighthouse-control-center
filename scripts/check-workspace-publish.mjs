import { spawnSync } from 'node:child_process';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

// Publishing outside the checkout prevents an ancestor node_modules directory from hiding missing runtime files.
const directory = await mkdtemp(join(tmpdir(), 'sofa-published-workspace-'));
try {
  const publish = spawnSync('dotnet', ['publish', 'src/SoFa.Web/SoFa.Web.csproj', '-c', 'Release', '--no-build', '--no-restore', '--disable-build-servers', '-o', directory], { encoding: 'utf8' });
  assert.equal(publish.status, 0, 'The exact Release application must publish.');
  const tools = join(directory, 'workspace-tools');
  const expected = JSON.parse(await readFile('node_modules/@juangcarmona/lighthouse-sdlc/package.json', 'utf8')).version;
  const bundled = JSON.parse(await readFile(join(tools, 'node_modules/@juangcarmona/lighthouse-sdlc/package.json'), 'utf8')).version;
  assert.equal(bundled, expected, 'Bundle the selected installed SDK, without resolving another version at runtime.');
  const check = spawnSync(process.execPath, [join(tools, 'validate-stage-result.mjs')], {
    cwd: directory, input: '{}', encoding: 'utf8', env: { PATH: process.env.PATH, NODE_NO_WARNINGS: '1' }, timeout: 10000,
  });
  assert.equal(check.status, 0, 'The published offline validator must resolve its complete installed SDK.');
  assert.deepEqual(JSON.parse(check.stdout), { valid: false });
  assert.equal(check.stderr, '');
  assert.deepEqual(await readFile(join(tools, 'issue-control-read.mjs')), await readFile('src/workspace-tools/issue-control-read.mjs'));
  console.log('Published workspace resolves its pinned SDK outside the checkout; no credentials or source calls used.');
} finally { await rm(directory, { recursive: true, force: true }); }
