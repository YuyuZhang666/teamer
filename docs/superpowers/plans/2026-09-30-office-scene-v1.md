# 第一版办公室场景 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有 Cocos Creator 3.8.8 竖屏微信小游戏框架中实现一张程序化低多边形办公室，包含七个连通区域、8—12 名循环动作 NPC 和一段可跳过的 16 秒开场镜头。

**Architecture:** 保留 `Boot.scene` 和现有 UI Canvas，以 `AppBootstrap` 作为兼容入口，转交新的 `OfficeBootstrap` 创建 3D 世界。布局、调色板、镜头时间线和 NPC 配置保持为可由 Node 测试的纯数据；Cocos 层由基础网格工厂、区域构建器、NPC 工厂、镜头控制器和 HUD 各自负责单一职责。

**Tech Stack:** Cocos Creator 3.8.8、TypeScript、Cocos `3d`/`primitive`/`ui`/`tween` 模块、Node.js 内置 test runner、微信开发者工具。

**Spec:** `docs/superpowers/specs/2026-09-30-office-scene-v1-design.md`

## Global Constraints

- 设备方向保持竖屏，设计分辨率保持 `750×1334`，沿用安全区适配。
- 微信小游戏 AppID 保持 `wx79a1c555206206f6`，`compileType` 保持 `game`。
- 七个区域必须是电梯、前台、开放办公区、会议室、老板办公室、茶水间、厕所/摸鱼区。
- 第一版使用程序化基础网格和纯色材质，不下载或购买第三方模型、贴图、字体和音频。
- 不加入剧情、任务、谜题、自由行走、物理破坏、骨骼动画库、粒子、Spine 或物理引擎。
- 微信生成目录继续受 `4 MiB` 主包守卫保护；中端手机目标为稳定 `30 FPS`。
- 同屏 NPC 控制在 `8—12` 名，循环动作时长 `3—8` 秒且相位错开。
- 开场总时长固定为 `16` 秒，触摸后立即落到最终总览构图。

## Review Focus

- 极窄竖屏或异形屏：HUD 必须留在安全区，世界相机不能裁掉电梯和老板办公室；由 Task 6 的双尺寸浏览器烟测覆盖。
- 多次触摸跳过开场：只允许一次状态切换，镜头稳定停在同一最终姿态；由 Task 1 时间线测试和 Task 6 运行烟测覆盖。
- 场景重复启动或热重载：不得重复创建世界、相机和 NPC；由 Task 6 的引导组件状态测试覆盖。
- 透明会议室玻璃和重复材质：材质必须缓存且只使用一层透明边界，避免过度绘制；由 Task 3 的工厂契约测试和 Task 7 运行检查覆盖。
- 增加 3D 模块后的微信主包：构建必须继续低于 `4 MiB`；由 Task 2 和 Task 7 的微信产物校验覆盖。

---

### Task 1: 锁定布局、调色板、镜头时间线和 NPC 配置

**Files:**
- Create: `assets/scripts/office/OfficeLayout.ts`
- Create: `assets/scripts/office/OfficePalette.ts`
- Create: `assets/scripts/office/OfficeIntroTimeline.ts`
- Create: `assets/scripts/office/OfficeNpcPlan.ts`
- Test: `tests/office-layout.test.ts`
- Test: `tests/office-intro-timeline.test.ts`
- Test: `tests/office-npc-plan.test.ts`

**Interfaces:**
- Produces: `OfficeZoneId`, `OfficeRect`, `OfficeZone`, `OFFICE_BOUNDS`, `OFFICE_ZONES`, `findOfficeZone(id)` and `validateOfficeLayout()`.
- Produces: `OfficePaletteKey`, `OFFICE_PALETTE` as immutable hex strings.
- Produces: `OfficeIntroShot`, `OFFICE_INTRO_SHOTS`, `OFFICE_INTRO_TOTAL_SECONDS = 16`, and `clampIntroTime(seconds)`.
- Produces: `OfficeNpcMotionKind`, `OfficeNpcPlacement`, and `OFFICE_NPC_PLAN` with 10 placements.

- [ ] **Step 1: Write failing layout tests**

Assert exact zone ids, `18×24` bounds, positive sizes, in-bounds rectangles, unique ids and no positive-area overlap. Pin the coordinates to:

