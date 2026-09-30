import assert from 'node:assert/strict';
import test from 'node:test';

import {
  OFFICE_FURNITURE,
  OFFICE_MIN_PASSAGE_WIDTH,
  officeFurnitureForZone,
} from '../assets/scripts/office/OfficeScenePlan.ts';
import { OFFICE_ZONES } from '../assets/scripts/office/OfficeLayout.ts';

const requiredNames = {
  elevator: ['ElevatorDoorLeft', 'ElevatorDoorRight', 'FloorDisplay', 'CallButton'],
  reception: ['ReceptionDesk', 'LogoWall', 'GateLeft', 'GateRight', 'WaitingSofa', 'ParcelBox1'],
  'open-office': ['Desk1', 'Desk12', 'Chair1', 'Chair12', 'Monitor1', 'Monitor12', 'Printer'],
  'meeting-room': ['MeetingTable', 'MeetingChair1', 'MeetingChair8', 'MeetingScreen', 'Whiteboard', 'MeetingGlassBoundary'],
  'boss-office': ['BossDesk', 'BossChair', 'BossBookcase', 'BossSofa'],
  pantry: ['PantryCounter', 'Fridge', 'Microwave', 'CoffeeMachine', 'RoundTable'],
  'break-area': ['RestroomDoorWomen', 'RestroomDoorMen', 'Sink', 'BreakBench', 'VendingMachine'],
};

test('the scene plan gives every approved zone its recognisable P0 furniture', () => {
  assert.equal(OFFICE_MIN_PASSAGE_WIDTH, 1.8);
  assert.deepEqual(
    new Set(OFFICE_FURNITURE.map(({ zone }) => zone)),
    new Set(OFFICE_ZONES.map(({ id }) => id)),
  );

  for (const [zone, names] of Object.entries(requiredNames)) {
    const actual = new Set(officeFurnitureForZone(zone).map(({ name }) => name));
    for (const name of names) assert.ok(actual.has(name), `${zone} missing ${name}`);
  }
});

test('the open office contains exactly twelve desks, chairs and monitors', () => {
  const openOffice = officeFurnitureForZone('open-office');
  assert.equal(openOffice.filter(({ role }) => role === 'desk').length, 12);
  assert.equal(openOffice.filter(({ role }) => role === 'chair').length, 12);
  assert.equal(openOffice.filter(({ role }) => role === 'monitor').length, 12);
});

test('the meeting room uses one transparent glass boundary and the prop budget stays restrained', () => {
  const glass = OFFICE_FURNITURE.filter(({ name }) => name === 'MeetingGlassBoundary');
  assert.equal(glass.length, 1);
  assert.equal(glass[0].transparent, true);
  assert.ok(OFFICE_FURNITURE.filter(({ smallProp }) => smallProp).length <= 24);
});

