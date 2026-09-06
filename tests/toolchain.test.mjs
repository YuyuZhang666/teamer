import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

import { discoverToolchain } from '../scripts/check-toolchain.mjs';

function assertTool(tool, name) {
  assert.equal(typeof tool.available, 'boolean', `${name}.available must be boolean`);
  assert.ok(
    typeof tool.path === 'string' || tool.path === null,
    `${name}.path must be a string or null`,
  );
}

test('discovers Node and represents optional Windows tool paths safely', () => {
  const toolchain = discoverToolchain();

  assert.ok(Object.hasOwn(toolchain, 'node'));
  assert.ok(Object.hasOwn(toolchain, 'wechatCli'));
  assert.ok(Object.hasOwn(toolchain, 'cocosCreator'));
  assert.equal(toolchain.node.available, true);
  assertTool(toolchain.node, 'node');
  assertTool(toolchain.wechatCli, 'wechatCli');
  assertTool(toolchain.cocosCreator, 'cocosCreator');
});

test('prints valid JSON when run as a command-line probe', () => {
  const output = execFileSync(process.execPath, ['scripts/check-toolchain.mjs'], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8',
  });

  const toolchain = JSON.parse(output);
  assert.equal(toolchain.node.available, true);
});
