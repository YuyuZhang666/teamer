import { _decorator, Component, tween, Tween, UIOpacity, Vec3 } from 'cc';

const { ccclass } = _decorator;

/** A slow, restrained breathing and orbit cycle; no per-frame allocations. */
@ccclass('AmbientMotion')
export class AmbientMotion extends Component {
  onEnable(): void {
    const opacity = this.getComponent(UIOpacity) ?? this.addComponent(UIOpacity);
    opacity.opacity = 150;
    tween(this.node).by(48, { eulerAngles: new Vec3(0, 0, 360) }).repeatForever().start();
    tween(this.node)
      .to(3.6, { scale: new Vec3(1.035, 1.035, 1) }, { easing: 'sineInOut' })
      .to(3.6, { scale: Vec3.ONE }, { easing: 'sineInOut' }).repeatForever().start();
    tween(opacity).to(3.6, { opacity: 235 }, { easing: 'sineInOut' })
      .to(3.6, { opacity: 150 }, { easing: 'sineInOut' }).repeatForever().start();
  }

  onDisable(): void {
    Tween.stopAllByTarget(this.node);
    const opacity = this.getComponent(UIOpacity);
    if (opacity) Tween.stopAllByTarget(opacity);
    this.node.setScale(Vec3.ONE);
  }
}
