import assert from 'node:assert/strict';
import test from 'node:test';
import { clearProjectionCache, readProjectionCache, writeProjectionCache } from '../src/web/public/read-projection-cache.js';

class Storage {
  values = new Map();
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

test('read projections stay scoped, bounded, short-lived and clearable', () => {
  const originalStorage = globalThis.sessionStorage, originalNow = Date.now;
  const storage = new Storage(); let now = originalNow();
  globalThis.sessionStorage = storage; Date.now = () => now;
  try {
    const factory = { repositories: [['owner/repo', { issues: [{ number: 1 }] }]] };
    const operations = { repositories: [{ repository: 'owner/repo', runs: [] }] };
    assert.equal(writeProjectionCache('actor-scope-a', factory), true);
    assert.equal(writeProjectionCache('actor-scope-a', operations, 'operations'), true);
    assert.deepEqual(readProjectionCache('actor-scope-a'), factory);
    assert.deepEqual(readProjectionCache('actor-scope-a', 'operations'), operations);
    assert.equal(readProjectionCache('actor-scope-a', 'unsupported'), null);
    assert.equal(writeProjectionCache('actor-scope-a', { rows: ['x'.repeat(2 * 1024 * 1024)] }), false);
    assert.equal(readProjectionCache('actor-scope-a'), null);
    assert.deepEqual(readProjectionCache('actor-scope-a', 'operations'), operations);
    now += 10 * 60 * 1000 + 1;
    assert.equal(readProjectionCache('actor-scope-a', 'operations'), null);
    assert.equal(writeProjectionCache('actor-scope-a', factory), true);
    assert.equal(writeProjectionCache('actor-scope-b', operations), true);
    assert.deepEqual(readProjectionCache('actor-scope-b'), operations);
    assert.equal(readProjectionCache('actor-scope-a'), null);
    clearProjectionCache('actor-scope-b');
    assert.equal(readProjectionCache('actor-scope-b'), null);
    assert.equal(writeProjectionCache('actor-scope-b', operations), true);
    clearProjectionCache();
    assert.equal(readProjectionCache('actor-scope-b'), null);
  } finally {
    Date.now = originalNow;
    if (originalStorage === undefined) delete globalThis.sessionStorage;
    else globalThis.sessionStorage = originalStorage;
  }
});
