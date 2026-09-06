import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

function existingPath(candidates) {
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function programFilesPath(variable, ...segments) {
  const root = process.env[variable];
  return root ? path.join(root, ...segments) : null;
}

function compactPaths(paths) {
  return paths.filter((candidate) => typeof candidate === 'string');
}

export function discoverToolchain() {
  const wechatCli = existingPath(compactPaths([
    programFilesPath('ProgramFiles(x86)', 'Tencent', '微信web开发者工具', 'cli.bat'),
    programFilesPath('ProgramFiles', 'Tencent', '微信web开发者工具', 'cli.bat'),
    'C:\\Program Files (x86)\\Tencent\\微信web开发者工具\\cli.bat',
    'C:\\Program Files\\Tencent\\微信web开发者工具\\cli.bat',
  ]));
  const cocosCreator = existingPath(compactPaths([
    'C:\\ProgramData\\cocos\\editors\\Creator\\3.8.8\\CocosCreator.exe',
    programFilesPath('ProgramFiles', 'Cocos', 'CocosCreator3.8.8', 'CocosCreator.exe'),
    programFilesPath('ProgramFiles', 'Cocos', 'Creator', '3.8.8', 'CocosCreator.exe'),
  ]));

  return {
    node: {
      available: fs.existsSync(process.execPath),
      path: process.execPath || null,
    },
    wechatCli: {
      available: wechatCli !== null,
      path: wechatCli,
    },
    cocosCreator: {
      available: cocosCreator !== null,
      path: cocosCreator,
    },
  };
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : null;

if (invokedPath === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(discoverToolchain(), null, 2));
}