```ts
const expected = {
  elevator: [-6.5, -9.5, 5, 5],
  reception: [2.5, -9.5, 11, 5],
  'open-office': [-2.5, -1, 13, 12],
  'meeting-room': [6.5, -0.5, 5, 11],
  'break-area': [-6.5, 8.5, 5, 7],
  pantry: [-1, 8.5, 6, 7],
  'boss-office': [5.5, 8.5, 7, 7],
};
```

- [ ] **Step 2: Write failing timeline and NPC-plan tests**

Assert shots are `elevator 0—2.5`, `reception 2.5—5`, `open-office 5—10`, `overview 10—14`, `settle 14—16`; negative time clamps to `0`, time above total clamps to `16`. Assert 10 NPC placements include all eight required motion kinds and every phase offset is within `[0, 1)`.

- [ ] **Step 3: Run focused tests to verify failure**

Run: `node --test tests/office-layout.test.ts tests/office-intro-timeline.test.ts tests/office-npc-plan.test.ts`

Expected: FAIL because the four office modules do not exist.

- [ ] **Step 4: Implement the four pure-data modules**

Use `Object.freeze` for exported arrays and records. `validateOfficeLayout(): readonly string[]` returns an empty array for the committed layout and descriptive errors for invalid bounds, duplicate ids or positive-area intersections.

- [ ] **Step 5: Run tests to verify pass**

Run: `node --test tests/office-layout.test.ts tests/office-intro-timeline.test.ts tests/office-npc-plan.test.ts`

Expected: all focused tests PASS.

- [ ] **Step 6: Commit**

```bash
git add assets/scripts/office tests/office-layout.test.ts tests/office-intro-timeline.test.ts tests/office-npc-plan.test.ts
git commit -m "feat: define office scene data"
```

---

### Task 2: 启用最小 3D 引擎模块并守住微信包体

**Files:**
- Modify: `scripts/build-wechat.json`
- Modify: `scripts/build-web-mobile.json`
- Modify: `tests/wechat-build-config.test.mjs`

**Interfaces:**
- Consumes: Cocos 3.8.8 feature ids `3d` and `primitive` from the installed engine `cc.config.json`.
- Produces: Web 与微信完全一致的最小引擎白名单，继续由现有产物验证器守护。

- [ ] **Step 1: Change the build-config test first**

Move `3d` out of the forbidden list; add `3d` and `primitive` to required features. Keep all physics, skeletal animation, Spine and DragonBones features forbidden. Add assertions that `animation`, `skeletal-animation`, `particle` and `physics-builtin` are absent.

- [ ] **Step 2: Run the test to verify failure**

Run: `node --test tests/wechat-build-config.test.mjs`

Expected: FAIL with missing required feature `3d`.

- [ ] **Step 3: Add `3d` and `primitive` to both build configs**

Keep the existing module order and place the two features after `gfx-webgl2`. Do not enable engine features unrelated to the scene.

- [ ] **Step 4: Run config tests**

Run: `node --test tests/wechat-build-config.test.mjs`

Expected: PASS and Web/微信 feature lists remain identical.

