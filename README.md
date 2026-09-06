# Cocos WeChat Mini Game Scaffold

一个只验证工程链路的 Cocos 微信小游戏脚手架。当前阶段不包含剧情、角色、美术、音频、玩法、存档、上传或发布功能。

## Fixed baseline

- Engine: Cocos Creator 3.8 LTS
- Language: TypeScript
- Design resolution: 750 × 1334 (portrait)
- WeChat Mini Game AppID: `wx79a1c555206206f6`
- WeChat main-package guard: at most 4 MiB (4,194,304 bytes)

## Prerequisites

Install Node.js, Cocos Creator 3.8 LTS, and WeChat Developer Tools. The toolchain probe checks a small set of common Windows install locations and reports unavailable optional tools as `null`; it does not require an installation under a particular user profile.

## Commands

```powershell
npm.cmd test
npm.cmd run check:toolchain
```

`check:toolchain` prints JSON describing the Node runtime and any discovered Cocos Creator or WeChat Developer Tools CLI executables. It exits successfully when optional tools have not been installed so that setup can continue independently.

To rebuild the generated WeChat Mini Game with the fixed AppID and portrait contract, point the helper at Cocos Creator 3.8.8 and run:

```powershell
$env:COCOS_CREATOR_PATH = 'C:\ProgramData\cocos\editors\Creator\3.8.8\CocosCreator.exe'
npm.cmd run build:wechat
npm.cmd run verify:wechat -- build/wechatgame
npm.cmd run verify
```

Creator returns exit code `36` for a successful command-line build. The helper recognizes that Creator-specific success code and then runs the static build verifier. The build uses an explicit lightweight engine-feature whitelist, and the verifier rejects any generated directory over 4 MiB. On a fresh checkout, run the build before `npm.cmd run verify` because generated output is intentionally not stored in Git.

## Intended workflow

1. Open this repository in Cocos Creator 3.8 LTS.
2. Keep the project in portrait at 750 × 1334 and run `npm.cmd run build:wechat` with `COCOS_CREATOR_PATH` set as shown above.
3. Run `npm.cmd run verify`; it must report 25 passing tests, the public/effective AppID `wx79a1c555206206f6`, `compileType: "game"`, `orientation: "portrait"`, and `packageBytes` below `packageLimitBytes`.
4. Log in to WeChat Developer Tools manually, then open the generated project locally:

   ```powershell
   $wechatProject = (Resolve-Path 'build\wechatgame').Path
   & 'C:\Program Files (x86)\Tencent\微信web开发者工具\cli.bat' open --project $wechatProject --lang zh
   npm.cmd run verify:wechat -- build/wechatgame
   ```

5. After the simulator compiles without errors, click **Preview** yourself and scan the QR code with the intended WeChat account to test on a phone.

The Preview action sends a temporary preview package to WeChat services. It is a separate, user-controlled network action: this scaffold setup did not run `preview`, `auto-preview`, `upload`, or any release operation.

The first local handoff and its authentication boundary are recorded in [`docs/verification/first-mobile-preview.md`](docs/verification/first-mobile-preview.md). See the official [Cocos Creator WeChat Mini Game publishing guide](https://docs.cocos.com/creator/3.8/manual/zh/editor/publish/publish-wechatgame.html) and [WeChat Developer Tools CLI documentation](https://developers.weixin.qq.com/minigame/dev/devtools/cli) for platform details.

Do not upload or publish from this scaffold.
