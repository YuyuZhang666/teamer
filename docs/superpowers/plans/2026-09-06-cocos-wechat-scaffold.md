# Cocos WeChat Mini Game Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and verify a portrait Cocos Creator 3.8 LTS scaffold that can be imported as a WeChat Mini Game with AppID `wx79a1c555206206f6`.

**Architecture:** A single generated Boot scene owns presentation only. Engine-independent TypeScript modules define startup state and platform detection, while thin Cocos components bridge those modules to nodes, safe-area layout, animation, and touch input. A post-build verifier checks the generated WeChat project without owning Cocos serialization.

**Tech Stack:** Cocos Creator 3.8 LTS, TypeScript, Node.js 24 built-in test runner, WeChat Developer Tools CLI.

**Spec:** `docs/superpowers/specs/2026-09-06-cocos-wechat-scaffold-design.md`

## Global Constraints

- Use Cocos Creator 3.8 LTS and TypeScript.
- Use portrait design resolution 750 × 1334 and account for mobile safe areas.
- Configure WeChat Mini Game AppID exactly as `wx79a1c555206206f6`.
- Do not add plot, characters, final art, audio, puzzles, saves, analytics, uploads, or publishing.
- Generate Cocos-owned `.scene`, `.meta`, and settings data with the official editor rather than guessing private serialization.
- Keep the visible screen neutral: animated technology-style scaffold status plus touch feedback only.
- Do not commit generated `build/`, `library/`, `local/`, `temp/`, or user-specific editor state.

---

### Task 1: Repository and Toolchain Baseline

**Files:**
- Create: `.gitignore`
- Create: `package.json`
- Create: `README.md`
- Create: `scripts/check-toolchain.mjs`
- Test: `tests/toolchain.test.mjs`

**Interfaces:**
- Consumes: Windows paths discovered at runtime; no hard dependency on a user profile path.
- Produces: `npm.cmd test`, `npm.cmd run check:toolchain`, and a clean feature branch.

- [ ] **Step 1: Initialize an isolated project history**

Run `git init -b feat/cocos-wechat-scaffold`. The directory is empty and dedicated to this project, so no linked worktree is needed.

- [ ] **Step 2: Write the failing toolchain test**

Create a Node test that imports `discoverToolchain()` and asserts that its returned object has `node`, `wechatCli`, and `cocosCreator` fields, with `node.available === true` and path values represented as strings or `null`.

- [ ] **Step 3: Run the test and verify RED**

Run `node --test tests/toolchain.test.mjs`. Expected: failure because `scripts/check-toolchain.mjs` does not exist.

- [ ] **Step 4: Implement the toolchain probe and project scripts**

Implement `discoverToolchain()` using `process.execPath`, `fs.existsSync`, and a bounded list of common Windows installation paths. Its CLI mode prints JSON and exits successfully even when Creator is absent so installation can be handled separately. Add scripts `test`, `check:toolchain`, `verify:wechat`, and `verify` to `package.json`.

- [ ] **Step 5: Add ignore rules and setup documentation**

Ignore Cocos generated directories, dependency caches, logs, OS files, and generated WeChat output. Document the fixed engine/version/AppID, commands, and current no-story scope.

- [ ] **Step 6: Verify GREEN and commit**

Run `node --test tests/toolchain.test.mjs` and `npm.cmd run check:toolchain`; expect all assertions to pass and valid JSON output. Commit as `chore: bootstrap cocos mini game workspace`.

### Task 2: Core Runtime Contract

**Files:**
- Create: `assets/scripts/core/AppPhase.ts`
- Create: `assets/scripts/core/AppSession.ts`
- Create: `assets/scripts/platform/RuntimePlatform.ts`
- Test: `tests/app-session.test.ts`
- Test: `tests/runtime-platform.test.ts`

**Interfaces:**
- Consumes: no Cocos APIs.
- Produces: `AppPhase = 'cold' | 'booting' | 'ready' | 'failed'`; class `AppSession` with `phase`, `start()`, `ready()`, `fail(message)`, and `snapshot()`; function `detectRuntimePlatform(globalObject): 'wechat' | 'browser' | 'unknown'`.

- [ ] **Step 1: Write failing lifecycle tests**

Test that a new session is `cold`, `start()` changes it to `booting`, `ready()` changes it to `ready`, invalid transitions throw, and `fail('reason')` exposes a non-empty error string.

- [ ] **Step 2: Verify lifecycle RED**

Run `node --test tests/app-session.test.ts`. Expected: module-not-found failure for `AppSession.ts`.

- [ ] **Step 3: Implement the minimal lifecycle**

Implement explicit allowed transitions `cold -> booting -> ready` and `cold|booting -> failed`. `snapshot()` returns a frozen plain object `{ phase, error }`.

- [ ] **Step 4: Verify lifecycle GREEN**

Run `node --test tests/app-session.test.ts`; expect all lifecycle tests to pass.

- [ ] **Step 5: Write failing platform tests**

Test `detectRuntimePlatform({ wx: { getSystemInfoSync() {} } }) === 'wechat'`, `detectRuntimePlatform({ window: {} }) === 'browser'`, and an empty object returns `unknown`.

- [ ] **Step 6: Verify platform RED, implement, and verify GREEN**

Run the platform test before creating the module; then implement capability-based detection without reading a real global during import. Re-run both TypeScript test files and expect all to pass.

- [ ] **Step 7: Commit**

Commit as `feat: add tested runtime foundation`.

### Task 3: Official Cocos Project and Animated Boot Scene

