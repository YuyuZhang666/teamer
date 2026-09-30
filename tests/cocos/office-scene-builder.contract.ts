import type { Node } from 'cc';
import {
  OfficeSceneBuilder,
  type OfficeSceneHandles,
} from '../../assets/scripts/office/OfficeSceneBuilder.ts';

export function buildOfficeContract(builder: OfficeSceneBuilder, parent: Node): OfficeSceneHandles {
  const handles = builder.build(parent);
  handles.cameraAnchor.name;
  handles.introAnchors.settle.name;
  handles.npcRoot.name;
  handles.npcAnchors['open-office'].name;
  handles.world.name;
  return handles;
}

