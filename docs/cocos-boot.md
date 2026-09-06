# Cocos boot shell

Open the repository with Cocos Creator 3.8.8. The project retains the default 3D
engine modules for future stylized 3D and skeletal animation. The only scene is
`assets/scenes/Boot.scene`, so Creator selects it as the launch scene.

Boot was seeded from the installed 3.8.8 official `scene-2d.scene` template.
Creator imported it and generated its project identity, resource metadata, and
settings. Its internal template scene name is intentionally left editor-owned.

The runtime shell is constructed by `AppBootstrap`: Creator's generated
prerequisite imports load this module, which attaches the component to the
scene's Canvas after scene launch. Duplicate attachment is prevented by checking
the existing component. If more scenes are introduced, explicitly scope this
launch hook to Boot before adding additional Canvas scenes. The decorative
hierarchy appears in Play/build, rather than in the scene editor before Play.

The design resolution is 750 x 1334 with fixed width. `SafeAreaLayout` uses
`sys.getSafeAreaRect(false)` (the actual Creator 3.8.8 API), which already returns
design-space coordinates, and offsets its center from the current visible-view
center. This remains correct while the Canvas Widget updates during resizing.
The background and touch target cover the visible screen; text and the neutral
mark are centered in the safe area. No external art, gameplay, or story content
is included.

## Build and verify

Set `COCOS_CREATOR_PATH` to the locally installed 3.8.8 executable, then run:

```powershell
npm.cmd test
./scripts/build-web-mobile.ps1
```

The helper also accepts `-CreatorPath`. Machine-specific paths are not stored
in project files. Creator CLI reports successful builds with exit code **36**.
Logs are written under `temp/creator-web-mobile*.log`; the launch page is
`build/web-mobile/index.html` and must be served over local HTTP for browser use.
The checked-in web build configuration disables the FPS overlay by producing a
non-debug build. No WeChat upload or publishing is performed by this helper.

After Creator has imported the project, its bundled TypeScript compiler can
check `tsconfig.json` with `--skipLibCheck`. Pure lifecycle/platform tests are
also included in `npm.cmd test`.

Browser integration verification covers 375 x 667 and 390 x 844 CSS pixels,
the ready/platform labels, changing ambient rotation, real touch input and
pulse fade, plus browser exceptions and console errors. Platform safe-area
insets on a physical WeChat device remain a subsequent device validation step.
