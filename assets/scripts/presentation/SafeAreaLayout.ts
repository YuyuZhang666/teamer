import { _decorator, Component, sys, UITransform, view } from 'cc';

const { ccclass } = _decorator;

/** Positions a centered UI root inside the platform safe area (design units). */
@ccclass('SafeAreaLayout')
export class SafeAreaLayout extends Component {
  onEnable(): void {
    view.on('canvas-resize', this.applyLayout, this);
    this.applyLayout();
  }

  onDisable(): void {
    view.off('canvas-resize', this.applyLayout, this);
  }

  private applyLayout(): void {
    const safe = sys.getSafeAreaRect(false);
    const transform = this.getComponent(UITransform);
    if (!transform) return;
    const visible = view.getVisibleSize();
    const origin = view.getVisibleOrigin();
    transform.setContentSize(safe.width, safe.height);
    // Canvas is centered on the visible view. Its Widget may still have the old
    // world position during canvas-resize, so use current view coordinates.
    this.node.setPosition(
      safe.x + safe.width / 2 - origin.x - visible.width / 2,
      safe.y + safe.height / 2 - origin.y - visible.height / 2,
      0,
    );
  }
}
