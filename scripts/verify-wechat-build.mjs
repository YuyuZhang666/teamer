import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const WECHAT_APP_ID = 'wx79a1c555206206f6';

function readJsonFile(filePath, required = true) {
  if (!existsSync(filePath)) {
    if (required) {
      throw new Error(`Missing required file: ${filePath}`);
    }
    return null;
  }

  let source;
  try {
    source = readFileSync(filePath, 'utf8');
  } catch (error) {
    throw new Error(`Unable to read ${filePath}: ${error.message}`, { cause: error });
  }

  let value;
  try {
    value = JSON.parse(source);
  } catch (error) {
    throw new Error(`Invalid JSON in ${filePath}: ${error.message}`, { cause: error });
  }

  if (value === null || Array.isArray(value) || typeof value !== 'object') {
    throw new Error(`Expected a JSON object in ${filePath}`);
  }

  return value;
}

function requireEntryFile(root, filename) {
  const filePath = path.join(root, filename);
  let isFile = false;

  try {
    isFile = statSync(filePath).isFile();
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw new Error(`Unable to inspect ${filePath}: ${error.message}`, { cause: error });
    }
  }

  if (!isFile) {
    throw new Error(`Missing required entry file: ${filePath}`);
  }
}

function requireProjectIdentity(config, expectedAppId, sourceLabel) {
  if (config.appid !== expectedAppId) {
    throw new Error(
      `${sourceLabel} AppID mismatch: expected ${expectedAppId}, received ${String(config.appid)}`,
    );
  }
  if (config.compileType !== 'game') {
    throw new Error(
      `${sourceLabel} compileType must be game, received ${String(config.compileType)}`,
    );
  }
}

export function verifyWeChatBuild(root, expectedAppId = WECHAT_APP_ID) {
  if (typeof root !== 'string' || root.trim() === '') {
    throw new TypeError('WeChat build root must be a non-empty path string');
  }
  if (typeof expectedAppId !== 'string' || expectedAppId.trim() === '') {
    throw new TypeError('Expected WeChat AppID must be a non-empty string');
  }

  const resolvedRoot = path.resolve(root);
  const publicConfigPath = path.join(resolvedRoot, 'project.config.json');
  const privateConfigPath = path.join(resolvedRoot, 'project.private.config.json');
  const gameConfigPath = path.join(resolvedRoot, 'game.json');

  const publicConfig = readJsonFile(publicConfigPath);
  const privateConfig = readJsonFile(privateConfigPath, false) ?? {};
  const effectiveConfig = { ...publicConfig, ...privateConfig };
  const gameConfig = readJsonFile(gameConfigPath);

  requireProjectIdentity(publicConfig, expectedAppId, 'project.config.json');
  requireProjectIdentity(effectiveConfig, expectedAppId, 'effective project configuration');
  if (gameConfig.deviceOrientation !== 'portrait') {
    throw new Error(
      `game.json deviceOrientation must be portrait, received ${String(gameConfig.deviceOrientation)}`,
    );
  }

  const entryFiles = ['game.js', 'game.json'];
  for (const entryFile of entryFiles) {
    requireEntryFile(resolvedRoot, entryFile);
  }

  return {
    appid: effectiveConfig.appid,
    compileType: effectiveConfig.compileType,
    orientation: gameConfig.deviceOrientation,
    entryFiles,
  };
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  const buildRoot = process.argv[2];
  const expectedAppId = process.argv[3] ?? WECHAT_APP_ID;

  if (!buildRoot) {
    console.error('Usage: node scripts/verify-wechat-build.mjs <build-root> [expected-app-id]');
    process.exitCode = 1;
  } else {
    try {
      const result = verifyWeChatBuild(buildRoot, expectedAppId);
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error(`WeChat build verification failed: ${error.message}`);
      process.exitCode = 1;
    }
  }
}
