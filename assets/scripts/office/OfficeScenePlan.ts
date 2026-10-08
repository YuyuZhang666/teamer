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

export interface OfficeDividerSegment {
  readonly centerX: number;
  readonly width: number;
}

export const OFFICE_UPPER_DIVIDER_SEGMENTS: readonly Readonly<OfficeDividerSegment>[] = Object.freeze([
  Object.freeze({ centerX: -8.2, width: 1.6 }),
  Object.freeze({ centerX: -3.75, width: 3.7 }),
  Object.freeze({ centerX: 0.95, width: 2.1 }),
  Object.freeze({ centerX: 6.4, width: 5.2 }),
]);

export function upperDividerLeavesPassage(centerX: number, width: number): boolean {
  if (!Number.isFinite(centerX) || !Number.isFinite(width) || width <= 0) return false;
  const left = centerX - width / 2;
  const right = centerX + width / 2;
  const epsilon = 1e-9;
  return OFFICE_UPPER_DIVIDER_SEGMENTS.every((segment) => {
    const segmentLeft = segment.centerX - segment.width / 2;
    const segmentRight = segment.centerX + segment.width / 2;
    return segmentRight <= left + epsilon || segmentLeft >= right - epsilon;
  });
}

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
add('elevator', 'prop', 'cylinder', 'ElevatorIndicatorLeft', [-6.75, 2.96, -11.43], [0.16, 0.05, 0.16], 'yellow', { rotation: [90, 0, 0], smallProp: true });
add('elevator', 'prop', 'cylinder', 'ElevatorIndicatorRight', [-6.25, 2.96, -11.43], [0.16, 0.05, 0.16], 'coral', { rotation: [90, 0, 0], smallProp: true });
add('elevator', 'prop', 'box', 'AttendanceKioskScreen', [-3.6, 1.45, -11.48], [0.48, 0.62, 0.1], 'brand', { smallProp: true });
add('elevator', 'prop', 'box', 'AttendanceKioskLight', [-3.6, 1.68, -11.41], [0.24, 0.08, 0.04], 'mint', { smallProp: true });

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
add('reception', 'monitor', 'box', 'ReceptionMonitor', [1.25, 1.4, -9.18], [0.82, 0.58, 0.08], 'ink', { smallProp: true });
add('reception', 'prop', 'box', 'ReceptionMonitorScreen', [1.25, 1.4, -9.12], [0.69, 0.44, 0.025], 'brand', { smallProp: true });
add('reception', 'prop', 'box', 'ReceptionKeyboard', [1.25, 1.34, -8.83], [0.64, 0.05, 0.22], 'white', { smallProp: true });
add('reception', 'prop', 'box', 'VisitorRegister', [2.05, 1.34, -8.88], [0.46, 0.05, 0.32], 'yellow', { rotation: [0, 14, 0], smallProp: true });
add('reception', 'prop', 'sphere', 'ReceptionLuckyCatHead', [2.8, 1.58, -9.08], [0.36, 0.36, 0.36], 'white', { smallProp: true });
add('reception', 'prop', 'cylinder', 'ReceptionLuckyCatBody', [2.8, 1.39, -9.08], [0.32, 0.38, 0.32], 'coral', { smallProp: true });

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
      add('open-office', 'prop', 'box', `ChairBack${deskIndex}`, [x, 0.88, z + (facesNorth ? -1.02 : 1.02)], [0.62, 0.78, 0.14], deskIndex === 6 ? 'coral' : 'blueGray');
      add('open-office', 'monitor', 'box', `Monitor${deskIndex}`, [x, 1.22, z + (facesNorth ? 0.16 : -0.16)], [0.7, 0.48, 0.09], deskIndex === 5 ? 'yellow' : 'ink', { smallProp: true });
      add('open-office', 'prop', 'box', `MonitorStand${deskIndex}`, [x, 0.99, z + (facesNorth ? 0.16 : -0.16)], [0.1, 0.38, 0.1], 'ink', { smallProp: true });
      add('open-office', 'prop', 'box', `MonitorScreen${deskIndex}`, [x, 1.22, z + (facesNorth ? 0.105 : -0.105)], [0.59, 0.36, 0.025], deskIndex % 3 === 0 ? 'mint' : 'brand', { smallProp: true });
      add('open-office', 'prop', 'box', `Keyboard${deskIndex}`, [x, 0.875, z + (facesNorth ? -0.19 : 0.19)], [0.5, 0.05, 0.2], 'white', { smallProp: true });
      add('open-office', 'prop', 'box', `Mouse${deskIndex}`, [x + 0.43, 0.875, z + (facesNorth ? -0.18 : 0.18)], [0.13, 0.05, 0.17], deskIndex % 2 ? 'coral' : 'blueGray', { smallProp: true });
      add('open-office', 'prop', 'cylinder', `ContactShadowDesk${deskIndex}`, [x, 0.025, z], [1.55, 0.025, 1.28], 'shadow', { transparent: true });
    }
  }
}
add('open-office', 'prop', 'box', 'PersonaNormalNotebook', [-6.45, 0.89, -4.5], [0.34, 0.06, 0.42], 'mint', { rotation: [0, -8, 0], smallProp: true });
add('open-office', 'prop', 'box', 'PersonaSlackerPhone', [-3.12, 0.9, -0.9], [0.17, 0.05, 0.32], 'coral', { rotation: [0, 18, 0], smallProp: true });
add('open-office', 'prop', 'box', 'PersonaGrinderFile1', [-6.55, 0.95, 2.45], [0.42, 0.12, 0.32], 'yellow', { smallProp: true });
add('open-office', 'prop', 'box', 'PersonaGrinderFile2', [-6.55, 1.08, 2.45], [0.42, 0.12, 0.32], 'coral', { rotation: [0, 4, 0], smallProp: true });
add('open-office', 'prop', 'box', 'PersonaGrinderFile3', [-6.55, 1.21, 2.45], [0.42, 0.12, 0.32], 'brand', { rotation: [0, -4, 0], smallProp: true });
add('open-office', 'prop', 'box', 'PersonaFlattererFrame', [-5.02, 1.08, 3.55], [0.34, 0.4, 0.05], 'yellow', { rotation: [0, -8, 0], smallProp: true });
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
for (let index = 1; index <= 4; index += 1) {
  const z = -2.45 + (index - 1) * 1.5;
  add('meeting-room', 'prop', 'box', `MeetingLaptop${index}`, [6.52, 0.95, z], [0.72, 0.08, 0.5], index % 2 ? 'ink' : 'blueGray', { smallProp: true });
  add('meeting-room', 'prop', 'box', `MeetingNotepad${index}`, [7.15, 0.9, z], [0.28, 0.05, 0.42], index % 2 ? 'yellow' : 'mint', { rotation: [0, 8, 0], smallProp: true });
}
for (let index = 1; index <= 3; index += 1) {
  add('meeting-room', 'prop', 'box', `MeetingChartBar${index}`, [8.72, 1.0 + index * 0.31, 2.15 + index * 0.42], [0.04, 0.16 + index * 0.12, 0.24], index === 2 ? 'yellow' : 'white', { smallProp: true });
}
add('meeting-room', 'prop', 'box', 'WhiteboardGoal', [6.1, 1.82, 4.73], [0.56, 0.1, 0.035], 'brand', { smallProp: true });
add('meeting-room', 'prop', 'box', 'WhiteboardReview', [7.0, 1.48, 4.73], [0.48, 0.1, 0.035], 'coral', { smallProp: true });
add('meeting-room', 'prop', 'box', 'WhiteboardLoop', [6.55, 1.17, 4.73], [0.42, 0.1, 0.035], 'yellow', { smallProp: true });

