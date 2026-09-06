import { _decorator, Color, Component, EventTouch, Graphics, Layers, Node, tween, Tween, UIOpacity, UITransform, Vec3 } from 'cc';

const { ccclass } = _decorator;

/** One reusable pulse on a full-screen touch target, including rapid taps. */
@ccclass('TouchPulse')
export class TouchPulse extends Component {
  private ring: Node | null = null;

  onLoad(): void {
    this.ring = new Node('TouchRing');
    this.ring.layer = Layers.Enum.UI_2D;
    this.node.addChild(this.ring);
    this.ring.addComponent(UITransform).setContentSize(100, 100);
    const graphics = this.ring.addComponent(Graphics);
    graphics.strokeColor = new Color(144, 210, 245, 210);
    graphics.lineWidth = 2;
    graphics.circle(0, 0, 36);
    graphics.stroke();
    this.ring.addComponent(UIOpacity).opacity = 0;
  }

  onEnable(): void {
    this.node.on(Node.EventType.TOUCH_START, this.showPulse, this);
  }

  onDisable(): void {
    this.node.off(Node.EventType.TOUCH_START, this.showPulse, this);
    if (!this.ring) return;
    Tween.stopAllByTarget(this.ring);
    const opacity = this.ring.getComponent(UIOpacity)!;
    Tween.stopAllByTarget(opacity);
    opacity.opacity = 0;
  }

  private showPulse(event: EventTouch): void {
    if (!this.ring) return;
    const point = event.getUILocation();
    const position = this.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(point.x, point.y));
    const opacity = this.ring.getComponent(UIOpacity)!;
    Tween.stopAllByTarget(this.ring);
    Tween.stopAllByTarget(opacity);
    this.ring.setPosition(position);
    this.ring.setScale(0.25, 0.25, 1);
    opacity.opacity = 220;
    tween(this.ring).to(0.55, { scale: new Vec3(1.6, 1.6, 1) }, { easing: 'quadOut' }).start();
    tween(opacity).to(0.55, { opacity: 0 }, { easing: 'quadOut' }).start();
  }
}
