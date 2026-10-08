import {
  _decorator,
  Camera,
  Color,
  Component,
  director,
  Layers,
  Node,
  ResolutionPolicy,
  view,
} from 'cc';
import { AppSession } from '../core/AppSession.ts';
import { detectRuntimePlatform, type RuntimePlatform } from '../platform/RuntimePlatform.ts';
import {
  OFFICE_WORLD_MARKER,
  selectOfficePresentation,
  shouldBuildOfficeWorld,
} from './OfficeBootstrapPolicy.ts';
import { OFFICE_CAMERA_POSES } from './OfficeCameraModel.ts';
import { OfficeExploreCamera } from './OfficeExploreCamera.ts';
import { OfficeHud } from './OfficeHud.ts';
import { OfficeIllustratedView } from './OfficeIllustratedView.ts';
import { OfficeIntroCamera } from './OfficeIntroCamera.ts';
import { OfficeNpcFactory } from './OfficeNpcFactory.ts';
import { OFFICE_NPC_PLAN } from './OfficeNpcPlan.ts';
import { OfficePrimitiveFactory } from './OfficePrimitiveFactory.ts';
import { OfficeSceneBuilder } from './OfficeSceneBuilder.ts';

const { ccclass } = _decorator;

@ccclass('OfficeBootstrap')
export class OfficeBootstrap extends Component {
  private readonly session = new AppSession();
  private platform: RuntimePlatform = 'unknown';

  start(): void {
    view.setDesignResolutionSize(750, 1334, ResolutionPolicy.FIXED_WIDTH);
    const scene = director.getScene();
    if (!scene || !shouldBuildOfficeWorld(scene.children.map(({ name }) => name))) return;

    this.session.start();
    this.platform = detectRuntimePlatform(globalThis);
    this.configureCanvasCamera();

    const primitive = new OfficePrimitiveFactory();
    const handles = new OfficeSceneBuilder(primitive).build(scene);
    handles.world.name = OFFICE_WORLD_MARKER;

    const cameraNode = new Node('OfficeCamera');
    cameraNode.layer = Layers.Enum.DEFAULT;
    scene.addChild(cameraNode);
    const worldCamera = cameraNode.addComponent(Camera);
    worldCamera.projection = Camera.ProjectionType.ORTHO;
    worldCamera.priority = 0;
    worldCamera.clearFlags = Camera.ClearFlag.SOLID_COLOR;
    worldCamera.clearColor = new Color(220, 234, 240, 255);
    worldCamera.visibility = Layers.BitMask.DEFAULT;
    const explore = cameraNode.addComponent(OfficeExploreCamera);
    explore.configure(worldCamera, OFFICE_CAMERA_POSES.settle);
    explore.setInteractive(false);

    const npcFactory = new OfficeNpcFactory(primitive);
    OFFICE_NPC_PLAN.forEach((placement, index) => {
      npcFactory.create(handles.npcRoot, placement, npcFactory.variantFor(index));
    });

    const hud = new OfficeHud().build(this.node);
    let introComplete = false;
    let illustrationReady = false;
    const illustrated = new OfficeIllustratedView();
    illustrated.build(this.node, (ready) => {
      illustrationReady = selectOfficePresentation(ready) === 'illustrated';
      handles.world.active = !illustrationReady;
      illustrated.setVisible(illustrationReady);
      illustrated.setInteractive(introComplete && illustrationReady);
      explore.setInteractive(introComplete && !illustrationReady);
    });
    const intro = cameraNode.addComponent(OfficeIntroCamera);
    intro.configure(worldCamera, OFFICE_CAMERA_POSES, (elapsedSeconds, complete) => {
      hud.setIntroTime(elapsedSeconds);
      illustrated.setIntroTime(elapsedSeconds);
      if (complete) {
        introComplete = true;
        hud.complete();
        illustrated.setInteractive(illustrationReady);
        explore.setInteractive(!illustrationReady);
        if (this.session.phase === 'booting') this.session.ready();
      }
    });
    const skipIntro = (): void => intro.skip();
    hud.skipTarget.on(Node.EventType.TOUCH_END, skipIntro, this);
    this.node.once(Node.EventType.NODE_DESTROYED, () => {
      hud.skipTarget.off(Node.EventType.TOUCH_END, skipIntro, this);
      illustrated.dispose();
    });
    intro.play();
  }

  private configureCanvasCamera(): void {
    const uiCamera = this.node.getChildByName('Camera')?.getComponent(Camera);
    if (!uiCamera) return;
    uiCamera.priority = 1;
    uiCamera.clearFlags = Camera.ClearFlag.DEPTH_ONLY;
    uiCamera.visibility = Layers.BitMask.UI_2D;
  }
}
