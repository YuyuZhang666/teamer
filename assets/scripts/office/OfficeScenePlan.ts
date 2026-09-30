import type { OfficeZoneId } from './OfficeLayout.ts';
import type { OfficePaletteKey } from './OfficePalette.ts';
import {
  createOfficePrimitiveSpec,
  type OfficePrimitiveKind,
  type OfficePrimitiveSpec,
  type OfficeTuple3,
} from './OfficePrimitiveSpec.ts';

export type OfficeFurnitureRole =
  | 'architecture'
  | 'desk'
  | 'chair'
  | 'monitor'
  | 'storage'
  | 'appliance'
  | 'prop'
  | 'plant';

export interface OfficeFurnitureItem extends OfficePrimitiveSpec {
  readonly zone: OfficeZoneId;
  readonly role: OfficeFurnitureRole;
  readonly smallProp: boolean;
}

export const OFFICE_MIN_PASSAGE_WIDTH = 1.8;

const furniture: OfficeFurnitureItem[] = [];

function add(
  zone: OfficeZoneId,
  role: OfficeFurnitureRole,
  kind: OfficePrimitiveKind,
  name: string,
  position: OfficeTuple3,
  scale: OfficeTuple3,
  color: OfficePaletteKey,
  options: { rotation?: OfficeTuple3; transparent?: boolean; smallProp?: boolean } = {},
): void {
  const primitive = createOfficePrimitiveSpec({
    kind,
    name,
    position,
    scale,
    color,
    rotation: options.rotation,
    transparent: options.transparent,
  });
  furniture.push(Object.freeze({
    ...primitive,
    zone,
    role,
    smallProp: options.smallProp ?? false,
  }));
}

// Elevator and entrance threshold.
add('elevator', 'architecture', 'box', 'ElevatorDoorLeft', [-7.65, 1.35, -11.65], [1.8, 2.7, 0.12], 'blueGray');
add('elevator', 'architecture', 'box', 'ElevatorDoorRight', [-5.35, 1.35, -11.65], [1.8, 2.7, 0.12], 'blueGray');
add('elevator', 'prop', 'box', 'FloorDisplay', [-6.5, 2.95, -11.55], [1.15, 0.35, 0.12], 'ink');
add('elevator', 'prop', 'box', 'CallButton', [-4.25, 1.25, -11.5], [0.22, 0.42, 0.12], 'yellow');

// Reception, waiting area and parcels.
add('reception', 'desk', 'box', 'ReceptionDesk', [1.4, 0.65, -9.15], [4.1, 1.3, 0.95], 'wood');
add('reception', 'architecture', 'box', 'LogoWall', [2.5, 1.65, -11.7], [5.4, 1.45, 0.16], 'wall');
add('reception', 'architecture', 'box', 'GateLeft', [-1.5, 0.55, -7.65], [0.22, 1.1, 1.4], 'brand');
add('reception', 'architecture', 'box', 'GateRight', [0.1, 0.55, -7.65], [0.22, 1.1, 1.4], 'brand');
add('reception', 'chair', 'box', 'WaitingSofa', [6.25, 0.45, -9.2], [2.9, 0.55, 1.15], 'blueGray');
add('reception', 'chair', 'box', 'WaitingSofaBack', [6.25, 0.95, -9.72], [2.9, 1.05, 0.18], 'blueGray');
add('reception', 'prop', 'box', 'ParcelBox1', [-1.7, 0.3, -10.8], [0.65, 0.6, 0.62], 'yellow', { smallProp: true });
add('reception', 'prop', 'box', 'ParcelBox2', [-0.95, 0.24, -10.9], [0.55, 0.48, 0.5], 'coral', { smallProp: true });
add('reception', 'prop', 'box', 'ParcelBox3', [-1.35, 0.75, -10.85], [0.5, 0.42, 0.48], 'wood', { smallProp: true });

// Twelve readable desks arranged as three four-seat islands; the right aisle remains clear.
const islandCenters: readonly OfficeTuple3[] = [
  [-6.1, 0, -3.8],
  [-2.7, 0, -0.2],
  [-6.1, 0, 3.1],
];
let deskIndex = 0;
for (const [centerX, , centerZ] of islandCenters) {
  for (const offsetX of [-0.75, 0.75]) {
    for (const offsetZ of [-0.68, 0.68]) {
      deskIndex += 1;
      const x = centerX + offsetX;
      const z = centerZ + offsetZ;
      const facesNorth = offsetZ < 0;
      add('open-office', 'desk', 'box', `Desk${deskIndex}`, [x, 0.78, z], [1.35, 0.12, 0.78], 'wood');
      add('open-office', 'chair', 'box', `Chair${deskIndex}`, [x, 0.47, z + (facesNorth ? -0.75 : 0.75)], [0.62, 0.66, 0.62], deskIndex === 6 ? 'coral' : 'blueGray');
      add('open-office', 'monitor', 'box', `Monitor${deskIndex}`, [x, 1.22, z + (facesNorth ? 0.16 : -0.16)], [0.7, 0.48, 0.09], deskIndex === 5 ? 'yellow' : 'ink', { smallProp: true });
    }
  }
}
add('open-office', 'appliance', 'box', 'Printer', [1.55, 0.67, 3.55], [1.15, 1.34, 0.95], 'white');
add('open-office', 'storage', 'box', 'FilingCabinet', [2.85, 0.9, 3.65], [0.95, 1.8, 0.7], 'blueGray');
for (let index = 1; index <= 4; index += 1) {
  add('open-office', 'prop', 'box', `DeskFile${index}`, [-7.1 + index * 1.25, 0.94, 3.72], [0.3, 0.12, 0.42], index % 2 ? 'yellow' : 'coral', { smallProp: true });
  add('open-office', 'prop', 'cylinder', `DeskCup${index}`, [-7.05 + index * 1.25, 1.0, -3.42], [0.16, 0.32, 0.16], index % 2 ? 'brand' : 'mint', { smallProp: true });
}

