import type { OfficeZoneId } from './OfficeLayout.ts';

export type OfficeNpcMotionKind =
  | 'typing'
  | 'phone-glance'
  | 'elevator-wait'
  | 'parcel-sort'
  | 'drink-stir'
  | 'meeting-nod'
  | 'boss-patrol'
  | 'flatterer-follow';

export interface OfficeNpcPlacement {
  readonly id: string;
  readonly zone: OfficeZoneId;
  readonly position: readonly [number, number, number];
  readonly yaw: number;
  readonly motion: OfficeNpcMotionKind;
  readonly phaseOffset: number;
}

const npc = (
  id: string,
  zoneId: OfficeZoneId,
  position: readonly [number, number, number],
  yaw: number,
  motion: OfficeNpcMotionKind,
  phaseOffset: number,
): Readonly<OfficeNpcPlacement> => Object.freeze({
  id,
  zone: zoneId,
  position: Object.freeze(position),
  yaw,
  motion,
  phaseOffset,
});

export const OFFICE_NPC_PLAN: readonly Readonly<OfficeNpcPlacement>[] = Object.freeze([
  npc('elevator-waiter', 'elevator', [-6.6, 0, -8.8], 180, 'elevator-wait', 0.05),
  npc('receptionist', 'reception', [1.5, 0, -10], 180, 'parcel-sort', 0.18),
  npc('worker-ordinary', 'open-office', [-5.8, 0, -3.2], 0, 'typing', 0.3),
  npc('worker-phone', 'open-office', [-1.9, 0, -3.2], 0, 'phone-glance', 0.44),
  npc('worker-overachiever', 'open-office', [-5.8, 0, 1.5], 180, 'typing', 0.57),
  npc('worker-flatterer', 'open-office', [0.4, 0, 2.1], 30, 'flatterer-follow', 0.63),
  npc('meeting-attendee', 'meeting-room', [6.4, 0, -1.8], 90, 'meeting-nod', 0.71),
  npc('meeting-presenter', 'meeting-room', [7.8, 0, 2.5], 180, 'meeting-nod', 0.82),
  npc('pantry-guest', 'pantry', [-1.2, 0, 8.2], 0, 'drink-stir', 0.92),
  npc('boss', 'boss-office', [5.7, 0, 8.4], 180, 'boss-patrol', 0.12),
]);

