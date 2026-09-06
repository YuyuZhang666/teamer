# Cocos WeChat Mini Game Scaffold

一个只验证工程链路的 Cocos 微信小游戏脚手架。当前阶段不包含剧情、角色、美术、音频、玩法、存档、上传或发布功能。

## Fixed baseline

- Engine: Cocos Creator 3.8 LTS
- Language: TypeScript
- Design resolution: 750 × 1334 (portrait)
- WeChat Mini Game AppID: `wx79a1c555206206f6`

## Prerequisites

Install Node.js, Cocos Creator 3.8 LTS, and WeChat Developer Tools. The toolchain probe checks a small set of common Windows install locations and reports unavailable optional tools as `null`; it does not require an installation under a particular user profile.

## Commands

```powershell
npm.cmd test
npm.cmd run check:toolchain
```

`check:toolchain` prints JSON describing the Node runtime and any discovered Cocos Creator or WeChat Developer Tools CLI executables. It exits successfully when optional tools have not been installed so that setup can continue independently.

After a WeChat build verifier is added, use:

```powershell
npm.cmd run verify:wechat -- build/wechatgame
npm.cmd run verify
```

## Intended workflow

1. Open this repository in Cocos Creator 3.8 LTS.
2. Keep the project in portrait at 750 × 1334 and build for WeChat Mini Game with AppID `wx79a1c555206206f6`.
3. Import the generated `build/wechatgame` directory into WeChat Developer Tools for local preview only.

Do not upload or publish from this scaffold.
