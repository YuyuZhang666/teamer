import { _decorator, Component, Vec3 } from 'cc';
import type { OfficeNpcMotionKind } from './OfficeNpcPlan.ts';
import { normalizeNpcPhase, sampleOfficeNpcMotion } from './OfficeNpcMotionModel.ts';

const { ccclass } = _decorator;

@ccclass('OfficeNpcMotion')
export class OfficeNpcMotion extends Component {
  private kind: OfficeNpcMotionKind = 'typing';
  private phaseOffset = 0;
  private elapsed = 0;
  private basePosition = new Vec3();

  configure(kind: OfficeNpcMotionKind, phaseOffset: number): void {
    this.kind = kind;
    this.phaseOffset = normalizeNpcPhase(phaseOffset);
    this.basePosition.set(this.node.position);
    this.elapsed = 0;
  }

  update(deltaTime: number): void {
    this.elapsed += Math.max(0, deltaTime);
    const pose = sampleOfficeNpcMotion(this.kind, this.elapsed, this.phaseOffset);
    this.node.setPosition(
      this.basePosition.x + pose.offsetX,
      this.basePosition.y + pose.offsetY,
      this.basePosition.z + pose.offsetZ,
    );
    const visual = this.node.getChildByName('Visual');
    visual?.setRotationFromEuler(pose.bodyPitch, pose.bodyYaw, pose.bodyRoll);
    visual?.getChildByName('ArmLeft')?.setRotationFromEuler(pose.armPitch, 0, 0);
    visual?.getChildByName('ArmRight')?.setRotationFromEuler(-pose.armPitch * 0.85, 0, 0);
  }
}

