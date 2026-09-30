import {
  Color,
  Label,
  Layers,
  Node,
  UITransform,
  UIOpacity,
  Widget,
} from 'cc';
import { SafeAreaLayout } from '../presentation/SafeAreaLayout.ts';
import { officeHudOpacityAt } from './OfficeHudModel.ts';

export interface OfficeHudHandles {
  readonly root: Node;
  readonly title: Label;
  readonly subtitle: Label;
  readonly skipTarget: Node;
  readonly setIntroTime: (elapsedSeconds: number) => void;
  readonly complete: () => void;
}

export class OfficeHud {
  build(canvas: Node): OfficeHudHandles {
    const root = this.uiNode('OfficeHud', canvas, 750, 1334);
    root.addComponent(SafeAreaLayout);
    const title = this.label('OfficeTitle', root, '准点科技', 46, 430, new Color(38, 55, 65));
    const subtitle = this.label('OfficeSubtitle', root, '认真上班，开心下班', 24, 372, new Color(46, 111, 120));
    const opacity = root.addComponent(UIOpacity);
    opacity.opacity = 0;

    const skipTarget = this.uiNode('IntroSkipTarget', canvas, 750, 1334);
    const widget = skipTarget.addComponent(Widget);
    widget.isAlignTop = widget.isAlignBottom = widget.isAlignLeft = widget.isAlignRight = true;
    widget.top = widget.bottom = widget.left = widget.right = 0;
    widget.alignMode = Widget.AlignMode.ALWAYS;
    widget.updateAlignment();

    const setIntroTime = (elapsedSeconds: number): void => {
      opacity.opacity = Math.round(officeHudOpacityAt(elapsedSeconds) * 255);
      skipTarget.active = elapsedSeconds < 16;
    };
    const complete = (): void => {
      opacity.opacity = 0;
      skipTarget.active = false;
    };

    return Object.freeze({ root, title, subtitle, skipTarget, setIntroTime, complete });
  }

  private uiNode(name: string, parent: Node, width: number, height: number): Node {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    parent.addChild(node);
    node.addComponent(UITransform).setContentSize(width, height);
    return node;
  }

  private label(
    name: string,
    parent: Node,
    text: string,
    fontSize: number,
    y: number,
    labelColor: Color,
  ): Label {
    const node = this.uiNode(name, parent, 620, fontSize * 1.6);
    node.setPosition(0, y);
    const label = node.addComponent(Label);
    label.string = text;
    label.fontSize = fontSize;
    label.lineHeight = Math.round(fontSize * 1.3);
    label.color = labelColor;
    label.horizontalAlign = Label.HorizontalAlign.CENTER;
    label.verticalAlign = Label.VerticalAlign.CENTER;
    label.overflow = Label.Overflow.SHRINK;
    return label;
  }
}
