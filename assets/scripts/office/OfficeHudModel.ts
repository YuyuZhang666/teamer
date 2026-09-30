import { clampIntroTime } from './OfficeIntroTimeline.ts';

export function officeHudOpacityAt(elapsedSeconds: number): number {
  const time = clampIntroTime(elapsedSeconds);
  if (time < 14 || time >= 16) return 0;
  return time <= 15 ? time - 14 : 16 - time;
}
