import assert from 'node:assert/strict';
import test from 'node:test';
import {
  OFFICE_ILLUSTRATION_LABELS,
  OFFICE_ILLUSTRATION_LIMITS,
  OFFICE_ILLUSTRATION_TEXTURE_PATH,
  officeIllustrationIntroTransform,
  reduceOfficeIllustrationViewport,
} from '../assets/scripts/office/OfficeIllustrationModel.ts';

test('the illustration uses the texture subasset path emitted by Cocos', () => {
  assert.equal(OFFICE_ILLUSTRATION_TEXTURE_PATH, 'office-art/office-master-v2/texture');
});

test('illustration viewport zooms to a close-up without drifting from centre', () => {
  assert.deepEqual(
    reduceOfficeIllustrationViewport(
      { offsetX: 0, offsetY: 0, scale: 1 },
      { panX: 0, panY: 0, zoomScale: 2 },
    ),
    { offsetX: 0, offsetY: 0, scale: 2 },
  );
  assert.equal(
    reduceOfficeIllustrationViewport(
      { offsetX: 0, offsetY: 0, scale: 2 },
      { panX: 0, panY: 0, zoomScale: 99 },
    ).scale,
    OFFICE_ILLUSTRATION_LIMITS.maxScale,
  );
});

test('illustration viewport clamps panning to the visible image bounds', () => {
  assert.deepEqual(
    reduceOfficeIllustrationViewport(
      { offsetX: 0, offsetY: 0, scale: 2 },
      { panX: 1000, panY: -1000, zoomScale: 1 },
    ),
    { offsetX: 375, offsetY: -667, scale: 2 },
  );
});

test('zooming back to overview recentres the illustration', () => {
  assert.deepEqual(
    reduceOfficeIllustrationViewport(
      { offsetX: 240, offsetY: -320, scale: 2.5 },
      { panX: 20, panY: 20, zoomScale: 0.01 },
    ),
    { offsetX: 0, offsetY: 0, scale: 1 },
  );
});

test('invalid touch values cannot poison illustration transforms', () => {
  assert.deepEqual(
    reduceOfficeIllustrationViewport(
      { offsetX: 0, offsetY: 0, scale: 1 },
      { panX: Number.NaN, panY: Number.POSITIVE_INFINITY, zoomScale: 0 },
    ),
    { offsetX: 0, offsetY: 0, scale: 1 },
  );
});

test('the illustration overlay defines every approved office zone inside the canvas', () => {
  assert.deepEqual(
    OFFICE_ILLUSTRATION_LABELS.map(({ id }) => id).sort(),
    ['boss-office', 'break-area', 'elevator', 'meeting-room', 'open-office', 'pantry', 'reception'],
  );
  assert.equal(new Set(OFFICE_ILLUSTRATION_LABELS.map(({ id }) => id)).size, 7);
  for (const label of OFFICE_ILLUSTRATION_LABELS) {
    assert.ok(Math.abs(label.x) <= 375, label.id + ' x escaped the 750-wide canvas');
    assert.ok(Math.abs(label.y) <= 667, label.id + ' y escaped the 1334-high canvas');
  }
});

test('illustration intro eases from a close establishing shot to the full floor', () => {
  assert.deepEqual(officeIllustrationIntroTransform(0), { scale: 1.08, offsetY: -24 });
  assert.deepEqual(officeIllustrationIntroTransform(8), { scale: 1.04, offsetY: -12 });
  assert.deepEqual(officeIllustrationIntroTransform(16), { scale: 1, offsetY: 0 });
  assert.deepEqual(officeIllustrationIntroTransform(99), { scale: 1, offsetY: 0 });
});
