import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const buildConfig = JSON.parse(
  await readFile(new URL('../scripts/build-wechat.json', import.meta.url), 'utf8'),
);
const webBuildConfig = JSON.parse(
  await readFile(new URL('../scripts/build-web-mobile.json', import.meta.url), 'utf8'),
);

test('WeChat build uses an explicit lightweight engine feature whitelist', () => {
  assert.ok(Array.isArray(buildConfig.includeModules));

  const modules = new Set(buildConfig.includeModules);
  for (const required of [
    'base',
    'gfx-webgl',
    'gfx-webgl2',
    '3d',
    'primitive',
    '2d',
    'graphics',
    'ui',
    'tween',
    'custom-pipeline',
  ]) {
    assert.ok(modules.has(required), 'missing required engine feature: ' + required);
  }

  for (const unnecessary of [
    'animation',
    'skeletal-animation',
    'particle',
    'physics-builtin',
    'physics-ammo',
    'physics-physx',
    'physics-cannon',
    'physics-2d-box2d',
    'spine-3.8',
    'spine-4.2',
    'dragon-bones',
  ]) {
    assert.ok(!modules.has(unnecessary), 'unexpected heavy engine feature: ' + unnecessary);
  }
});

test('browser smoke builds use the same engine feature whitelist', () => {
  assert.deepEqual(webBuildConfig.includeModules, buildConfig.includeModules);
});
