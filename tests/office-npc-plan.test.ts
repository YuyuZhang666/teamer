import assert from 'node:assert/strict';
import test from 'node:test';

import { OFFICE_NPC_PLAN } from '../assets/scripts/office/OfficeNpcPlan.ts';

test('the first office scene schedules ten characters across all required motions', () => {
  assert.equal(OFFICE_NPC_PLAN.length, 10);
  assert.deepEqual(
    new Set(OFFICE_NPC_PLAN.map(({ motion }) => motion)),
    new Set([
      'typing',
      'phone-glance',
      'elevator-wait',
      'parcel-sort',
      'drink-stir',
      'meeting-nod',
      'boss-patrol',
      'flatterer-follow',
    ]),
  );
});

test('npc placements have unique ids and valid animation phases', () => {
  assert.equal(new Set(OFFICE_NPC_PLAN.map(({ id }) => id)).size, 10);
  for (const placement of OFFICE_NPC_PLAN) {
    assert.ok(placement.phaseOffset >= 0 && placement.phaseOffset < 1);
    assert.equal(placement.position.length, 3);
  }
});