- [ ] **Step 5: Establish the empty-scene 3D package baseline**

Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/build-wechat.ps1 -CreatorPath 'C:\ProgramData\cocos\editors\Creator\3.8.8\CocosCreator.exe'
```

Expected: Creator exit `36`, verifier PASS, generated package below `4,194,304` bytes. If the guard fails solely because the engine enters the main package, set `packages.wechatgame.separateEngine` to `true`, add a config assertion for that exact fallback, rebuild, and do not continue until the verifier passes.

- [ ] **Step 6: Commit**

```bash
git add scripts/build-wechat.json scripts/build-web-mobile.json tests/wechat-build-config.test.mjs
git commit -m "build: enable lightweight 3d scene modules"
```

---

### Task 3: 建立共享低多边形网格和材质工厂

**Files:**
- Create: `assets/scripts/office/OfficePrimitiveFactory.ts`
- Test: `tests/office-source-contract.test.mjs`

**Interfaces:**
- Consumes: `OfficePaletteKey` and `OFFICE_PALETTE` from Task 1.
- Produces: `OfficePrimitiveFactory.createBox()`, `createCylinder()`, `createSphere()`, `createGroup()` and `materialFor()`.
- Produces: `OfficePrimitiveOptions` with `name`, `parent`, `position`, `scale`, `color`, optional `rotation` and optional `transparent`.

- [ ] **Step 1: Write the failing source-contract test**

Read the factory source and assert it exports all five methods, uses `builtin-unlit`, caches materials by palette key plus transparency, and contains no import matching `/physics|Animation|SkeletalAnimation|Particle/i`.

- [ ] **Step 2: Run the focused test to verify failure**

Run: `node --test tests/office-source-contract.test.mjs`

Expected: FAIL because `OfficePrimitiveFactory.ts` does not exist.

- [ ] **Step 3: Implement `OfficePrimitiveFactory`**

Use `primitives.box/cylinder/sphere`, `utils.createMesh`, `MeshRenderer` and cached `Material` instances. Use one shared mesh per shape; apply dimensions through node scale. Transparent materials are permitted only when explicitly requested and use the configured alpha from the palette color.

- [ ] **Step 4: Type-check and run the contract test**

Run:

```powershell
node 'C:\ProgramData\cocos\editors\Creator\3.8.8\resources\app.asar.unpacked\node_modules\typescript\lib\tsc.js' -p tsconfig.json --skipLibCheck
node --test tests/office-source-contract.test.mjs
```

Expected: TypeScript exit `0`; test PASS.

- [ ] **Step 5: Commit**

```bash
git add assets/scripts/office/OfficePrimitiveFactory.ts tests/office-source-contract.test.mjs
git commit -m "feat: add low poly primitive factory"
```

---

### Task 4: 构建七区办公室空间和 P0 家具

**Files:**
- Create: `assets/scripts/office/OfficeSceneBuilder.ts`
- Modify: `tests/office-source-contract.test.mjs`

**Interfaces:**
- Consumes: `OFFICE_BOUNDS`, `OFFICE_ZONES`, palette and `OfficePrimitiveFactory`.
- Produces: `OfficeSceneHandles` containing `world`, `cameraAnchor`, `introAnchors`, `npcRoot` and `npcAnchors`.
- Produces: `OfficeSceneBuilder.build(parent: Node): OfficeSceneHandles`.

- [ ] **Step 1: Extend the source-contract test first**

Assert `OfficeSceneBuilder` has one named builder for each zone, consumes `OFFICE_ZONES`, creates exactly one meeting-room glass boundary marker, and exports `OfficeSceneHandles` with the five required fields.

- [ ] **Step 2: Run the test to verify failure**

Run: `node --test tests/office-source-contract.test.mjs`

Expected: FAIL because `OfficeSceneBuilder.ts` does not exist.

- [ ] **Step 3: Implement the shared shell**

Create continuous floor slabs, back and side cutaway walls, zone floor-color insets, main aisle, one `DirectionalLight`, and stable camera/intro anchor nodes. Front walls remain absent; interior partitions remain below the sight line except the boss-office rear wall.

- [ ] **Step 4: Implement P0 furniture for all seven zones**

Build the exact MVP set: two elevator doors; front desk, logo wall, gate and sofa; twelve desks in three four-seat islands plus printer; meeting table, eight chairs, screen, whiteboard and one-layer glass boundary; boss desk, chair, bookcase and sofa; pantry counter, fridge, microwave, coffee machine and round table; two restroom doors, sink, bench and vending machine. Reuse shared box/cylinder/sphere meshes and cached materials.

- [ ] **Step 5: Add restrained P1 identity props**

Add a maximum of 24 small props total: parcel boxes, cups, files, monitors, plants and four personality markers for ordinary/slacker/overachiever/flatterer desks. No prop may narrow the main aisle below `1.8` scene units.

- [ ] **Step 6: Type-check, test and Web-build**

Run:

```powershell
node 'C:\ProgramData\cocos\editors\Creator\3.8.8\resources\app.asar.unpacked\node_modules\typescript\lib\tsc.js' -p tsconfig.json --skipLibCheck
node --test tests/office-source-contract.test.mjs
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/build-web-mobile.ps1 -CreatorPath 'C:\ProgramData\cocos\editors\Creator\3.8.8\CocosCreator.exe'
```

Expected: TypeScript exit `0`, tests PASS, Creator exit `36`.

- [ ] **Step 7: Commit**

```bash
git add assets/scripts/office/OfficeSceneBuilder.ts tests/office-source-contract.test.mjs
git commit -m "feat: build seven-zone office environment"
```

---

### Task 5: 增加程序化 NPC 和错峰循环动作

**Files:**
- Create: `assets/scripts/office/OfficeNpcFactory.ts`
- Create: `assets/scripts/office/OfficeNpcMotion.ts`
- Modify: `tests/office-source-contract.test.mjs`

**Interfaces:**
- Consumes: `OFFICE_NPC_PLAN`, `OfficeNpcMotionKind`, scene `npcAnchors`, palette and primitive factory.
- Produces: `OfficeNpcVariant` and `OfficeNpcFactory.create(parent, placement, variant): Node`.
- Produces: `OfficeNpcMotion.configure(kind: OfficeNpcMotionKind, phaseOffset: number): void`.

- [ ] **Step 1: Extend the source-contract test first**

Assert the factory consumes all 10 planned placements, creates head/torso/arms/legs from shared primitives, and the motion component exposes `configure`. Assert neither file imports Cocos Animation, skeletal animation or physics APIs.

- [ ] **Step 2: Run the test to verify failure**

Run: `node --test tests/office-source-contract.test.mjs`

Expected: FAIL because the NPC files do not exist.

- [ ] **Step 3: Implement `OfficeNpcFactory`**

Create 10 lightweight characters with shared geometry and palette variants. Parent all moving body parts beneath a stable NPC root so future formal models can replace the visual child without changing placements.

- [ ] **Step 4: Implement `OfficeNpcMotion`**

Use `update(dt)` with bounded sine/lerp movement for typing, phone glance, elevator wait, parcel sort, drink stir, meeting nod, boss patrol and flatterer follow. Clamp phase offsets to `[0, 1)` and keep translations below `2.5` scene units so no NPC leaves its assigned area.

- [ ] **Step 5: Type-check and run all Node tests**

Run:

```powershell
node 'C:\ProgramData\cocos\editors\Creator\3.8.8\resources\app.asar.unpacked\node_modules\typescript\lib\tsc.js' -p tsconfig.json --skipLibCheck
npm.cmd test
```

Expected: TypeScript exit `0`; all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add assets/scripts/office/OfficeNpcFactory.ts assets/scripts/office/OfficeNpcMotion.ts tests/office-source-contract.test.mjs
git commit -m "feat: animate office npc loops"
```

