import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { verifyWeChatBuild } from '../scripts/verify-wechat-build.mjs';

const EXPECTED_APP_ID = 'wx79a1c555206206f6';

async function createFixture(t, options = {}) {
  const root = await mkdtemp(path.join(tmpdir(), 'wechat-build-'));
  t.after(() => rm(root, { recursive: true, force: true }));

  const projectConfig = {
    appid: EXPECTED_APP_ID,
    compileType: 'game',
    projectname: 'teamer',
    ...options.projectConfig,
  };
  const gameConfig = {
    deviceOrientation: 'portrait',
    ...options.gameConfig,
  };

  await mkdir(root, { recursive: true });
  if (!options.omitProjectConfig) {
    await writeFile(
      path.join(root, 'project.config.json'),
      options.rawProjectConfig ?? `${JSON.stringify(projectConfig, null, 2)}\n`,
      'utf8',
    );
  }
  if (options.projectPrivateConfig !== undefined) {
    await writeFile(
      path.join(root, 'project.private.config.json'),
      `${JSON.stringify(options.projectPrivateConfig, null, 2)}\n`,
      'utf8',
    );
  }
  if (!options.omitGameJson) {
    await writeFile(path.join(root, 'game.json'), `${JSON.stringify(gameConfig, null, 2)}\n`, 'utf8');
  }
  if (!options.omitGameJs) {
    await writeFile(path.join(root, 'game.js'), '// fixture entry\n', 'utf8');
  }

  return root;
}

test('accepts a valid portrait WeChat Mini Game build', async (t) => {
  const root = await createFixture(t);

  assert.deepEqual(verifyWeChatBuild(root, EXPECTED_APP_ID), {
    appid: EXPECTED_APP_ID,
    compileType: 'game',
    orientation: 'portrait',
    entryFiles: ['game.js', 'game.json'],
  });
});

test('rejects a mismatched AppID', async (t) => {
  const root = await createFixture(t, { projectConfig: { appid: 'wx-wrong' } });

  assert.throws(
    () => verifyWeChatBuild(root, EXPECTED_APP_ID),
    /AppID mismatch.*wx79a1c555206206f6.*wx-wrong/i,
  );
});

test('rejects a non-game compile type', async (t) => {
  const root = await createFixture(t, { projectConfig: { compileType: 'minigame' } });

  assert.throws(() => verifyWeChatBuild(root, EXPECTED_APP_ID), /compileType.*game.*minigame/i);
});

test('rejects a non-portrait orientation', async (t) => {
  const root = await createFixture(t, { gameConfig: { deviceOrientation: 'landscape' } });

  assert.throws(() => verifyWeChatBuild(root, EXPECTED_APP_ID), /deviceOrientation.*portrait.*landscape/i);
});

test('rejects a missing game.js entry file', async (t) => {
  const root = await createFixture(t, { omitGameJs: true });

  assert.throws(() => verifyWeChatBuild(root, EXPECTED_APP_ID), /missing.*game\.js/i);
});

test('rejects a missing game.json entry file', async (t) => {
  const root = await createFixture(t, { omitGameJson: true });

  assert.throws(() => verifyWeChatBuild(root, EXPECTED_APP_ID), /missing.*game\.json/i);
});

test('applies a private AppID override before validation', async (t) => {
  const root = await createFixture(t, {
    projectPrivateConfig: { appid: 'wx-private-conflict' },
  });

  assert.throws(
    () => verifyWeChatBuild(root, EXPECTED_APP_ID),
    /AppID mismatch.*wx79a1c555206206f6.*wx-private-conflict/i,
  );
});

test('applies a private compileType override before validation', async (t) => {
  const root = await createFixture(t, {
    projectPrivateConfig: { compileType: 'minigame' },
  });

  assert.throws(() => verifyWeChatBuild(root, EXPECTED_APP_ID), /compileType.*game.*minigame/i);
});

test('accepts matching effective fields from a private config', async (t) => {
  const root = await createFixture(t, {
    projectPrivateConfig: { appid: EXPECTED_APP_ID, compileType: 'game', libVersion: 'trial' },
  });

  assert.equal(verifyWeChatBuild(root, EXPECTED_APP_ID).orientation, 'portrait');
});

test('rejects a private AppID override that masks an invalid public build contract', async (t) => {
  const root = await createFixture(t, {
    projectConfig: { appid: 'wx-public-wrong' },
    projectPrivateConfig: { appid: EXPECTED_APP_ID },
  });

  assert.throws(
    () => verifyWeChatBuild(root, EXPECTED_APP_ID),
    /project\.config\.json AppID mismatch.*wx79a1c555206206f6.*wx-public-wrong/i,
  );
});

test('rejects a private compileType override that masks an invalid public build contract', async (t) => {
  const root = await createFixture(t, {
    projectConfig: { compileType: 'minigame' },
    projectPrivateConfig: { compileType: 'game' },
  });

  assert.throws(
    () => verifyWeChatBuild(root, EXPECTED_APP_ID),
    /project\.config\.json compileType.*game.*minigame/i,
  );
});

test('reports the exact path for malformed JSON', async (t) => {
  const root = await createFixture(t, { rawProjectConfig: '{ nope' });

  assert.throws(
    () => verifyWeChatBuild(root, EXPECTED_APP_ID),
    new RegExp(`Invalid JSON.*${path.basename(root)}[\\\\/]project\\.config\\.json`, 'i'),
  );
});

test('reports the exact path when project.config.json is missing', async (t) => {
  const root = await createFixture(t, { omitProjectConfig: true });

  assert.throws(
    () => verifyWeChatBuild(root, EXPECTED_APP_ID),
    new RegExp(`Missing required file.*${path.basename(root)}[\\\\/]project\\.config\\.json`, 'i'),
  );
});
