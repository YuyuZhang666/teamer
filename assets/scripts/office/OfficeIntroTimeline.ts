export type OfficeIntroShotId = 'elevator' | 'reception' | 'open-office' | 'overview' | 'settle';

export interface OfficeIntroShot {
  readonly id: OfficeIntroShotId;
  readonly start: number;
  readonly end: number;
}

export const OFFICE_INTRO_TOTAL_SECONDS = 16;

export const OFFICE_INTRO_SHOTS: readonly Readonly<OfficeIntroShot>[] = Object.freeze([
  Object.freeze({ id: 'elevator', start: 0, end: 2.5 }),
  Object.freeze({ id: 'reception', start: 2.5, end: 5 }),
  Object.freeze({ id: 'open-office', start: 5, end: 10 }),
  Object.freeze({ id: 'overview', start: 10, end: 14 }),
  Object.freeze({ id: 'settle', start: 14, end: 16 }),
]);

export function clampIntroTime(seconds: number): number {
  if (!Number.isFinite(seconds)) return 0;
  return Math.min(OFFICE_INTRO_TOTAL_SECONDS, Math.max(0, seconds));
}

