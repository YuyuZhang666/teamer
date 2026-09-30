# 微信手机预览交接记录

记录日期：2026-10-01（Asia/Shanghai）

## 当前交付范围

当前工程已经实现第一版程序化低多边形办公室场景。画面包含电梯、前台、开放办公区、会议室、老板办公室、茶水间和厕所/摸鱼区七个连通区域，10 名 NPC 循环动作，以及一段可触摸跳过的 16 秒开场镜头。

本次没有加入剧情、谜题、自由行走、正式模型、音频或正式发布操作。

## 固定环境

- Cocos Creator：3.8.8（3.8 LTS）
- 微信开发者工具：2.02.2608040
- 微信小游戏 AppID：`wx79a1c555206206f6`
- 项目类型：`game`
- 设计方向：竖屏，`750 × 1334`
- 生成目录：`build/wechatgame`
- 主包限制：4,194,304 bytes

## 自动化证据

执行：

```powershell
npm.cmd run verify
node 'C:\ProgramData\cocos\editors\Creator\3.8.8\resources\app.asar.unpacked\node_modules\typescript\lib\tsc.js' -p tsconfig.json --skipLibCheck
node 'C:\ProgramData\cocos\editors\Creator\3.8.8\resources\app.asar.unpacked\node_modules\typescript\lib\tsc.js' -p tsconfig.cocos-tests.json --skipLibCheck
```

结果：

- 47 项 Node 测试全部通过。
- 项目 TypeScript 与 Cocos 集成契约检查均以退出码 0 通过。
- 工具链识别到 Node.js、Cocos Creator 3.8.8 和微信开发者工具 CLI。
- Web 与微信目标均从最终源码重新构建，Cocos Creator 返回成功码 `36`。

最终微信产物校验：

```json
{
  appid: wx79a1c555206206f6,
  compileType: game,
  orientation: portrait,
  entryFiles: [game.js, game.json],
  packageBytes: 2028642,
  packageLimitBytes: 4194304
}
```

## Web 运行验收

最终 Web 构建通过 Chrome DevTools Protocol 在两个真实 CSS 视口完成检查：

- `375 × 667`：开场运行正常，透明全屏触摸层有效；一次触摸后镜头稳定停在 `[8, 23, -30]`，正交高度为 `27`。
- `390 × 844`：实时 resize 后仍只有一个 `OfficeWorld`，没有重复相机或 NPC；最终总览能同时看见电梯与老板办公室。
- 两种尺寸均确认七区场景、10 名 NPC、安全区标题、中文文案和零运行时控制台错误。
- HUD 文案为“准点科技”和“认真上班，开心下班”，只在开场收束阶段淡入淡出。
- `390 × 844` 最终总览采样 120 帧：平均 `16.66 ms`、P95 `18.10 ms`、最大 `18.50 ms`，约 9,612 个三角形、193 次绘制调用、247 个场景节点和 2 台相机；采样期间无运行时错误。

## 微信开发者工具状态

最终构建已通过静态微信契约与包体校验。尝试在本机开发者工具中打开 `build/wechatgame` 时，CLI 找到已启动的 `9420` 本地服务，但返回错误码 `10` 和“需要重新登录”。CLI 外层退出码仍为 0，因此不能只依赖进程退出码判断登录状态。

新的 Preview 二维码尚未生成，原因有两项：

1. 当前微信开发者工具会话需要重新登录有该 AppID 权限的账号。
2. Preview 会把当前私有构建包上传到微信临时预览服务；需要对这个具体外部传输给出明确授权。

重新登录并授权后，可执行：

```powershell
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$projectPath = (Resolve-Path 'build\wechatgame').Path
& 'C:\Program Files (x86)\Tencent\微信web开发者工具\cli.bat' preview `
  --project $projectPath `
  --qr-format image `
  --qr-output temp\wechat-preview-qr-$stamp.png `
  --info-output temp\wechat-preview-info-$stamp.json `
  --lang zh
```

该命令只生成临时真机预览，不执行 `upload` 或正式发布。
