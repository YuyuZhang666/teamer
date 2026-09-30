import assert from 'node:assert/strict';
import test from 'node:test';

import {
  OFFICE_NPC_MOTION_KINDS,
  normalizeNpcPhase,
  officeNpcMotionPeriod,
  sampleOfficeNpcMotion,
} from '../assets/scripts/office/OfficeNpcMotionModel.ts';

test('npc motion phases wrap into the stable zero-to-one interval', () => {
  assert.equal(normalizeNpcPhase(-0.2), 0.8);
  assert.ok(Math.abs(normalizeNpcPhase(1.2) - 0.2) < 1e-9);
  assert.equal(normalizeNpcPhase(Number.NaN), 0);
});

test('every planned npc motion loops between three and eight seconds', () => {
  for (const kind of OFFICE_NPC_MOTION_KINDS) {
    const period = officeNpcMotionPeriod(kind);
    assert.ok(period >= 3 && period <= 8, `${kind} period ${period}`);
    assert.deepEqual(sampleOfficeNpcMotion(kind, 1.25, 0.3), sampleOfficeNpcMotion(kind, 1.25 + period, 0.3));
  }
});

test('patrol and follow movement stays within the assigned 2.5-unit area', () => {
  for (const kind of ['boss-patrol', 'flatterer-follow'] as const) {
    for (let step = 0; step <= 32; step += 1) {
      const pose = sampleOfficeNpcMotion(kind, step / 4, 0.17);
      assert.ok(Math.hypot(pose.offsetX, pose.offsetZ) <= 2.5);
    }
  }
});

test('typing and meeting nods produce different readable body poses', () => {
  const typing = sampleOfficeNpcMotion('typing', 0.75, 0);
  const nodding = sampleOfficeNpcMotion('meeting-nod', 0.75, 0);
  assert.notDeepEqual(typing, nodding);
  assert.notEqual(typing.armPitch, 0);
  assert.notEqual(nodding.bodyPitch, 0);
});

