# 高精度办公室插画层实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在现有 Cocos 微信小游戏中加入可缩放的高精度竖屏办公室主场景，同时保留旧 3D 回退。

**Architecture:** 由纯函数模型约束 2D 视口缩放和平移；运行时组件异步加载资源目录中的办公室 Sprite，并创建七区中文标签。Bootstrap 协调插画层、旧 3D 回退、开场与 HUD。

**Tech Stack:** Cocos Creator 3.8.8、TypeScript、Node test、JPEG 游戏纹理、微信小游戏构建。

**Spec:** `docs/superpowers/specs/2026-10-08-office-illustration-layer-design.md`

## Global Constraints

- 设计分辨率固定为 750 × 1334 竖屏。
- 微信小游戏 AppID 保持 `wx79a1c555206206f6`。
- 主包必须小于 4,194,304 bytes。
- 资源失败时必须保留现有 3D 场景作为回退。
- 不加入剧情和复杂玩法。

## Review Focus

- 双指距离为零或非法缩放值时不得产生 NaN。
- 缩回全景时偏移必须自动回到中心。
- 近景平移不得把图片完全拖出屏幕。
- 图片加载失败不得隐藏旧 3D 场景。
- 七个区域标签必须完整且位于设计画布范围内。

---

### Task 1: 生成并压缩主场景美术

**Files:**
- Create: `assets/resources/office-art/office-master-v2.jpg`

- [ ] 生成与七区布局一致的竖屏等距办公室主图。
- [ ] 转为高质量 JPEG 并验证尺寸、文件大小和可读性。

### Task 2: 实现插画视口模型

**Files:**
- Create: `assets/scripts/office/OfficeIllustrationModel.ts`
- Create: `tests/office-illustration-model.test.ts`

**Interfaces:**
- Produces: `reduceOfficeIllustrationViewport(state, gesture)`
- Produces: `OFFICE_ILLUSTRATION_LABELS`

- [ ] 写缩放、居中和边界测试并确认失败。
- [ ] 实现最小纯函数模型并确认测试通过。

### Task 3: 实现 Cocos 插画视图

**Files:**
- Create: `assets/scripts/office/OfficeIllustratedView.ts`
- Modify: `tests/cocos/office-bootstrap.contract.ts`

**Interfaces:**
- Consumes: Task 2 的视口模型与标签配置。
- Produces: `build(canvas, onReady)`、`setInteractive(value)`、`setVisible(value)`。

- [ ] 写 Cocos 编译契约并确认失败。
- [ ] 实现资源加载、Sprite、七区标签和触摸手势。
- [ ] 运行两套 TypeScript 编译检查。

### Task 4: 接入启动流程与回退

**Files:**
- Modify: `assets/scripts/office/OfficeBootstrap.ts`
- Modify: `assets/scripts/office/OfficeHud.ts`

- [ ] 接入插画视图；成功时停用旧 3D 世界，失败时保持回退。
- [ ] 开场结束后启用交互，并更新固定 HUD 文案。
- [ ] 运行完整测试套件。

### Task 5: 构建和真机验证

**Files:**
- Output: `build/web-mobile`
- Output: `build/wechatgame`

- [ ] 构建 Web 并在 390 × 844 下模拟缩放截图。
- [ ] 构建微信小游戏并验证 AppID、方向和包体。
- [ ] 生成新的临时 Preview 二维码。
