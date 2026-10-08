import {
  Color,
  EventTouch,
  Graphics,
  input,
  Input,
  Label,
  Layers,
  Node,
  resources,
  Sprite,
  SpriteFrame,
  Texture2D,
  UITransform,
  view,
} from 'cc';
import { sampleOfficeTouchGesture } from './OfficeCameraModel.ts';
import {
  OFFICE_ILLUSTRATION_LABELS,
  OFFICE_ILLUSTRATION_SIZE,
  OFFICE_ILLUSTRATION_TEXTURE_PATH,
  officeIllustrationIntroTransform,
  reduceOfficeIllustrationViewport,
  type OfficeIllustrationViewportState,
} from './OfficeIllustrationModel.ts';

export interface OfficeIllustratedHandles {
  readonly root: Node;
  readonly art: Node;
  readonly sprite: Sprite;
  readonly labels: readonly Label[];
}

export type OfficeIllustrationReady = (ready: boolean) => void;

const initialState = (): Readonly<OfficeIllustrationViewportState> => Object.freeze({
  offsetX: 0,
  offsetY: 0,
  scale: 1,
});

export class OfficeIllustratedView {
  private handles: OfficeIllustratedHandles | null = null;
  private labelNodes: Node[] = [];
  private state = initialState();
  private interactive = false;
  private visible = true;
  private loaded = false;
  private generation = 0;
  private introTime = 0;
  private runtimeSpriteFrame: SpriteFrame | null = null;

  build(canvas: Node, onReady: OfficeIllustrationReady): OfficeIllustratedHandles {
    if (this.handles) return this.handles;

    const root = this.uiNode('OfficeIllustratedScene', canvas, OFFICE_ILLUSTRATION_SIZE.width, OFFICE_ILLUSTRATION_SIZE.height);
    root.active = false;
    root.setSiblingIndex(0);

    const art = this.uiNode('OfficeIllustrationArt', root, OFFICE_ILLUSTRATION_SIZE.width, OFFICE_ILLUSTRATION_SIZE.height);
    const sprite = art.addComponent(Sprite);
    sprite.sizeMode = Sprite.SizeMode.CUSTOM;
    sprite.trim = false;

    const labels = OFFICE_ILLUSTRATION_LABELS.map((definition) => (
      this.createBadge(art, definition.text, definition.x, definition.y)
    ));
    this.handles = Object.freeze({
      root,
      art,
      sprite,
      labels: Object.freeze(labels),
    });

    input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    const loadGeneration = ++this.generation;
    resources.load(OFFICE_ILLUSTRATION_TEXTURE_PATH, Texture2D, (error, asset) => {
      if (loadGeneration !== this.generation || !this.handles) return;
      if (error || !asset) {
        onReady(false);
        return;
      }
      const spriteFrame = new SpriteFrame();
      spriteFrame.texture = asset;
      this.runtimeSpriteFrame = spriteFrame;
      this.handles.sprite.spriteFrame = spriteFrame;
      this.loaded = true;
      this.handles.root.active = this.visible;
      this.applyState();
      onReady(true);
    });

    return this.handles;
  }

  setInteractive(interactive: boolean): void {
    this.interactive = interactive;
  }

  setIntroTime(elapsedSeconds: number): void {
    this.introTime = elapsedSeconds;
    this.applyState();
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    if (this.handles) this.handles.root.active = visible && this.loaded;
  }

  dispose(): void {
    input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.generation += 1;
    if (this.handles) this.handles.sprite.spriteFrame = null;
    this.runtimeSpriteFrame?.destroy();
    this.runtimeSpriteFrame = null;
    this.handles?.root.destroy();
    this.handles = null;
    this.labelNodes = [];
    this.loaded = false;
    this.interactive = false;
    this.introTime = 0;
    this.state = initialState();
  }

  private readonly onTouchMove = (event: EventTouch): void => {
    if (!this.interactive || !this.loaded || !this.handles) return;
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
    const scaleX = Math.max(0.001, view.getScaleX());
    const scaleY = Math.max(0.001, view.getScaleY());
    this.state = reduceOfficeIllustrationViewport(this.state, {
      panX: gesture.panX / scaleX,
      panY: gesture.panY / scaleY,
      zoomScale: gesture.zoomScale,
    });
    this.applyState();
  };

  private applyState(): void {
    if (!this.handles) return;
    const intro = officeIllustrationIntroTransform(this.introTime);
    const renderedScale = this.state.scale * intro.scale;
    this.handles.art.setPosition(this.state.offsetX, this.state.offsetY + intro.offsetY);
    this.handles.art.setScale(renderedScale, renderedScale, 1);
    const inverseScale = 1 / renderedScale;
    const labelsVisible = this.state.scale < 2.35;
    this.labelNodes.forEach((node) => {
      node.active = labelsVisible;
      node.setScale(inverseScale, inverseScale, 1);
    });
  }

  private createBadge(parent: Node, text: string, x: number, y: number): Label {
    const width = Math.max(118, Math.min(240, text.length * 30 + 36));
    const badge = this.uiNode('ZoneBadge-' + text, parent, width, 48);
    badge.setPosition(x, y);
    this.labelNodes.push(badge);

    const background = this.uiNode('BadgeBackground', badge, width, 48);
    const graphics = background.addComponent(Graphics);
    graphics.fillColor = new Color(24, 60, 78, 232);
    graphics.roundRect(-width / 2, -24, width, 48, 15);
    graphics.fill();

    const labelNode = this.uiNode('BadgeLabel', badge, width - 16, 42);
    const label = labelNode.addComponent(Label);
    label.string = text;
    label.fontSize = 24;
    label.lineHeight = 30;
    label.color = new Color(255, 255, 255, 255);
    label.horizontalAlign = Label.HorizontalAlign.CENTER;
    label.verticalAlign = Label.VerticalAlign.CENTER;
    label.overflow = Label.Overflow.SHRINK;
    return label;
  }

  private uiNode(name: string, parent: Node, width: number, height: number): Node {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    parent.addChild(node);
    node.addComponent(UITransform).setContentSize(width, height);
    return node;
  }
}