**Files:**
- Create with Cocos: `assets/scenes/Boot.scene`
- Create with Cocos: matching `.meta` files and `settings/` data
- Create: `assets/scripts/app/AppBootstrap.ts`
- Create: `assets/scripts/presentation/SafeAreaLayout.ts`
- Create: `assets/scripts/presentation/AmbientMotion.ts`
- Create: `assets/scripts/presentation/TouchPulse.ts`

**Interfaces:**
- Consumes: `AppSession`, `detectRuntimePlatform` from Task 2.
- Produces: a Boot scene containing `Canvas`, `Camera`, neutral backdrop layers, status label, platform label, ambient animation nodes, and full-screen touch target.

- [ ] **Step 1: Install or locate Cocos Creator 3.8 LTS**

Use the official Cocos Dashboard/Creator distribution. Record the exact executable path in local documentation without committing machine-specific absolute paths.

- [ ] **Step 2: Generate the project with Creator**

Create/open this directory as a 3D TypeScript project so Creator owns `package.json`, `tsconfig.json`, `.scene`, `.meta`, and `settings` serialization. Preserve the tested npm scripts if Creator updates `package.json`.

- [ ] **Step 3: Build the Boot hierarchy in Creator**

Set design resolution to 750 × 1334 portrait. Create a Canvas/Camera, dark blue-violet background, subtle grid/rings, a centered neutral mark, status text, runtime text, ambient animation nodes, and safe-area root. Set Boot as the start scene.

- [ ] **Step 4: Add thin Cocos bridge components**

`AppBootstrap` creates an `AppSession`, advances it through booting to ready, and updates labels. `SafeAreaLayout` applies `view.getSafeAreaRect()` offsets. `AmbientMotion` loops rotation/opacity/scale via Cocos tween. `TouchPulse` reuses a short ring pulse at the touch position.

- [ ] **Step 5: Run Creator preview**

Preview at representative 9:16 and tall-screen dimensions. Expected: no console errors, visible “框架运行正常”, continuous subtle motion, and touch feedback inside the safe area.

- [ ] **Step 6: Commit**

Commit as `feat: add portrait animated boot scene`.

### Task 4: WeChat Build Contract and AppID Verification

**Files:**
- Create: `scripts/verify-wechat-build.mjs`
- Test: `tests/verify-wechat-build.test.mjs`
- Generate (ignored): `build/wechatgame/project.config.json`
- Generate (ignored): `build/wechatgame/game.json`

**Interfaces:**
- Consumes: a build-directory path argument and generated JSON files.
- Produces: `verifyWeChatBuild(root, expectedAppId)` returning `{ appid, compileType, orientation, entryFiles, packageBytes, packageLimitBytes }`, or throwing a precise validation error.

- [ ] **Step 1: Write the failing verifier tests**

Use temporary fixture directories to cover a valid configuration, a wrong AppID, a non-game compile type, non-portrait orientation, missing entry files, and an oversized main package. The valid fixture uses `appid: 'wx79a1c555206206f6'`, `compileType: 'game'`, and `deviceOrientation: 'portrait'`.

- [ ] **Step 2: Verify RED**

Run `node --test tests/verify-wechat-build.test.mjs`. Expected: module-not-found failure for the verifier.

- [ ] **Step 3: Implement and verify GREEN**

Read JSON with actionable parse/path errors; validate the exact AppID, compile type, orientation, presence of `game.js` plus `game.json`, and a conservative 4 MiB generated-directory budget. Run the verifier tests and the full test suite.

- [ ] **Step 4: Configure and build in Creator**

Choose the WeChat Mini Game platform, portrait orientation, Boot start scene, output `build/wechatgame`, and AppID `wx79a1c555206206f6`. Use an explicit build-time engine-feature whitelist so unused 3D physics and skeletal runtimes do not enter this neutral shell. Build without uploading or publishing.

- [ ] **Step 5: Verify the generated build**

Run `npm.cmd run verify:wechat -- build/wechatgame`; expect a zero exit code and a summary showing the exact AppID, game compile type, portrait orientation, required entry files, package bytes, and 4 MiB limit.

- [ ] **Step 6: Commit**

Commit source/settings only as `build: configure wechat mini game target`.

### Task 5: Developer-Tools Import and Handoff

**Files:**
- Modify: `README.md`
- Create: `docs/verification/first-mobile-preview.md`

**Interfaces:**
- Consumes: verified `build/wechatgame` and the installed WeChat Developer Tools CLI.
- Produces: reproducible import/open steps and captured verification facts; no upload or publish side effects.

- [ ] **Step 1: Import/open the generated project**

Use the installed WeChat Developer Tools CLI to import or open the absolute `build/wechatgame` directory. Do not upload, publish, or automate account login.

- [ ] **Step 2: Record automated evidence**

Record Creator version, Node test totals, WeChat verifier output, Developer Tools import result, and any remaining QR-login boundary in `docs/verification/first-mobile-preview.md`.

- [ ] **Step 3: Run the full verification**

Run `npm.cmd run verify`, inspect `git status --short`, and confirm generated directories are ignored. Expected: all tests pass, toolchain/build checks pass, and only intended source/docs/settings changes are tracked.

- [ ] **Step 4: Commit**

Commit as `docs: add first mobile preview handoff`.

### Post-review hardening: WeChat main-package budget

- [x] Add a failing fixture proving an oversized generated package is rejected.
- [x] Add explicit lightweight engine-module whitelists to the WeChat and browser smoke builds.
- [x] Rebuild with Creator 3.8.8 and verify the generated WeChat directory is below 4 MiB.
- [x] Re-run the two-size browser animation, touch, resize, and safe-area smoke test with the same module whitelist.
