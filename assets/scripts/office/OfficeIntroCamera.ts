import { _decorator, Camera, Component, Vec3 } from 'cc';
import {
  OFFICE_CAMERA_POSES,
  OfficeIntroState,
  sampleOfficeCameraPose,
  type OfficeCameraPose,
} from './OfficeCameraModel.ts';
import type { OfficeIntroShotId } from './OfficeIntroTimeline.ts';

const { ccclass } = _decorator;

export type OfficeIntroListener = (elapsedSeconds: number, complete: boolean) => void;

@ccclass('OfficeIntroCamera')
export class OfficeIntroCamera extends Component {
  private camera: Camera | null = null;
  private poses: Readonly<Record<OfficeIntroShotId, Readonly<OfficeCameraPose>>> = OFFICE_CAMERA_POSES;
  private readonly state = new OfficeIntroState();
  private listener: OfficeIntroListener | undefined;
  private playing = false;

  get isComplete(): boolean {
    return this.state.isComplete;
  }

  configure(
    camera: Camera,
    poses: Readonly<Record<OfficeIntroShotId, Readonly<OfficeCameraPose>>> = OFFICE_CAMERA_POSES,
    listener?: OfficeIntroListener,
  ): void {
    this.camera = camera;
    this.poses = poses;
    this.listener = listener;
    this.applyCurrentPose();
  }

  play(): void {
    this.state.reset();
    this.playing = true;
    this.applyCurrentPose();
  }

  skip(): void {
    if (!this.state.skip()) return;
    this.playing = false;
    this.applyCurrentPose();
  }

  update(deltaTime: number): void {
    if (!this.playing || !this.camera) return;
    this.state.advance(deltaTime);
    this.applyCurrentPose();
    if (this.state.isComplete) this.playing = false;
  }

  private applyCurrentPose(): void {
    if (!this.camera) return;
    const sample = sampleOfficeCameraPose(this.state.elapsedSeconds, this.poses);
    this.camera.node.setPosition(...sample.pose.position);
    this.camera.node.lookAt(new Vec3(...sample.pose.target));
    this.camera.orthoHeight = sample.pose.orthoHeight;
    this.listener?.(this.state.elapsedSeconds, sample.complete);
  }
}
