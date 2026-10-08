import {
  _decorator,
  Camera,
  Component,
  EventTouch,
  input,
  Input,
  Vec3,
  view,
} from 'cc';
import {
  OFFICE_CAMERA_POSES,
  reduceOfficeExploreCamera,
  sampleOfficeTouchGesture,
  type OfficeCameraPose,
  type OfficeExploreCameraState,
} from './OfficeCameraModel.ts';

const { ccclass } = _decorator;

@ccclass('OfficeExploreCamera')
export class OfficeExploreCamera extends Component {
  private camera: Camera | null = null;
  private cameraOffset = new Vec3();
  private targetY = 0.4;
  private interactive = false;
  private state: Readonly<OfficeExploreCameraState> = Object.freeze({
    targetX: 0,
    targetZ: 0,
    orthoHeight: OFFICE_CAMERA_POSES.settle.orthoHeight,
  });

  configure(
    camera: Camera,
    pose: Readonly<OfficeCameraPose> = OFFICE_CAMERA_POSES.settle,
  ): void {
    this.camera = camera;
    this.targetY = pose.target[1];
    this.cameraOffset.set(
      pose.position[0] - pose.target[0],
      pose.position[1] - pose.target[1],
      pose.position[2] - pose.target[2],
    );
    this.state = Object.freeze({
      targetX: pose.target[0],
      targetZ: pose.target[2],
      orthoHeight: pose.orthoHeight,
    });
  }

  setInteractive(interactive: boolean): void {
    this.interactive = interactive;
    if (interactive) this.applyState();
  }

  onEnable(): void {
    input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
  }

  onDisable(): void {
    input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
  }

  private readonly onTouchMove = (event: EventTouch): void => {
    if (!this.interactive || !this.camera) return;
    const touches = event.getTouches().slice(0, 2);
    const current = touches.map((touch) => {
      const point = touch.getLocation();
      return [point.x, point.y] as const;
    });
    const previous = touches.map((touch) => {
      const point = touch.getPreviousLocation();
      return [point.x, point.y] as const;
    });
    const gesture = sampleOfficeTouchGesture(current, previous);
    const visibleHeight = Math.max(1, view.getVisibleSize().height);
    const worldPerPixel = (this.state.orthoHeight * 2) / visibleHeight;
    const right = this.camera.node.right;
    const cameraUp = this.camera.node.up;
    const planarUpLength = Math.hypot(cameraUp.x, cameraUp.z) || 1;
    const planarUpX = cameraUp.x / planarUpLength;
    const planarUpZ = cameraUp.z / planarUpLength;
    this.state = reduceOfficeExploreCamera(this.state, {
      panWorldX: -(gesture.panX * right.x + gesture.panY * planarUpX) * worldPerPixel,
      panWorldZ: -(gesture.panX * right.z + gesture.panY * planarUpZ) * worldPerPixel,
      zoomScale: gesture.zoomScale,
    });
    this.applyState();
  };

  private applyState(): void {
    if (!this.camera) return;
    const target = new Vec3(this.state.targetX, this.targetY, this.state.targetZ);
    this.camera.node.setPosition(
      target.x + this.cameraOffset.x,
      target.y + this.cameraOffset.y,
      target.z + this.cameraOffset.z,
    );
    this.camera.node.lookAt(target);
    this.camera.orthoHeight = this.state.orthoHeight;
  }
}
