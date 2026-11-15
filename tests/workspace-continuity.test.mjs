import test from 'node:test';
import assert from 'node:assert/strict';
import { readDraft, writeDraft, clearProjectionCache, readProjectionCache, writeProjectionCache } from '../src/web/public/read-projection-cache.js';
import { workSignal } from '../src/web/public/evidence-projections.js';

const values = new Map();
globalThis.sessionStorage = {
  get length() { return values.size; }, key: index => [...values.keys()][index],
  getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key),
};

test('drafts stay scoped to actor, repository and issue and are cleared with recognized authority loss', () => {
  values.clear();
  assert.equal(writeDraft('scope-a', 71, 'owner/repository', 7, 'literal <script>text</script>'), true);
  assert.equal(readDraft('scope-a', 71, 'OWNER/REPOSITORY', 7), 'literal <script>text</script>');
  for (const args of [['scope-b', 71, 'owner/repository', 7], ['scope-a', 72, 'owner/repository', 7], ['scope-a', 71, 'owner/other', 7], ['scope-a', 71, 'owner/repository', 8]]) assert.equal(readDraft(...args), '');
  clearProjectionCache('scope-a');
  assert.equal(readDraft('scope-a', 71, 'owner/repository', 7), '');
});

test('expired drafts and invalid targets cannot reopen text, and oversized drafts are not persisted', () => {
  values.clear();
  writeDraft('scope-a', 71, 'owner/repository', 7, 'expired');
  for (const [key, value] of values) if (key.startsWith('lcc:draft:')) values.set(key, JSON.stringify({ ...JSON.parse(value), savedAt: Date.now() - 24 * 60 * 60 * 1000 - 1 }));
  assert.equal(readDraft('scope-a', 71, 'owner/repository', 7), '');
  assert.equal(writeDraft('scope-a', 71, 'owner/repository', 7, 'x'.repeat(10001)), false);
  assert.equal(writeDraft('scope-a', 0, 'owner/repository', 7, 'invalid'), false);
});

test('read projections never cross scopes and expiry removes a retained projection', () => {
  values.clear();
  writeProjectionCache('scope-a', { title: 'protected' }, 'issue');
  assert.equal(readProjectionCache('scope-a', 'issue').title, 'protected');
  assert.equal(readProjectionCache('scope-b', 'issue'), null);
  assert.equal(readProjectionCache('scope-a', 'issue'), null);
  writeProjectionCache('scope-a', { title: 'expired' }, 'health');
  for (const [key, value] of values) if (key.endsWith(':health')) values.set(key, JSON.stringify({ ...JSON.parse(value), savedAt: Date.now() - 10 * 60 * 1000 - 1 }));
  assert.equal(readProjectionCache('scope-a', 'health'), null);
});

test('work grouping distinguishes source hints from associated execution and historical closure', () => {
  assert.equal(workSignal({ state: 'open', labels: ['future', 'bot-working'] }).group, 'future');
  assert.match(workSignal({ state: 'open', labels: ['implement'] }).text, /queue unverified/);
  assert.match(workSignal({ state: 'open', labels: ['bot-working'] }).text, /execution unverified/);
  assert.equal(workSignal({ state: 'open', labels: ['needs-info'] }).group, 'waiting');
  assert.equal(workSignal({ state: 'open', labels: [] }, [{ availability: 'available', executionStatus: 'in_progress' }]).group, 'working');
  assert.equal(workSignal({ state: 'closed', labels: ['needs-info'] }).group, 'closed');
  assert.equal(workSignal({ state: 'open', labels: [] }).group, 'unknown');
});
