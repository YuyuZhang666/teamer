export type OfficeZoneId =
  | 'elevator'
  | 'reception'
  | 'open-office'
  | 'meeting-room'
  | 'break-area'
  | 'pantry'
  | 'boss-office';

export interface OfficeRect {
  readonly centerX: number;
  readonly centerZ: number;
  readonly width: number;
  readonly depth: number;
}

export interface OfficeZone {
  readonly id: OfficeZoneId;
  readonly label: string;
  readonly rect: OfficeRect;
  readonly floor: 'lobby' | 'work' | 'meeting' | 'wood' | 'pantry' | 'break';
}

export interface OfficeBounds {
  readonly width: number;
  readonly depth: number;
}

export const OFFICE_BOUNDS: Readonly<OfficeBounds> = Object.freeze({ width: 18, depth: 24 });

const zone = (
  id: OfficeZoneId,
  label: string,
  floor: OfficeZone['floor'],
  centerX: number,
  centerZ: number,
  width: number,
  depth: number,
): Readonly<OfficeZone> => Object.freeze({
  id,
  label,
  floor,
  rect: Object.freeze({ centerX, centerZ, width, depth }),
});

export const OFFICE_ZONES: readonly Readonly<OfficeZone>[] = Object.freeze([
  zone('elevator', '电梯', 'lobby', -6.5, -9.5, 5, 5),
  zone('reception', '公司入口 / 前台', 'lobby', 2.5, -9.5, 11, 5),
  zone('open-office', '开放办公区', 'work', -2.5, -1, 13, 12),
  zone('meeting-room', '会议室', 'meeting', 6.5, -0.5, 5, 11),
  zone('break-area', '厕所 / 摸鱼区', 'break', -6.5, 8.5, 5, 7),
  zone('pantry', '茶水间', 'pantry', -1, 8.5, 6, 7),
  zone('boss-office', '老板办公室', 'wood', 5.5, 8.5, 7, 7),
]);

export function findOfficeZone(id: OfficeZoneId): Readonly<OfficeZone> | undefined {
  return OFFICE_ZONES.find((candidate) => candidate.id === id);
}

export function validateOfficeLayout(
  zones: readonly Readonly<OfficeZone>[] = OFFICE_ZONES,
  bounds: Readonly<OfficeBounds> = OFFICE_BOUNDS,
): readonly string[] {
  const errors: string[] = [];
  const ids = new Set<OfficeZoneId>();
  const halfWidth = bounds.width / 2;
  const halfDepth = bounds.depth / 2;

  for (const candidate of zones) {
    if (ids.has(candidate.id)) errors.push(`duplicate zone id: ${candidate.id}`);
    ids.add(candidate.id);
    const { centerX, centerZ, width, depth } = candidate.rect;
    if (width <= 0 || depth <= 0) errors.push(`non-positive zone size: ${candidate.id}`);
    if (
      centerX - width / 2 < -halfWidth
      || centerX + width / 2 > halfWidth
      || centerZ - depth / 2 < -halfDepth
      || centerZ + depth / 2 > halfDepth
    ) {
      errors.push(`outside office bounds: ${candidate.id}`);
    }
  }

  for (let leftIndex = 0; leftIndex < zones.length; leftIndex += 1) {
    const left = zones[leftIndex];
    for (let rightIndex = leftIndex + 1; rightIndex < zones.length; rightIndex += 1) {
      const right = zones[rightIndex];
      const overlapX = Math.min(
        left.rect.centerX + left.rect.width / 2,
        right.rect.centerX + right.rect.width / 2,
      ) - Math.max(
        left.rect.centerX - left.rect.width / 2,
        right.rect.centerX - right.rect.width / 2,
      );
      const overlapZ = Math.min(
        left.rect.centerZ + left.rect.depth / 2,
        right.rect.centerZ + right.rect.depth / 2,
      ) - Math.max(
        left.rect.centerZ - left.rect.depth / 2,
        right.rect.centerZ - right.rect.depth / 2,
      );
      if (overlapX > 0 && overlapZ > 0) errors.push(`overlap: ${left.id}/${right.id}`);
    }
  }

  return Object.freeze(errors);
}

