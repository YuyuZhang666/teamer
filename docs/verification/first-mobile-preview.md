# 首次微信本地预览交接记录

记录日期：2026-09-07（Asia/Shanghai）

本记录只覆盖 Cocos 构建、静态校验和微信开发者工具的本地打开尝试。没有执行账号自动登录、`preview`、`auto-preview`、`upload` 或发布操作，也没有加入剧情和玩法。

## 固定环境

- Cocos Creator：3.8.8（3.8 LTS）
- 微信开发者工具：2.02.2608040
- Node.js 测试：25 项
- 微信小游戏 AppID：`wx79a1c555206206f6`
- 设计方向：竖屏，750 × 1334
- 生成目录：`build/wechatgame`

## 自动化证据

### 完整验证

执行：

```powershell
npm.cmd run verify
```

结果为退出码 0：25 项测试全部通过，工具链发现 Node.js、Cocos Creator 3.8.8 和微信开发者工具 CLI；微信产物校验返回：

```json
{
  "appid": "wx79a1c555206206f6",
  "compileType": "game",
  "orientation": "portrait",
  "entryFiles": ["game.js", "game.json"],
  "packageBytes": 1750687,
  "packageLimitBytes": 4194304
}
```

### Cocos 微信构建

执行的可复现命令：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\build-wechat.ps1 -CreatorPath 'C:\ProgramData\cocos\editors\Creator\3.8.8\CocosCreator.exe'
```

Cocos Creator 返回其命令行成功码 `36`。构建助手随后校验了精确 AppID、`compileType: "game"`、竖屏方向、`game.js` / `game.json` 两个入口文件，以及微信主包体积。最终构建目录总计 1,750,687 bytes（约 1.67 MiB），低于 4 MiB 门禁；未使用的 Bullet、Spine、Box2D 等引擎载荷没有进入产物。

同一引擎模块白名单也用于浏览器烟雾构建。375 × 667 与 390 × 844 两种竖屏尺寸均确认 Boot 场景、就绪文字、环境动效、触摸波纹、实时 resize 和安全区适配正常，浏览器运行时无错误。

### 微信开发者工具本地打开证据

使用的唯一 CLI 动作是：

```powershell
& 'C:\Program Files (x86)\Tencent\微信web开发者工具\cli.bat' open --project 'E:\project\zzz\teamer\build\wechatgame' --lang zh
```

共保留了两次集成证据：

1. 首次尝试暴露了旧校验契约错误。开发者工具把当时的 `compileType: "minigame"` 兼容性修正为小游戏所需的 `"game"`，随后输出 `[error]`、错误码 `10` 和“需要重新登录”。这促使构建脚本、测试和校验器按官方开发者工具的小游戏契约完成修正。
2. 修正后的重试中，`project.config.json` 的哈希以及 `compileType: "game"` 在 CLI 调用前后保持不变。输出确认 IDE 已启动，并建立本地 HTTP 服务 `http://127.0.0.1:9420`；随后仍停在过期登录状态，输出 `[error]` 和 `code: 10`。这一次外层 CLI 退出码却是 0，因此不能只看退出码，必须同时检查输出中的错误标记。

认证过期意味着本次不能声称项目模拟器画面已在无人值守状态下目视确认。登录失败与项目结构是两个独立问题：修正后的生成配置未被改写，之后执行的 `npm.cmd run verify:wechat -- build/wechatgame` 仍以退出码 0 通过；校验器也会同时检查可能存在的 `project.private.config.json` 覆盖。

## 明早的唯一人工边界

1. 在微信开发者工具界面中手动重新登录有该 AppID 权限的微信账号；本项目不会代填账号或自动扫码。
2. 从项目根目录运行 README 中的 `open` 命令，或在开发者工具中选择 `build/wechatgame`。
3. 打开后运行 `npm.cmd run verify:wechat -- build/wechatgame`，确认开发者工具的私有设置没有覆盖 AppID 或项目类型。
4. 模拟器编译无误后，由你主动点击 **Preview** 并用手机微信扫码。

Preview 会把一个临时预览包发送到微信服务，以便生成真机二维码；它不是正式发布，但仍属于外部传输动作。本次夜间执行没有触发 Preview、上传或发布，因此手机扫码和真机画面仍需你本人完成。

相关官方资料：[微信开发者工具 CLI](https://developers.weixin.qq.com/minigame/dev/devtools/cli)、[微信项目配置文件](https://developers.weixin.qq.com/minigame/dev/devtools/projectconfig.html)、[Cocos Creator 发布微信小游戏](https://docs.cocos.com/creator/3.8/manual/zh/editor/publish/publish-wechatgame.html)。