// Boss office.
add('boss-office', 'desk', 'box', 'BossDesk', [5.55, 0.82, 9.25], [3.5, 0.18, 1.4], 'walnut');
add('boss-office', 'chair', 'box', 'BossChair', [5.55, 0.65, 10.45], [1.05, 1.3, 0.95], 'ink');
add('boss-office', 'storage', 'box', 'BossBookcase', [8.25, 1.4, 10.8], [1.1, 2.8, 1.4], 'walnut');
add('boss-office', 'chair', 'box', 'BossSofa', [3.35, 0.48, 7.15], [2.3, 0.72, 1.05], 'coral');
add('boss-office', 'prop', 'cylinder', 'BossTrophy', [8.25, 3.0, 10.8], [0.3, 0.6, 0.3], 'yellow');
add('boss-office', 'monitor', 'box', 'BossLaptop', [5.55, 1.06, 9.28], [0.85, 0.5, 0.08], 'ink', { smallProp: true });
add('boss-office', 'prop', 'box', 'BossLaptopScreen', [5.55, 1.06, 9.23], [0.7, 0.37, 0.025], 'brand', { smallProp: true });
add('boss-office', 'prop', 'cylinder', 'BossCeoMug', [6.55, 1.05, 9.22], [0.24, 0.4, 0.24], 'white', { smallProp: true });
add('boss-office', 'prop', 'box', 'BossBook1', [7.95, 1.05, 10.72], [0.62, 0.14, 0.42], 'brand', { smallProp: true });
add('boss-office', 'prop', 'box', 'BossBook2', [7.95, 1.2, 10.72], [0.62, 0.14, 0.42], 'coral', { rotation: [0, 5, 0], smallProp: true });
add('boss-office', 'prop', 'box', 'BossBook3', [7.95, 1.35, 10.72], [0.62, 0.14, 0.42], 'yellow', { rotation: [0, -4, 0], smallProp: true });
add('boss-office', 'prop', 'box', 'BossDeskPhone', [4.45, 1.0, 9.2], [0.42, 0.12, 0.28], 'blueGray', { rotation: [0, -12, 0], smallProp: true });
add('boss-office', 'prop', 'box', 'BossResultFrame', [7.95, 2.18, 10.72], [0.66, 0.5, 0.06], 'mint', { smallProp: true });

