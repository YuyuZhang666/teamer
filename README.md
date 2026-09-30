# 准点科技：办公室场景 V1

这是一个基于 Cocos Creator 3.8.8 的竖屏微信小游戏工程。当前版本已经从空脚手架升级为可运行的程序化低多边形办公室场景，重点验证空间、镜头、动画、手机适配和微信构建链路。

## 当前版本包含

- 一张连通的单层办公室地图：电梯、公司入口/前台、开放办公区、会议室、老板办公室、茶水间、厕所/摸鱼区。
- 斜俯视正交相机和 16 秒开场运镜，可在任意时刻触摸跳过并稳定落到总览。
- 10 名程序化低多边形 NPC，包含敲键盘、看手机、等电梯、整理快递、搅拌饮料、开会点头、老板巡视和马屁精跟随等错峰循环。
- 暖白、浅木、蓝灰、蓝绿、黄色和珊瑚色组成的明亮轻喜剧配色。
- `750 × 1334` 竖屏设计、安全区 HUD，以及 `375 × 667`、`390 × 844` 两种手机视口适配。
- 微信小游戏 AppID `wx79a1c555206206f6` 和 4 MiB 主包门禁。

当前不包含剧情、任务、谜题、自由行走、存档、正式人物模型、音频或正式发布流程。现有家具和人物均为程序化基础网格，后续可以在不改变布局与行为边界的前提下逐步替换为正式美术资源。

## 环境要求

- Node.js
- Cocos Creator 3.8.8
- 微信开发者工具

本机使用的 Cocos Creator 路径为：

```text
C:\ProgramData\cocos\editors\Creator\3.8.8\CocosCreator.exe
```

## 测试与构建

运行完整自动验证：

```powershell
npm.cmd run verify
node 'C:\ProgramData\cocos\editors\Creator\3.8.8\resources\app.asar.unpacked\node_modules\typescript\lib\tsc.js' -p tsconfig.json --skipLibCheck
node 'C:\ProgramData\cocos\editors\Creator\3.8.8\resources\app.asar.unpacked\node_modules\typescript\lib\tsc.js' -p tsconfig.cocos-tests.json --skipLibCheck
```

构建浏览器手机预览：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\build-web-mobile.ps1 -CreatorPath 'C:\ProgramData\cocos\editors\Creator\3.8.8\CocosCreator.exe'
```

构建并校验微信小游戏：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\build-wechat.ps1 -CreatorPath 'C:\ProgramData\cocos\editors\Creator\3.8.8\CocosCreator.exe'
npm.cmd run verify:wechat -- build\wechatgame
```

Cocos Creator 命令行成功构建会返回它约定的退出码 `36`，两个构建助手会把这个值识别为成功。生成目录 `build/` 不提交到 Git；新检出工程需要先构建，再运行依赖微信产物的完整验证。

## 微信手机预览

先在微信开发者工具中登录有该 AppID 权限的账号，再在本地打开生成项目：

```powershell
& 'C:\Program Files (x86)\Tencent\微信web开发者工具\cli.bat' open --project (Resolve-Path 'build\wechatgame').Path --lang zh
```

开发者工具的 **Preview** 会把临时构建包发送到微信服务并生成二维码；它不是正式发布，但属于外部上传操作，应在获得明确授权后执行。不要运行 `upload`，除非后续单独决定发布版本。

最新构建与预览证据见 [微信手机预览交接记录](docs/verification/first-mobile-preview.md)。

## 2026-10-01 验证摘要

- Node 测试：47/47 通过。
- 项目与 Cocos 集成 TypeScript 检查：退出码 0。
- Web 与微信构建：Creator 成功码 36。
- 微信主包：2,028,642 / 4,194,304 bytes。
- 浏览器运行验收：七区、10 名 NPC、触摸跳过、实时 resize、安全区 HUD 和控制台均通过。
