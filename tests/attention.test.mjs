import test from 'node:test';
import assert from 'node:assert/strict';
import { reconcileAttention } from '../src/web/public/attention.js';
const issue = { id: 77, number: 7, title: 'Work', state: 'open', updatedAt: '2026-11-07T10:00:00Z', labels: ['needs-info', 'waiting-review'] };
const collection = (issues = [issue], extra = {}) => new Map([['example/repo', { availability: 'available', issues, observedAt: '2026-11-08T01:00:00Z', ...extra }]]);
test('distinct labels retain separate source identities and repeated reads deduplicate without inventing questions', () => {
  const first = reconcileAttention(collection());
  const again = reconcileAttention(collection(), first.entries);
  assert.equal(again.entries.size, 2);
  assert.equal(new Set([...again.entries.values()].map(row => row.key)).size, 2);
  assert.ok([...again.entries.values()].every(row => row.state === 'source-label' && !row.question && !row.actor && !row.resolved));
});
test('disappearance, incomplete pages and stale reads never resolve a prior context or advance its time', () => {
  const first = reconcileAttention(collection());
  const missing = reconcileAttention(collection([], { complete: false, observedAt: '2026-11-09T01:00:00Z' }), first.entries);
  assert.ok([...missing.entries.values()].every(row => row.state === 'not-observed' && row.observedAt === '2026-11-08T01:00:00.000Z' && !row.resolved));
  const stale = reconcileAttention(collection([issue], { stale: true }), first.entries);
  assert.ok([...stale.entries.values()].every(row => row.state === 'stale'));
});
test('denied or removed repositories discard private history and malformed times remain unknown', () => {
  const first = reconcileAttention(collection());
  assert.equal(reconcileAttention(collection([], { availability: 'denied' }), first.entries).entries.size, 0);
  assert.equal(reconcileAttention(new Map(), first.entries).entries.size, 0);
  const result = reconcileAttention(collection([{ ...issue, updatedAt: 'invalid' }], { observedAt: 'invalid' }));
  assert.ok([...result.entries.values()].every(row => row.sourceTime === null && row.observedAt === null));
});
test('retained history is bounded without implying resolution', () => {
  const rows = Array.from({ length: 1100 }, (_, id) => ({ ...issue, id, number: id + 1, labels: ['needs-info'] }));
  const result = reconcileAttention(collection(rows));
  assert.equal(result.limited, true); assert.equal(result.entries.size, 1000);
  assert.ok([...result.entries.values()].every(row => !row.resolved));
});
