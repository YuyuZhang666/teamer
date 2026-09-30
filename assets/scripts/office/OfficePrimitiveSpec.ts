import type { OfficePaletteKey } from './OfficePalette.ts';

export type OfficePrimitiveKind = 'box' | 'cylinder' | 'sphere';
export type OfficeTuple3 = readonly [number, number, number];

export interface OfficePrimitiveSpecInput {
  readonly kind: OfficePrimitiveKind;
  readonly name: string;
  readonly position: OfficeTuple3;
  readonly scale: OfficeTuple3;
  readonly rotation?: OfficeTuple3;
  readonly color: OfficePaletteKey;
  readonly transparent?: boolean;
}

export interface OfficePrimitiveSpec extends OfficePrimitiveSpecInput {
  readonly rotation: OfficeTuple3;
  readonly transparent: boolean;
}

export function officeMaterialCacheKey(color: OfficePaletteKey, transparent: boolean): string {
  return `${color}:${transparent ? 'transparent' : 'opaque'}`;
}

export function createOfficePrimitiveSpec(input: OfficePrimitiveSpecInput): Readonly<OfficePrimitiveSpec> {
  if (!input.name.trim()) throw new Error('primitive name must not be empty');
  if (input.scale.some((dimension) => !Number.isFinite(dimension) || dimension <= 0)) {
    throw new Error(`primitive scale must be finite and positive: ${input.name}`);
  }
  const position = Object.freeze([...input.position]) as OfficeTuple3;
  const scale = Object.freeze([...input.scale]) as OfficeTuple3;
  const rotation = Object.freeze([...(input.rotation ?? [0, 0, 0])]) as OfficeTuple3;
  return Object.freeze({
    kind: input.kind,
    name: input.name.trim(),
    position,
    scale,
    rotation,
    color: input.color,
    transparent: input.transparent ?? false,
  });
}

