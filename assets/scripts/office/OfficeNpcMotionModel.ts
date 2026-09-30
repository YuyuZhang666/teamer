import type { OfficeNpcMotionKind } from './OfficeNpcPlan.ts';

export interface OfficeNpcMotionPose {
  readonly offsetX: number;
  readonly offsetY: number;
  readonly offsetZ: number;
  readonly bodyPitch: number;
  readonly bodyYaw: number;
  readonly bodyRoll: number;
  readonly armPitch: number;
}

export const OFFICE_NPC_MOTION_KINDS: readonly OfficeNpcMotionKind[] = Object.freeze([
  'typing',
  'phone-glance',
  'elevator-wait',
  'parcel-sort',
  'drink-stir',
  'meeting-nod',
  'meeting-present',
  'boss-patrol',
  'flatterer-follow',
]);

const PERIODS: Readonly<Record<OfficeNpcMotionKind, number>> = Object.freeze({
  typing: 4,
  'phone-glance': 6,
  'elevator-wait': 5,
  'parcel-sort': 4,
  'drink-stir': 5,
  'meeting-nod': 3,
  'meeting-present': 5,
  'boss-patrol': 8,
  'flatterer-follow': 8,
});

const round = (value: number): number => Math.round(value * 1_000_000) / 1_000_000;

export function normalizeNpcPhase(phase: number): number {
  if (!Number.isFinite(phase)) return 0;
  return ((phase % 1) + 1) % 1;
}

export function officeNpcMotionPeriod(kind: OfficeNpcMotionKind): number {
  return PERIODS[kind];
}

export function sampleOfficeNpcMotion(
  kind: OfficeNpcMotionKind,
  elapsedSeconds: number,
  phaseOffset: number,
): Readonly<OfficeNpcMotionPose> {
  const period = PERIODS[kind];
  const cycle = normalizeNpcPhase((Number.isFinite(elapsedSeconds) ? elapsedSeconds : 0) / period + phaseOffset);
  const angle = cycle * Math.PI * 2;
  const wave = Math.sin(angle);
  const cosine = Math.cos(angle);
  let pose: OfficeNpcMotionPose = {
    offsetX: 0,
    offsetY: 0,
    offsetZ: 0,
    bodyPitch: 0,
    bodyYaw: 0,
    bodyRoll: 0,
    armPitch: 0,
  };

  switch (kind) {
    case 'typing':
      pose = { ...pose, bodyPitch: 2, armPitch: -22 + wave * 12, offsetY: Math.abs(wave) * 0.018 };
      break;
    case 'phone-glance':
      pose = { ...pose, bodyPitch: 5 + Math.abs(wave) * 3, bodyYaw: wave * 5, armPitch: -45 };
      break;
    case 'elevator-wait':
      pose = { ...pose, offsetY: Math.abs(wave) * 0.035, bodyRoll: wave * 1.8 };
      break;
    case 'parcel-sort':
      pose = { ...pose, bodyYaw: wave * 12, armPitch: -18 + cosine * 15 };
      break;
    case 'drink-stir':
      pose = { ...pose, bodyYaw: wave * 3, armPitch: -28 + cosine * 10 };
      break;
    case 'meeting-nod':
      pose = { ...pose, bodyPitch: wave * 7 };
      break;
    case 'meeting-present':
      pose = { ...pose, bodyYaw: wave * 10, bodyRoll: wave * 2, armPitch: -32 + cosine * 14 };
      break;
    case 'boss-patrol':
      pose = { ...pose, offsetX: wave * 1.25, bodyYaw: cosine * 8 };
      break;
    case 'flatterer-follow':
      pose = { ...pose, offsetX: wave * 1.25, bodyYaw: cosine * 10, armPitch: -8 + cosine * 4 };
      break;
  }

  return Object.freeze({
    offsetX: round(pose.offsetX),
    offsetY: round(pose.offsetY),
    offsetZ: round(pose.offsetZ),
    bodyPitch: round(pose.bodyPitch),
    bodyYaw: round(pose.bodyYaw),
    bodyRoll: round(pose.bodyRoll),
    armPitch: round(pose.armPitch),
  });
}

