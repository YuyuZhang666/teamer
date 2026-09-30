import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createOfficePrimitiveSpec,
  officeMaterialCacheKey,
} from '../assets/scripts/office/OfficePrimitiveSpec.ts';

test('a primitive spec freezes validated transform and material inputs', () => {
  const spec = createOfficePrimitiveSpec({
    kind: 'box',
    name: 'ReceptionDesk',
    position: [1, 0.5, -2],
    scale: [3, 1, 0.8],
    color: 'wood',
  });

  assert.deepEqual(spec, {
    kind: 'box',
    name: 'ReceptionDesk',
    position: [1, 0.5, -2],
    scale: [3, 1, 0.8],
    rotation: [0, 0, 0],
    color: 'wood',
    transparent: false,
  });
  assert.equal(Object.isFrozen(spec), true);
  assert.equal(Object.isFrozen(spec.position), true);
  assert.equal(Object.isFrozen(spec.scale), true);
});

test('primitive specs reject empty names and non-positive dimensions', () => {
  assert.throws(
    () => createOfficePrimitiveSpec({
      kind: 'box',
      name: '   ',
      position: [0, 0, 0],
      scale: [1, 1, 1],
      color: 'wall',
    }),
    /name/i,
  );
  assert.throws(
    () => createOfficePrimitiveSpec({
      kind: 'sphere',
      name: 'Plant',
      position: [0, 0, 0],
      scale: [1, 0, 1],
      color: 'plant',
    }),
    /scale/i,
  );
});

test('material cache keys separate transparent and opaque variants', () => {
  assert.equal(officeMaterialCacheKey('brand', false), 'brand:opaque');
  assert.equal(officeMaterialCacheKey('glass', true), 'glass:transparent');
});

