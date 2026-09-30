import type { Node } from 'cc';
import { OfficeNpcFactory, type OfficeNpcVariant } from '../../assets/scripts/office/OfficeNpcFactory.ts';
import { OfficeNpcMotion } from '../../assets/scripts/office/OfficeNpcMotion.ts';
import type { OfficeNpcPlacement } from '../../assets/scripts/office/OfficeNpcPlan.ts';

export function createNpcContract(
  factory: OfficeNpcFactory,
  parent: Node,
  placement: OfficeNpcPlacement,
  variant: OfficeNpcVariant,
): Node {
  const npc = factory.create(parent, placement, variant);
  npc.getComponent(OfficeNpcMotion)?.configure(placement.motion, placement.phaseOffset);
  return npc;
}