---

### Task 6: 接入开场镜头、HUD 和启动生命周期

**Files:**
- Create: `assets/scripts/office/OfficeIntroCamera.ts`
- Create: `assets/scripts/office/OfficeHud.ts`
- Create: `assets/scripts/office/OfficeBootstrap.ts`
- Modify: `assets/scripts/app/AppBootstrap.ts`
- Modify: `tests/office-source-contract.test.mjs`

**Interfaces:**
- Consumes: `OfficeSceneBuilder`, `OfficeNpcFactory`, `OFFICE_INTRO_SHOTS`, `AppSession`, `SafeAreaLayout` and runtime-platform detection.
- Produces: `OfficeIntroCamera.configure(camera, poses)`, `play()`, `skip()` and read-only `isComplete`.
- Produces: `OfficeHud.build(canvas): OfficeHudHandles` with title, subtitle and full-screen skip target.
- Produces: one idempotent `OfficeBootstrap` attached after scene launch.

- [ ] **Step 1: Extend contract tests before implementation**

Assert the bootstrap uses a single world marker name `OfficeWorld`, refuses to build when it already exists, creates a separate world camera while preserving the Canvas camera, sets `750×1334` fixed-width resolution, and wires a touch event to `intro.skip()`.

- [ ] **Step 2: Run the test to verify failure**

Run: `node --test tests/office-source-contract.test.mjs`

Expected: FAIL because the integration files do not exist.

- [ ] **Step 3: Implement the camera controller**

Interpolate position, look-at target and orthographic height through the five shots from Task 1. `skip()` is idempotent, stops active tweens/update state and applies the exact final pose.