// Meeting room.
add('meeting-room', 'desk', 'box', 'MeetingTable', [6.55, 0.76, -0.45], [2.2, 0.16, 4.9], 'wood');
for (let index = 1; index <= 8; index += 1) {
  const leftSide = index <= 4;
  const row = (index - 1) % 4;
  add('meeting-room', 'chair', 'box', `MeetingChair${index}`, [leftSide ? 5.05 : 8.05, 0.48, -2.7 + row * 1.5], [0.65, 0.72, 0.62], 'blueGray');
}
add('meeting-room', 'architecture', 'box', 'MeetingScreen', [8.82, 1.7, 2.8], [0.14, 2.2, 3.1], 'brand');
add('meeting-room', 'architecture', 'box', 'Whiteboard', [6.65, 1.65, 4.82], [3.1, 1.8, 0.12], 'white');
add('meeting-room', 'architecture', 'box', 'MeetingGlassBoundary', [4.08, 1.35, -0.5], [0.08, 2.7, 10.8], 'glass', { transparent: true });

// Boss office.
add('boss-office', 'desk', 'box', 'BossDesk', [5.55, 0.82, 9.25], [3.5, 0.18, 1.4], 'walnut');
add('boss-office', 'chair', 'box', 'BossChair', [5.55, 0.65, 10.45], [1.05, 1.3, 0.95], 'ink');
add('boss-office', 'storage', 'box', 'BossBookcase', [8.25, 1.4, 10.8], [1.1, 2.8, 1.4], 'walnut');
add('boss-office', 'chair', 'box', 'BossSofa', [3.35, 0.48, 7.15], [2.3, 0.72, 1.05], 'coral');
add('boss-office', 'prop', 'cylinder', 'BossTrophy', [8.25, 3.0, 10.8], [0.3, 0.6, 0.3], 'yellow');

// Pantry.
add('pantry', 'storage', 'box', 'PantryCounter', [-1.0, 0.55, 11.2], [5.4, 1.1, 0.75], 'mint');
add('pantry', 'appliance', 'box', 'Fridge', [-3.25, 1.2, 9.6], [1.25, 2.4, 1.05], 'white');
add('pantry', 'appliance', 'box', 'Microwave', [-1.65, 1.35, 11.0], [1.05, 0.65, 0.62], 'ink');
add('pantry', 'appliance', 'box', 'CoffeeMachine', [0.15, 1.35, 11.0], [0.7, 0.8, 0.62], 'brand');
add('pantry', 'desk', 'cylinder', 'RoundTable', [-0.25, 0.7, 7.5], [2.0, 0.14, 2.0], 'wood');

// Restroom threshold and recovery corner.
add('break-area', 'architecture', 'box', 'RestroomDoorWomen', [-8.1, 1.35, 11.65], [1.35, 2.7, 0.12], 'coral');
add('break-area', 'architecture', 'box', 'RestroomDoorMen', [-6.45, 1.35, 11.65], [1.35, 2.7, 0.12], 'brand');
add('break-area', 'appliance', 'box', 'Sink', [-4.55, 0.75, 10.9], [1.0, 1.1, 0.7], 'white');
add('break-area', 'chair', 'box', 'BreakBench', [-7.1, 0.45, 6.25], [2.3, 0.55, 0.72], 'wood');
add('break-area', 'appliance', 'box', 'VendingMachine', [-4.7, 1.25, 7.1], [1.15, 2.5, 0.95], 'coral');

// A few large plants create readable area breaks without consuming the small-prop budget.
for (const [index, plant] of [
  ['Reception', [7.8, 0, -10.8]],
  ['Office', [2.8, 0, -5.7]],
  ['Meeting', [8.4, 0, 4.1]],
  ['Boss', [2.5, 0, 11.0]],
  ['Pantry', [1.5, 0, 6.1]],
] as const) {
  const zone: OfficeZoneId = index === 'Reception'
    ? 'reception'
    : index === 'Office'
      ? 'open-office'
      : index === 'Meeting'
        ? 'meeting-room'
        : index === 'Boss'
          ? 'boss-office'
          : 'pantry';
  add(zone, 'plant', 'cylinder', `${index}PlantPot`, [plant[0], 0.35, plant[2]], [0.5, 0.7, 0.5], 'walnut');
  add(zone, 'plant', 'sphere', `${index}PlantLeaves`, [plant[0], 1.05, plant[2]], [1.0, 1.35, 1.0], 'plant');
}

export const OFFICE_FURNITURE: readonly Readonly<OfficeFurnitureItem>[] = Object.freeze(furniture);

export function officeFurnitureForZone(zone: OfficeZoneId | string): readonly Readonly<OfficeFurnitureItem>[] {
  return OFFICE_FURNITURE.filter((item) => item.zone === zone);
}

