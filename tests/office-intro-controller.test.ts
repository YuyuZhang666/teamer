import assert from 'node:assert/strict';
import test from 'node:test';

import {
  OFFICE_CAMERA_POSES,
  OfficeIntroState,
  officePoseCoversBoundsAtAspect,
  sampleOfficeCameraPose,
} from '../assets/scripts/office/OfficeCameraModel.ts';
import {
  OFFICE_WORLD_MARKER,
  shouldBuildOfficeWorld,
} from '../assets/scripts/office/OfficeBootstrapPolicy.ts';
import { officeHudOpacityAt } from '../assets/scripts/office/OfficeHudModel.ts';

test('camera sampling starts at the elevator and settles on the final overview', () => {
  assert.deepEqual(sampleOfficeCameraPose(-1).pose, OFFICE_CAMERA_POSES.elevator);
  const final = sampleOfficeCameraPose(16);
  assert.equal(final.complete, true);
  assert.deepEqual(final.pose, OFFICE_CAMERA_POSES.settle);
});

test('final overview keeps the complete office inside both narrow portrait viewports', () => {
  assert.equal(officePoseCoversBoundsAtAspect(OFFICE_CAMERA_POSES.settle, 375 / 667), true);
  assert.equal(officePoseCoversBoundsAtAspect(OFFICE_CAMERA_POSES.settle, 390 / 844), true);
});

test('camera sampling interpolates halfway between reception and open office', () => {
  const sample = sampleOfficeCameraPose(3.75);
  assert.deepEqual(sample.pose.position, [13, 14, -16]);
  assert.equal(sample.pose.orthoHeight, 8.75);
});

test('skipping the intro is idempotent and pins elapsed time at sixteen seconds', () => {
  const state = new OfficeIntroState();
  state.advance(3);
  assert.equal(state.skip(), true);
  assert.equal(state.skip(), false);
  assert.equal(state.elapsedSeconds, 16);
  assert.equal(state.isComplete, true);
  state.advance(5);
  assert.equal(state.elapsedSeconds, 16);
});

test('bootstrap policy prevents duplicate office worlds', () => {
  assert.equal(OFFICE_WORLD_MARKER, 'OfficeWorld');
  assert.equal(shouldBuildOfficeWorld(['Canvas']), true);
  assert.equal(shouldBuildOfficeWorld(['Canvas', OFFICE_WORLD_MARKER]), false);
});

test('intro title fades in and back out only during the settle shot', () => {
  assert.equal(officeHudOpacityAt(13.9), 0);
  assert.equal(officeHudOpacityAt(14.5), 0.5);
  assert.equal(officeHudOpacityAt(15), 1);
  assert.equal(officeHudOpacityAt(15.5), 0.5);
  assert.equal(officeHudOpacityAt(16), 0);
});

