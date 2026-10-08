import assert from 'node:assert/strict';
import test from 'node:test';

import {
  OFFICE_FURNITURE,
  OFFICE_MIN_PASSAGE_WIDTH,
  OFFICE_UPPER_DIVIDER_SEGMENTS,
  upperDividerLeavesPassage,
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

test('the meeting room uses one transparent glass boundary', () => {
  const glass = OFFICE_FURNITURE.filter(({ name }) => name === 'MeetingGlassBoundary');
  assert.equal(glass.length, 1);
  assert.equal(glass[0].transparent, true);
});

test('every zone rewards close inspection with a mobile-safe detail budget', () => {
  const smallProps = OFFICE_FURNITURE.filter(({ smallProp }) => smallProp);
  assert.ok(smallProps.length >= 90, `expected at least 90 close-up details, received ${smallProps.length}`);
  assert.ok(smallProps.length <= 140, `detail budget exceeded: ${smallProps.length}`);
  for (const zone of OFFICE_ZONES) {
    const count = officeFurnitureForZone(zone.id).filter(({ smallProp }) => smallProp).length;
    assert.ok(count >= 4, `${zone.id} needs at least four close-up details, received ${count}`);
  }
});

test('open-office close-ups reveal complete desk equipment and four comic personas', () => {
  const openOffice = officeFurnitureForZone('open-office');
  const names = new Set(openOffice.map(({ name }) => name));
  assert.equal(openOffice.filter(({ name }) => name.startsWith('Keyboard')).length, 12);
  assert.equal(openOffice.filter(({ name }) => name.startsWith('MonitorScreen')).length, 12);
  for (const name of [
    'PersonaNormalNotebook',
    'PersonaSlackerPhone',
    'PersonaGrinderFile3',
    'PersonaFlattererFrame',
  ]) {
    assert.ok(names.has(name), `open-office missing personality detail ${name}`);
  }
});

test('close-up furniture has readable silhouettes and lightweight contact shadows', () => {
  const openOffice = officeFurnitureForZone('open-office');
  assert.equal(openOffice.filter(({ name }) => name.startsWith('ChairBack')).length, 12);
  assert.equal(openOffice.filter(({ name }) => name.startsWith('MonitorStand')).length, 12);
  const contactShadows = OFFICE_FURNITURE.filter(({ name }) => name.startsWith('ContactShadow'));
  assert.ok(contactShadows.length >= 18, `expected at least 18 contact shadows, received ${contactShadows.length}`);
  assert.equal(contactShadows.every(({ transparent }) => transparent), true);
});

test('the upper divider leaves connected entrances for staff areas and the main aisle', () => {
  assert.equal(OFFICE_UPPER_DIVIDER_SEGMENTS.length, 4);
  for (const entranceX of [-6.5, -1, 2.9]) {
    assert.equal(
      upperDividerLeavesPassage(entranceX, OFFICE_MIN_PASSAGE_WIDTH),
      true,
      `divider blocks the entrance at x=${entranceX}`,
    );
  }
  assert.equal(upperDividerLeavesPassage(0.9, OFFICE_MIN_PASSAGE_WIDTH), false);
});

