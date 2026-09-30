import { color, DirectionalLight, Node, Vec3 } from 'cc';
import {
  OFFICE_BOUNDS,
  OFFICE_ZONES,
  type OfficeZoneId,
} from './OfficeLayout.ts';
import type { OfficePaletteKey } from './OfficePalette.ts';
import { OfficePrimitiveFactory } from './OfficePrimitiveFactory.ts';
import { OFFICE_FURNITURE, type OfficeFurnitureItem } from './OfficeScenePlan.ts';
import type { OfficeIntroShotId } from './OfficeIntroTimeline.ts';

export interface OfficeSceneHandles {
  readonly world: Node;
  readonly cameraAnchor: Node;
  readonly introAnchors: Readonly<Record<OfficeIntroShotId, Node>>;
  readonly npcRoot: Node;
  readonly npcAnchors: Readonly<Record<OfficeZoneId, Node>>;
}

const FLOOR_COLORS: Readonly<Record<string, OfficePaletteKey>> = Object.freeze({
  lobby: 'wall',
  work: 'floor',
  meeting: 'blueGray',
  wood: 'wood',
  pantry: 'mint',
  break: 'white',
});

/** Builds the mobile-friendly cutaway office from tested data plans. */
export class OfficeSceneBuilder {
  constructor(private readonly primitive = new OfficePrimitiveFactory()) {}

  build(parent: Node): OfficeSceneHandles {
    const world = this.primitive.createGroup('OfficeWorld', parent);
    this.buildLighting(world);
    this.buildShell(world);
    const zoneRoot = this.primitive.createGroup('Zones', world);
    const npcAnchors = this.buildZones(zoneRoot);
    this.buildFurniture(world);
    const npcRoot = this.primitive.createGroup('NpcRoot', world);
    const { cameraAnchor, introAnchors } = this.buildCameraAnchors(world);

    return Object.freeze({
      world,
      cameraAnchor,
      introAnchors: Object.freeze(introAnchors),
      npcRoot,
      npcAnchors: Object.freeze(npcAnchors),
    });
  }

  private buildLighting(parent: Node): void {
    const lightNode = new Node('SunLight');
    parent.addChild(lightNode);
    lightNode.setRotationFromEuler(-55, -35, 0);
    const light = lightNode.addComponent(DirectionalLight);
    light.color = color('#FFF1D6');
    light.illuminance = 48000;
  }

  private buildShell(parent: Node): void {
    const shell = this.primitive.createGroup('Shell', parent);
    this.primitive.createBox({
      name: 'OfficeBase',
      parent: shell,
      position: new Vec3(0, -0.2, 0),
      scale: new Vec3(OFFICE_BOUNDS.width + 0.5, 0.4, OFFICE_BOUNDS.depth + 0.5),
      color: 'floor',
    });
    this.primitive.createBox({
      name: 'BackWall',
      parent: shell,
      position: new Vec3(0, 1.5, 11.9),
      scale: new Vec3(18.4, 3.0, 0.24),
      color: 'wall',
    });
    this.primitive.createBox({
      name: 'LeftWall',
      parent: shell,
      position: new Vec3(-8.9, 1.5, 0),
      scale: new Vec3(0.24, 3.0, 24),
      color: 'wall',
    });
    this.primitive.createBox({
      name: 'RightWall',
      parent: shell,
      position: new Vec3(8.9, 1.5, 5.7),
      scale: new Vec3(0.24, 3.0, 12.4),
      color: 'wall',
    });
    this.primitive.createBox({
      name: 'MainAisle',
      parent: shell,
      position: new Vec3(2.9, -0.015, -1.0),
      scale: new Vec3(1.85, 0.05, 12),
      color: 'wall',
    });
    this.primitive.createBox({
      name: 'UpperBandDivider',
      parent: shell,
      position: new Vec3(0, 0.55, 5.02),
      scale: new Vec3(18, 1.1, 0.14),
      color: 'wall',
    });
    this.primitive.createBox({
      name: 'MeetingDivider',
      parent: shell,
      position: new Vec3(4.02, 0.55, -0.6),
      scale: new Vec3(0.14, 1.1, 10.9),
      color: 'blueGray',
    });
  }

  private buildZones(parent: Node): Record<OfficeZoneId, Node> {
    const anchors = {} as Record<OfficeZoneId, Node>;
    for (const zone of OFFICE_ZONES) {
      const zoneNode = this.primitive.createGroup(`Zone-${zone.id}`, parent);
      this.primitive.createBox({
        name: `${zone.id}-FloorInset`,
        parent: zoneNode,
        position: new Vec3(zone.rect.centerX, -0.015, zone.rect.centerZ),
        scale: new Vec3(zone.rect.width - 0.14, 0.05, zone.rect.depth - 0.14),
        color: FLOOR_COLORS[zone.floor],
      });
      const anchor = this.primitive.createGroup(
        `NpcAnchor-${zone.id}`,
        zoneNode,
        new Vec3(zone.rect.centerX, 0, zone.rect.centerZ),
      );
      anchors[zone.id] = anchor;
    }
    return anchors;
  }

  private buildFurniture(parent: Node): void {
    const furnitureRoot = this.primitive.createGroup('Furniture', parent);
    for (const item of OFFICE_FURNITURE) this.createFurnitureItem(furnitureRoot, item);
  }

  private createFurnitureItem(parent: Node, item: Readonly<OfficeFurnitureItem>): Node {
    const options = {
      name: item.name,
      parent,
      position: new Vec3(...item.position),
      scale: new Vec3(...item.scale),
      rotation: new Vec3(...item.rotation),
      color: item.color,
      transparent: item.transparent,
    };
    if (item.kind === 'cylinder') return this.primitive.createCylinder(options);
    if (item.kind === 'sphere') return this.primitive.createSphere(options);
    return this.primitive.createBox(options);
  }

  private buildCameraAnchors(parent: Node): {
    cameraAnchor: Node;
    introAnchors: Record<OfficeIntroShotId, Node>;
  } {
    const anchorsRoot = this.primitive.createGroup('CameraAnchors', parent);
    const definitions: Readonly<Record<OfficeIntroShotId, readonly [number, number, number]>> = Object.freeze({
      elevator: [-9.5, 7.5, -16.5],
      reception: [11.5, 10.5, -17.5],
      'open-office': [14.5, 17.5, -14.5],
      overview: [7, 25, -31],
      settle: [8, 23, -30],
    });
    const introAnchors = {} as Record<OfficeIntroShotId, Node>;
    for (const shotId of Object.keys(definitions) as OfficeIntroShotId[]) {
      introAnchors[shotId] = this.primitive.createGroup(
        `Camera-${shotId}`,
        anchorsRoot,
        new Vec3(...definitions[shotId]),
      );
    }
    return { cameraAnchor: introAnchors.settle, introAnchors };
  }
}

