import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCoberturaSummary } from '../scripts/produce-coverage-report.mjs';

test('coverage report uses exact integer line totals and rounds only the displayed percentage', () => {
  assert.deepEqual(parseCoberturaSummary('<coverage line-rate="0.3333" lines-covered="1" lines-valid="3"></coverage>'),
    { linesCovered: 1, linesValid: 3, percentage: 33.33 });
});

test('coverage report rejects absent, empty, fractional and impossible totals', () => {
  for (const xml of ['', '<coverage/>', '<coverage lines-covered="0" lines-valid="0"/>',
      '<coverage lines-covered="1.5" lines-valid="2"/>', '<coverage lines-covered="3" lines-valid="2"/>'])
    assert.throws(() => parseCoberturaSummary(xml));
});
