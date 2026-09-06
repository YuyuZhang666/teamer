import { _decorator, Camera, Color, Component, Director, director, Graphics, Label, Layers, Node, ResolutionPolicy, UITransform, view, Widget } from 'cc';
import { EDITOR } from 'cc/env';
import { AppSession } from '../core/AppSession';
import { detectRuntimePlatform } from '../platform/RuntimePlatform';
import { AmbientMotion } from '../presentation/AmbientMotion';
import { SafeAreaLayout } from '../presentation/SafeAreaLayout';
import { TouchPulse } from '../presentation/TouchPulse';

const { ccclass } = _decorator;

/** Thin engine bridge: builds the neutral shell and presents the tested session. */
@ccclass('AppBootstrap')
export class AppBootstrap extends Component {
  private readonly session = new AppSession();

  start(): void {
    view.setDesignResolutionSize(750, 1334, ResolutionPolicy.FIXED_WIDTH);
    this.node.getComponent(Widget)?.updateAlignment();
    const camera = this.node.getChildByName('Camera')?.getComponent(Camera);
    if (camera) camera.clearColor = new Color(12, 15, 34, 255);
    this.session.start();
    this.buildBackdrop();

    const safeRoot = this.uiNode('SafeArea', this.node, 750, 1334);
    safeRoot.addComponent(SafeAreaLayout);
    this.label('Eyebrow', safeRoot, 'SYSTEM / READY', 18, 302, new Color(129, 146, 180));
    const orbit = this.uiNode('AmbientOrbit', safeRoot, 420, 420);
    orbit.setPosition(0, 80);
    const rings = orbit.addComponent(Graphics);
    rings.lineWidth = 1.5;
    rings.strokeColor = new Color(103, 120, 193, 90);
    rings.circle(0, 0, 164);
    rings.stroke();
    rings.strokeColor = new Color(118, 182, 208, 125);
    rings.arc(0, 0, 142, 0.1, 2.3, false);
    rings.stroke();
    rings.circle(159, 39, 4);
    rings.stroke();
    orbit.addComponent(AmbientMotion);

    const mark = this.uiNode('NeutralMark', safeRoot, 180, 180);
    mark.setPosition(0, 80);
    const ink = mark.addComponent(Graphics);
    ink.lineWidth = 3;
    ink.strokeColor = new Color(185, 206, 235);
    ink.moveTo(0, 54); ink.lineTo(47, 27); ink.lineTo(47, -27);
    ink.lineTo(0, -54); ink.lineTo(-47, -27); ink.lineTo(-47, 27); ink.close(); ink.stroke();
    ink.moveTo(-18, 0); ink.lineTo(18, 0); ink.moveTo(0, -18); ink.lineTo(0, 18); ink.stroke();

    const status = this.label('Status', safeRoot, '正在初始化', 34, -182, new Color(224, 233, 248));
    const names = { browser: '浏览器', wechat: '微信', unknown: '未知平台' };
    this.label('Platform', safeRoot, `运行平台 · ${names[detectRuntimePlatform(globalThis)]}`, 21, -244, new Color(141, 155, 187));
    this.label('TouchHint', safeRoot, '轻触屏幕，感受响应', 19, -344, new Color(105, 123, 157));

    const touch = this.uiNode('TouchTarget', this.node, 750, 1334);
    this.stretch(touch);
    touch.addComponent(TouchPulse);
    this.scheduleOnce(() => {
      this.session.ready();
      status.string = '框架运行正常';
    }, 0.65);
  }

  private buildBackdrop(): void {
    const backdrop = this.uiNode('Backdrop', this.node, 750, 1334);
    const graphics = backdrop.addComponent(Graphics);
    const draw = (): void => {
      const { width, height } = view.getVisibleSize();
      backdrop.getComponent(UITransform)!.setContentSize(width, height);
      graphics.clear();
      graphics.fillColor = new Color(12, 15, 34);
      graphics.rect(-width / 2, -height / 2, width, height); graphics.fill();
      graphics.lineWidth = 1;
      graphics.strokeColor = new Color(73, 85, 139, 24);
      for (let x = -width / 2; x <= width / 2; x += 62.5) {
        graphics.moveTo(x, -height / 2); graphics.lineTo(x, height / 2);
      }
      for (let y = -height / 2; y <= height / 2; y += 62.5) {
        graphics.moveTo(-width / 2, y); graphics.lineTo(width / 2, y);
      }
      graphics.stroke();
      graphics.strokeColor = new Color(94, 90, 165, 35);
      graphics.circle(width / 2, height / 2, 340); graphics.stroke();
      graphics.circle(-width / 2, -height / 2, 270); graphics.stroke();
    };
    draw();
    view.on('canvas-resize', draw, this);
    this.node.once(Node.EventType.NODE_DESTROYED, () => view.off('canvas-resize', draw, this));
  }

  private uiNode(name: string, parent: Node, width: number, height: number): Node {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    parent.addChild(node);
    node.addComponent(UITransform).setContentSize(width, height);
    return node;
  }

  private label(name: string, parent: Node, text: string, size: number, y: number, color: Color): Label {
    const node = this.uiNode(name, parent, 640, size * 1.8);
    node.setPosition(0, y);
    const label = node.addComponent(Label);
    label.string = text;
    label.fontSize = size;
    label.lineHeight = size * 1.4;
    label.color = color;
    label.horizontalAlign = Label.HorizontalAlign.CENTER;
    label.verticalAlign = Label.VerticalAlign.CENTER;
    label.overflow = Label.Overflow.SHRINK;
    return label;
  }

  private stretch(node: Node): void {
    const widget = node.addComponent(Widget);
    widget.isAlignTop = widget.isAlignBottom = widget.isAlignLeft = widget.isAlignRight = true;
    widget.top = widget.bottom = widget.left = widget.right = 0;
    widget.alignMode = Widget.AlignMode.ALWAYS;
    widget.updateAlignment();
  }
}

// Creator imports every project script through its prerequisite module. Wait for
// the official scene to launch before attaching the runtime-built shell.
if (!EDITOR) {
  director.on(Director.EVENT_AFTER_SCENE_LAUNCH, () => {
    const scene = director.getScene();
    const canvas = scene?.getChildByName('Canvas');
    if (canvas && !canvas.getComponent(AppBootstrap)) {
      canvas.addComponent(AppBootstrap);
    }
  });
}
