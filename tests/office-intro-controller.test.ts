import assert from 'node:assert/strict';
import test from 'node:test';

import {
  OFFICE_CAMERA_POSES,
  OfficeIntroState,
  officePoseCoversBoundsAtAspect,
  sampleOfficeCameraPose,
} from '../assets/scripts/office/OfficeCameraModel.ts';
import * as officeCameraModel from '../assets/scripts/office/OfficeCameraModel.ts';
import {
  OFFICE_WORLD_MARKER,
  selectOfficePresentation,
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

test('bootstrap keeps the procedural office unless the illustration loaded successfully', () => {
  assert.equal(selectOfficePresentation(false), 'procedural');
  assert.equal(selectOfficePresentation(true), 'illustrated');
});

test('intro title fades in and back out only during the settle shot', () => {
  assert.equal(officeHudOpacityAt(13.9), 0);
  assert.equal(officeHudOpacityAt(14.5), 0.5);
  assert.equal(officeHudOpacityAt(15), 1);
  assert.equal(officeHudOpacityAt(15.5), 0.5);
  assert.equal(officeHudOpacityAt(16), 0);
});

test('pinch-to-zoom reaches a useful close view without leaving the overview range', () => {
  const reduce = Reflect.get(officeCameraModel, 'reduceOfficeExploreCamera') as undefined | ((
    state: { targetX: number; targetZ: number; orthoHeight: number },
    gesture: { panWorldX: number; panWorldZ: number; zoomScale: number },
  ) => { targetX: number; targetZ: number; orthoHeight: number });
  assert.equal(typeof reduce, 'function', 'camera exploration reducer is missing');
  if (!reduce) return;

  const closer = reduce(
    { targetX: 0, targetZ: 0, orthoHeight: 27 },
    { panWorldX: 0, panWorldZ: 0, zoomScale: 2 },
  );
  assert.deepEqual(closer, { targetX: 0, targetZ: 0, orthoHeight: 13.5 });
  assert.equal(reduce(closer, { panWorldX: 0, panWorldZ: 0, zoomScale: 10 }).orthoHeight, 7);
  assert.equal(reduce(closer, { panWorldX: 0, panWorldZ: 0, zoomScale: 0.1 }).orthoHeight, 27);
});

test('camera dragging stays inside the office and locks back to centre at full overview', () => {
  const reduce = Reflect.get(officeCameraModel, 'reduceOfficeExploreCamera') as undefined | ((
    state: { targetX: number; targetZ: number; orthoHeight: number },
    gesture: { panWorldX: number; panWorldZ: number; zoomScale: number },
  ) => { targetX: number; targetZ: number; orthoHeight: number });
  assert.equal(typeof reduce, 'function', 'camera exploration reducer is missing');
  if (!reduce) return;

  assert.deepEqual(
    reduce(
      { targetX: 0, targetZ: 0, orthoHeight: 7 },
      { panWorldX: 100, panWorldZ: -100, zoomScale: 1 },
    ),
    { targetX: 6, targetZ: -8, orthoHeight: 7 },
  );
  assert.deepEqual(
    reduce(
      { targetX: 4, targetZ: -6, orthoHeight: 7 },
      { panWorldX: 2, panWorldZ: 2, zoomScale: 0.01 },
    ),
    { targetX: 0, targetZ: 0, orthoHeight: 27 },
  );
});

test('touch sampling derives pan and pinch scale from real point movement', () => {
  const sample = Reflect.get(officeCameraModel, 'sampleOfficeTouchGesture') as undefined | ((
    current: readonly (readonly [number, number])[],
    previous: readonly (readonly [number, number])[],
  ) => { panX: number; panY: number; zoomScale: number });
  assert.equal(typeof sample, 'function', 'touch gesture sampler is missing');
  if (!sample) return;

  assert.deepEqual(sample([[60, 40]], [[50, 55]]), { panX: 10, panY: -15, zoomScale: 1 });
  assert.deepEqual(
    sample([[0, 0], [200, 0]], [[10, 10], [110, 10]]),
    { panX: 40, panY: -10, zoomScale: 2 },
  );
});
