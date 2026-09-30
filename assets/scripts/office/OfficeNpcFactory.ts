import { Node, Vec3 } from 'cc';
import type { OfficePaletteKey } from './OfficePalette.ts';
import { OfficePrimitiveFactory } from './OfficePrimitiveFactory.ts';
import type { OfficeNpcPlacement } from './OfficeNpcPlan.ts';
import { OfficeNpcMotion } from './OfficeNpcMotion.ts';

export interface OfficeNpcVariant {
  readonly shirt: OfficePaletteKey;
  readonly trousers: OfficePaletteKey;
  readonly hair: OfficePaletteKey;
  readonly accent: OfficePaletteKey;
}

export const OFFICE_NPC_VARIANTS: readonly Readonly<OfficeNpcVariant>[] = Object.freeze([
  Object.freeze({ shirt: 'brand', trousers: 'ink', hair: 'ink', accent: 'yellow' }),
  Object.freeze({ shirt: 'coral', trousers: 'blueGray', hair: 'walnut', accent: 'white' }),
  Object.freeze({ shirt: 'mint', trousers: 'ink', hair: 'ink', accent: 'coral' }),
  Object.freeze({ shirt: 'yellow', trousers: 'walnut', hair: 'walnut', accent: 'brand' }),
  Object.freeze({ shirt: 'blueGray', trousers: 'ink', hair: 'ink', accent: 'mint' }),
]);

/** Creates replaceable low-poly characters on a stable NPC root. */
export class OfficeNpcFactory {
  constructor(private readonly primitive = new OfficePrimitiveFactory()) {}

  variantFor(index: number): Readonly<OfficeNpcVariant> {
    const safeIndex = Math.abs(Math.trunc(index)) % OFFICE_NPC_VARIANTS.length;
    return OFFICE_NPC_VARIANTS[safeIndex];
  }

  create(parent: Node, placement: Readonly<OfficeNpcPlacement>, variant: Readonly<OfficeNpcVariant>): Node {
    const root = this.primitive.createGroup(
      `Npc-${placement.id}`,
      parent,
      new Vec3(...placement.position),
      new Vec3(0, placement.yaw, 0),
    );
    const visual = this.primitive.createGroup('Visual', root);
    this.primitive.createBox({
      name: 'Torso',
      parent: visual,
      position: new Vec3(0, 1.18, 0),
      scale: new Vec3(0.62, 0.78, 0.36),
      color: variant.shirt,
    });
    this.primitive.createSphere({
      name: 'Head',
      parent: visual,
      position: new Vec3(0, 1.86, 0),
      scale: new Vec3(0.46, 0.5, 0.46),
      color: 'skin',
    });
    this.primitive.createSphere({
      name: 'Hair',
      parent: visual,
      position: new Vec3(0, 2.04, -0.02),
      scale: new Vec3(0.48, 0.28, 0.47),
      color: variant.hair,
    });
    for (const side of [-1, 1]) {
      this.primitive.createBox({
        name: side < 0 ? 'ArmLeft' : 'ArmRight',
        parent: visual,
        position: new Vec3(side * 0.43, 1.14, 0),
        scale: new Vec3(0.17, 0.68, 0.18),
        color: variant.shirt,
      });
      this.primitive.createBox({
        name: side < 0 ? 'LegLeft' : 'LegRight',
        parent: visual,
        position: new Vec3(side * 0.19, 0.43, 0),
        scale: new Vec3(0.2, 0.72, 0.24),
        color: variant.trousers,
      });
    }
    this.primitive.createBox({
      name: 'Badge',
      parent: visual,
      position: new Vec3(0.19, 1.3, -0.19),
      scale: new Vec3(0.18, 0.13, 0.04),
      color: variant.accent,
    });
    const motion = root.addComponent(OfficeNpcMotion);
    motion.configure(placement.motion, placement.phaseOffset);
    return root;
  }
}

