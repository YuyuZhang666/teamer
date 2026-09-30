import assert from 'node:assert/strict';
import test from 'node:test';

import {
  OFFICE_INTRO_SHOTS,
  OFFICE_INTRO_TOTAL_SECONDS,
  clampIntroTime,
} from '../assets/scripts/office/OfficeIntroTimeline.ts';

test('the office intro covers five contiguous shots in sixteen seconds', () => {
  assert.equal(OFFICE_INTRO_TOTAL_SECONDS, 16);
  assert.deepEqual(
    OFFICE_INTRO_SHOTS.map(({ id, start, end }) => [id, start, end]),
    [
      ['elevator', 0, 2.5],
      ['reception', 2.5, 5],
      ['open-office', 5, 10],
      ['overview', 10, 14],
      ['settle', 14, 16],
    ],
  );
});

test('intro time clamps safely at both timeline boundaries', () => {
  assert.equal(clampIntroTime(-0.25), 0);
  assert.equal(clampIntroTime(8), 8);
  assert.equal(clampIntroTime(19), 16);
  assert.equal(clampIntroTime(Number.NaN), 0);
});