// Pantry.
add('pantry', 'storage', 'box', 'PantryCounter', [-1.0, 0.55, 11.2], [5.4, 1.1, 0.75], 'mint');
add('pantry', 'appliance', 'box', 'Fridge', [-3.25, 1.2, 9.6], [1.25, 2.4, 1.05], 'white');
add('pantry', 'appliance', 'box', 'Microwave', [-1.65, 1.35, 11.0], [1.05, 0.65, 0.62], 'ink');
add('pantry', 'appliance', 'box', 'CoffeeMachine', [0.15, 1.35, 11.0], [0.7, 0.8, 0.62], 'brand');
add('pantry', 'desk', 'cylinder', 'RoundTable', [-0.25, 0.7, 7.5], [2.0, 0.14, 2.0], 'wood');
for (let index = 1; index <= 3; index += 1) {
  add('pantry', 'prop', 'cylinder', `PantryCoffeeCup${index}`, [-0.75 + index * 0.45, 0.9, 7.5], [0.2, 0.34, 0.2], index === 2 ? 'coral' : 'white', { smallProp: true });
  add('pantry', 'prop', 'box', `FridgeNote${index}`, [-3.5 + index * 0.25, 1.35 + index * 0.28, 9.05], [0.2, 0.26, 0.035], index % 2 ? 'yellow' : 'coral', { rotation: [0, 0, index * 3], smallProp: true });
}
add('pantry', 'prop', 'cylinder', 'InstantNoodleCup', [-1.05, 1.25, 11.0], [0.3, 0.42, 0.3], 'yellow', { smallProp: true });
add('pantry', 'prop', 'box', 'PantrySnackBox', [0.85, 1.2, 11.0], [0.42, 0.5, 0.25], 'coral', { smallProp: true });

// Restroom threshold and recovery corner.
add('break-area', 'architecture', 'box', 'RestroomDoorWomen', [-8.1, 1.35, 11.65], [1.35, 2.7, 0.12], 'coral');
add('break-area', 'architecture', 'box', 'RestroomDoorMen', [-6.45, 1.35, 11.65], [1.35, 2.7, 0.12], 'brand');
add('break-area', 'appliance', 'box', 'Sink', [-4.55, 0.75, 10.9], [1.0, 1.1, 0.7], 'white');
add('break-area', 'chair', 'box', 'BreakBench', [-7.1, 0.45, 6.25], [2.3, 0.55, 0.72], 'wood');
add('break-area', 'appliance', 'box', 'VendingMachine', [-4.7, 1.25, 7.1], [1.15, 2.5, 0.95], 'coral');
for (let row = 0; row < 2; row += 1) {
  for (let column = 0; column < 3; column += 1) {
    const index = row * 3 + column + 1;
    add('break-area', 'prop', 'box', `VendingSlot${index}`, [-5.02 + column * 0.32, 1.72 - row * 0.42, 6.61], [0.22, 0.25, 0.035], index % 3 === 0 ? 'yellow' : index % 2 ? 'mint' : 'brand', { smallProp: true });
  }
}
add('break-area', 'prop', 'box', 'BreakAreaPhone', [-7.3, 0.78, 6.2], [0.18, 0.05, 0.34], 'ink', { rotation: [0, 18, 0], smallProp: true });
add('break-area', 'prop', 'cylinder', 'BreakAreaEnergyDrink', [-6.75, 0.88, 6.2], [0.18, 0.36, 0.18], 'brand', { smallProp: true });
add('break-area', 'prop', 'box', 'RestroomWomenSign', [-8.1, 2.05, 11.56], [0.34, 0.5, 0.04], 'white', { smallProp: true });
add('break-area', 'prop', 'box', 'RestroomMenSign', [-6.45, 2.05, 11.56], [0.34, 0.5, 0.04], 'white', { smallProp: true });

for (const [name, zone, x, z, width, depth] of [
  ['Reception', 'reception', 1.4, -9.15, 4.4, 1.35],
  ['MeetingTable', 'meeting-room', 6.55, -0.45, 2.65, 5.2],
  ['BossDesk', 'boss-office', 5.55, 9.25, 3.85, 1.75],
  ['BossSofa', 'boss-office', 3.35, 7.15, 2.55, 1.35],
  ['PantryTable', 'pantry', -0.25, 7.5, 2.35, 2.35],
  ['Vending', 'break-area', -4.7, 7.1, 1.45, 1.2],
  ['BreakBench', 'break-area', -7.1, 6.25, 2.55, 1.0],
  ['Fridge', 'pantry', -3.25, 9.6, 1.5, 1.3],
] as const) {
  add(zone, 'prop', 'cylinder', `ContactShadow${name}`, [x, 0.025, z], [width, 0.025, depth], 'shadow', { transparent: true });
}

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

