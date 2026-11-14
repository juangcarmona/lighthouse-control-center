import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

test('commitlint accepts the documented spec commit type used for OpenSpec-only changes', async () => {
  const message = join(tmpdir(), `lcc-commit-${randomUUID()}.txt`);
  try {
    await writeFile(message, 'spec: define exact-attempt coverage semantics\n');
    const result = spawnSync(process.execPath, ['node_modules/@commitlint/cli/cli.js', '--edit', message], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stdout + result.stderr);
  } finally { await rm(message, { force: true }); }
});
