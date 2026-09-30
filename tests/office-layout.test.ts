import assert from 'node:assert/strict';
import test from 'node:test';

import {
  OFFICE_BOUNDS,
  OFFICE_ZONES,
  findOfficeZone,
  validateOfficeLayout,
} from '../assets/scripts/office/OfficeLayout.ts';

const expectedZones = {
  elevator: [-6.5, -9.5, 5, 5],
  reception: [2.5, -9.5, 11, 5],
  'open-office': [-2.5, -1, 13, 12],
  'meeting-room': [6.5, -0.5, 5, 11],
  'break-area': [-6.5, 8.5, 5, 7],
  pantry: [-1, 8.5, 6, 7],
  'boss-office': [5.5, 8.5, 7, 7],
};

test('the office layout defines the seven approved zones inside an 18 by 24 metre floor', () => {
  assert.deepEqual(OFFICE_BOUNDS, { width: 18, depth: 24 });
  assert.deepEqual(
    Object.fromEntries(OFFICE_ZONES.map(({ id, rect }) => [
      id,
      [rect.centerX, rect.centerZ, rect.width, rect.depth],
    ])),
    expectedZones,
  );
  assert.deepEqual(validateOfficeLayout(), []);
  assert.equal(findOfficeZone('open-office')?.label, '开放办公区');
});

test('layout validation reports duplicate, out-of-bounds and overlapping zones', () => {
  const invalid = [
    ...OFFICE_ZONES,
    {
      ...OFFICE_ZONES[0],
      rect: { centerX: -6.5, centerZ: -9.5, width: 30, depth: 5 },
    },
  ];

  const errors = validateOfficeLayout(invalid, OFFICE_BOUNDS);

  assert.ok(errors.some((message) => message.includes('duplicate zone id: elevator')));
  assert.ok(errors.some((message) => message.includes('outside office bounds: elevator')));
  assert.ok(errors.some((message) => message.includes('overlap: elevator/elevator')));
});

