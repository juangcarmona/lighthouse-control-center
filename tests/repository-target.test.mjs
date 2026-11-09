import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const { repository } = JSON.parse(readFileSync(new URL('../.lighthouse/github.json', import.meta.url), 'utf8'));
const script = new URL('../scripts/check-repository-target.mjs', import.meta.url);

test('repository preflight rejects the neighboring repository before contacting GitHub', () => {
  const directory = mkdtempSync(join(tmpdir(), 'lcc-repository-target-'));
  try {
    const marker = join(directory, 'called');
    writeFileSync(join(directory, 'gh'), `#!/usr/bin/env node\nrequire('node:fs').writeFileSync(${JSON.stringify(marker)}, 'called');\n`, { mode: 0o700 });
    for (const args of [[], ['juangcarmona/lighthouse'], [repository, 'extra'], ['--help']]) {
      const result = spawnSync(process.execPath, [script.pathname, ...args], {
        env: { ...process.env, PATH: directory + ':' + process.env.PATH }, encoding: 'utf8',
      });
      assert.equal(result.status, 1);
      assert.equal(result.stdout, '');
      assert.equal(existsSync(marker), false);
    }
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test('repository preflight requires the live canonical name and numeric identity from a read-only API call', () => {
  const directory = mkdtempSync(join(tmpdir(), 'lcc-repository-identity-'));
  try {
    const argumentsFile = join(directory, 'arguments.json');
    writeFileSync(join(directory, 'gh'), `#!/usr/bin/env node
require('node:fs').writeFileSync(${JSON.stringify(argumentsFile)}, JSON.stringify(process.argv.slice(2)));
if (process.env.TARGET_FAILURE) process.exit(1);
console.log(process.env.TARGET_RESPONSE);
`, { mode: 0o700 });
    const run = (response, failure = '') => spawnSync(process.execPath, [script.pathname, repository], {
      env: { ...process.env, PATH: directory + ':' + process.env.PATH,
        TARGET_RESPONSE: JSON.stringify(response), TARGET_FAILURE: failure }, encoding: 'utf8',
    });
    const identity = { repository, repositoryId: 1425429121 };
    const accepted = run(identity);
    assert.equal(accepted.status, 0);
    assert.deepEqual(JSON.parse(accepted.stdout), identity);
    assert.deepEqual(JSON.parse(readFileSync(argumentsFile, 'utf8')), [
      'api', '--hostname', 'github.com', `repos/${repository}`, '--jq', '{repository: .full_name, repositoryId: .id}',
    ]);
    for (const response of [{ repository: 'juangcarmona/lighthouse', repositoryId: 1 },
      { repository, repositoryId: null }, { repository, repositoryId: '1425429121' },
      { repository, repositoryId: 0 }]) {
      const rejected = run(response);
      assert.equal(rejected.status, 1);
      assert.equal(rejected.stdout, '');
    }
    assert.equal(run(identity, 'unavailable').status, 1);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
