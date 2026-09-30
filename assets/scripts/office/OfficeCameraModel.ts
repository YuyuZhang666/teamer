import {
  OFFICE_INTRO_SHOTS,
  OFFICE_INTRO_TOTAL_SECONDS,
  clampIntroTime,
  type OfficeIntroShotId,
} from './OfficeIntroTimeline.ts';
import { OFFICE_BOUNDS } from './OfficeLayout.ts';
import type { OfficeTuple3 } from './OfficePrimitiveSpec.ts';

export interface OfficeCameraPose {
  readonly position: OfficeTuple3;
  readonly target: OfficeTuple3;
  readonly orthoHeight: number;
}

const pose = (
  position: OfficeTuple3,
  target: OfficeTuple3,
  orthoHeight: number,
): Readonly<OfficeCameraPose> => Object.freeze({
  position: Object.freeze([...position]) as OfficeTuple3,
  target: Object.freeze([...target]) as OfficeTuple3,
  orthoHeight,
});

export const OFFICE_CAMERA_POSES: Readonly<Record<OfficeIntroShotId, Readonly<OfficeCameraPose>>> = Object.freeze({
  elevator: pose([-9.5, 7.5, -16.5], [-6.5, 0.8, -9.5], 5.5),
  reception: pose([11.5, 10.5, -17.5], [1.2, 0.6, -9.2], 7),
  'open-office': pose([14.5, 17.5, -14.5], [-2.2, 0.5, -1], 10.5),
  overview: pose([7, 25, -31], [0, 0.4, 0], 28),
  settle: pose([8, 23, -30], [0, 0.4, 0], 27),
});

const dot = (left: OfficeTuple3, right: OfficeTuple3): number => (
  left[0] * right[0] + left[1] * right[1] + left[2] * right[2]
);

const subtract = (left: OfficeTuple3, right: OfficeTuple3): OfficeTuple3 => [
  left[0] - right[0],
  left[1] - right[1],
  left[2] - right[2],
];

const cross = (left: OfficeTuple3, right: OfficeTuple3): OfficeTuple3 => [
  left[1] * right[2] - left[2] * right[1],
  left[2] * right[0] - left[0] * right[2],
  left[0] * right[1] - left[1] * right[0],
];

const normalize = (value: OfficeTuple3): OfficeTuple3 => {
  const length = Math.sqrt(dot(value, value));
  return length > 0
    ? [value[0] / length, value[1] / length, value[2] / length]
    : [0, 0, 0];
};

export function officePoseCoversBoundsAtAspect(
  cameraPose: Readonly<OfficeCameraPose>,
  aspectRatio: number,
): boolean {
  if (!Number.isFinite(aspectRatio) || aspectRatio <= 0 || cameraPose.orthoHeight <= 0) return false;
  const forward = normalize(subtract(cameraPose.target, cameraPose.position));
  const right = normalize(cross(forward, [0, 1, 0]));
  const screenUp = normalize(cross(right, forward));
  const halfWidth = cameraPose.orthoHeight * aspectRatio * 0.98;
  const halfHeight = cameraPose.orthoHeight * 0.98;
  const halfOfficeWidth = OFFICE_BOUNDS.width / 2;
  const halfOfficeDepth = OFFICE_BOUNDS.depth / 2;
  const furnitureTop = 3.4;

  for (const x of [-halfOfficeWidth, halfOfficeWidth]) {
    for (const y of [0, furnitureTop]) {
      for (const z of [-halfOfficeDepth, halfOfficeDepth]) {
        const relative = subtract([x, y, z], cameraPose.target);
        if (Math.abs(dot(relative, right)) > halfWidth) return false;
        if (Math.abs(dot(relative, screenUp)) > halfHeight) return false;
      }
    }
  }
  return true;
}

export interface OfficeCameraSample {
  readonly shotId: OfficeIntroShotId;
  readonly pose: Readonly<OfficeCameraPose>;
  readonly complete: boolean;
}

const mix = (from: number, to: number, progress: number): number => from + (to - from) * progress;
const mixTuple = (from: OfficeTuple3, to: OfficeTuple3, progress: number): OfficeTuple3 => Object.freeze([
  mix(from[0], to[0], progress),
  mix(from[1], to[1], progress),
  mix(from[2], to[2], progress),
]);

export function sampleOfficeCameraPose(
  elapsedSeconds: number,
  poses: Readonly<Record<OfficeIntroShotId, Readonly<OfficeCameraPose>>> = OFFICE_CAMERA_POSES,
): Readonly<OfficeCameraSample> {
  const time = clampIntroTime(elapsedSeconds);
  if (time >= OFFICE_INTRO_TOTAL_SECONDS) {
    return Object.freeze({ shotId: 'settle', pose: poses.settle, complete: true });
  }
  const shotIndex = Math.max(0, OFFICE_INTRO_SHOTS.findIndex((shot) => time < shot.end));
  const shot = OFFICE_INTRO_SHOTS[shotIndex];
  const nextShot = OFFICE_INTRO_SHOTS[Math.min(shotIndex + 1, OFFICE_INTRO_SHOTS.length - 1)];
  const duration = shot.end - shot.start;
  const progress = duration > 0 ? (time - shot.start) / duration : 1;
  const from = poses[shot.id];
  const to = poses[nextShot.id];
  return Object.freeze({
    shotId: shot.id,
    pose: Object.freeze({
      position: mixTuple(from.position, to.position, progress),
      target: mixTuple(from.target, to.target, progress),
      orthoHeight: mix(from.orthoHeight, to.orthoHeight, progress),
    }),
    complete: false,
  });
}

export class OfficeIntroState {
  private elapsed = 0;
  private complete = false;

  get elapsedSeconds(): number {
    return this.elapsed;
  }

  get isComplete(): boolean {
    return this.complete;
  }

  reset(): void {
    this.elapsed = 0;
    this.complete = false;
  }

  advance(deltaSeconds: number): void {
    if (this.complete) return;
    this.elapsed = clampIntroTime(this.elapsed + Math.max(0, Number.isFinite(deltaSeconds) ? deltaSeconds : 0));
    this.complete = this.elapsed >= OFFICE_INTRO_TOTAL_SECONDS;
  }

  skip(): boolean {
    if (this.complete) return false;
    this.elapsed = OFFICE_INTRO_TOTAL_SECONDS;
    this.complete = true;
    return true;
  }
}
