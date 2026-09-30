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
      'meeting-present',
      'boss-patrol',
      'flatterer-follow',
    ]),
  );
});

test('the flatterer shares the boss patrol area and animation phase', () => {
  const flatterer = OFFICE_NPC_PLAN.find(({ id }) => id === 'worker-flatterer');
  const boss = OFFICE_NPC_PLAN.find(({ id }) => id === 'boss');
  assert.ok(flatterer);
  assert.ok(boss);
  assert.equal(flatterer.zone, 'boss-office');
  assert.equal(flatterer.phaseOffset, boss.phaseOffset);
  assert.ok(Math.hypot(
    flatterer.position[0] - boss.position[0],
    flatterer.position[2] - boss.position[2],
  ) <= 2);
});

test('npc placements have unique ids and valid animation phases', () => {
  assert.equal(new Set(OFFICE_NPC_PLAN.map(({ id }) => id)).size, 10);
  for (const placement of OFFICE_NPC_PLAN) {
    assert.ok(placement.phaseOffset >= 0 && placement.phaseOffset < 1);
    assert.equal(placement.position.length, 3);
  }
});