- [ ] **Step 4: Implement the minimal HUD**

Reuse `SafeAreaLayout`; show “准点科技” and “认真上班，开心下班” only during the settle shot, then fade them. Keep a transparent full-screen touch target active only while the intro is incomplete.

- [ ] **Step 5: Implement idempotent scene bootstrapping**

Start `AppSession`, remove the old backdrop/orbit/status UI creation, configure Canvas camera as UI overlay, build one `OfficeWorld`, create the world camera and NPCs, run the intro, then transition the session to ready. Preserve platform detection for diagnostics without showing technical text in the final scene.

- [ ] **Step 6: Type-check and build Web**

Run:

```powershell
node 'C:\ProgramData\cocos\editors\Creator\3.8.8\resources\app.asar.unpacked\node_modules\typescript\lib\tsc.js' -p tsconfig.json --skipLibCheck
npm.cmd test
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/build-web-mobile.ps1 -CreatorPath 'C:\ProgramData\cocos\editors\Creator\3.8.8\CocosCreator.exe'
```

Expected: TypeScript exit `0`; tests PASS; Creator exit `36`.

- [ ] **Step 7: Browser smoke at two portrait sizes**

Serve `build/web-mobile` locally and inspect `375×667` and `390×844`. Verify seven zones remain visible, HUD remains in safe area, one tap skips to the same overview pose, resize does not duplicate `OfficeWorld`, and the console has no errors.

- [ ] **Step 8: Commit**

```bash
git add assets/scripts/app/AppBootstrap.ts assets/scripts/office tests/office-source-contract.test.mjs
git commit -m "feat: launch animated office scene"
```

---

### Task 7: 完成微信构建、视觉验收和交付文档

**Files:**
- Modify: `README.md`
- Modify: `docs/verification/first-mobile-preview.md`
- Modify if generated by Creator: `assets/scripts/office/*.meta`
- Modify if generated by Creator: `assets/scripts/office.meta`

**Interfaces:**
- Consumes: all earlier tasks and the existing build verifier.
- Produces: reproducible Web/微信构建、真机 Preview 二维码和 documented verification evidence.

- [ ] **Step 1: Run the complete automated verification**

Run:

```powershell
npm.cmd run verify
node 'C:\ProgramData\cocos\editors\Creator\3.8.8\resources\app.asar.unpacked\node_modules\typescript\lib\tsc.js' -p tsconfig.json --skipLibCheck
```

Expected: every Node test PASS, toolchain recognized, WeChat verifier PASS, TypeScript exit `0`.

- [ ] **Step 2: Rebuild both targets from current source**

Run both build scripts with `C:\ProgramData\cocos\editors\Creator\3.8.8\CocosCreator.exe`.

Expected: Creator exit `36` for Web and WeChat; generated WeChat main package remains below `4 MiB`.

- [ ] **Step 3: Perform visual and performance inspection**

Check the 16-second opening, touch skip, all seven regions, 10 NPC loops, camera occlusion, glass overdraw and console output. Capture one `390×844` screenshot. In WeChat Developer Tools confirm portrait layout and no missing resource or unsupported-feature errors.

- [ ] **Step 4: Generate a fresh WeChat Preview QR**

Use the already logged-in WeChat Developer Tools CLI against `build/wechatgame`, write the timestamped QR and info JSON beneath `temp/`, and confirm the upload reports AppID `wx79a1c555206206f6` plus a package size below the configured limit. Do not publish a formal release.

- [ ] **Step 5: Update handoff documentation**

Document the new office scene, how to build it, how to preview it on mobile, the current procedural-art limitation, and the exact verification date and package size. Do not describe unimplemented gameplay.

- [ ] **Step 6: Final verification and commit**

Run `git diff --check`, `npm.cmd run verify`, TypeScript check, then commit all source, generated metadata, tests and docs while leaving `build/`, `library/`, `temp/` and `profiles/` ignored.

```bash
git add README.md docs/verification assets/scripts tests scripts/build-wechat.json scripts/build-web-mobile.json
git commit -m "feat: deliver office scene v1"
```

Expected: clean worktree except ignored build artifacts; `master` is ahead of `origin/master` by the implementation commits. Do not push unless the user separately asks to publish the new commits.
