import { _decorator, Component, Director, director } from 'cc';
import { EDITOR } from 'cc/env';
import { OfficeBootstrap } from '../office/OfficeBootstrap.ts';

const { ccclass } = _decorator;

/** Compatibility entry point that hands the existing Boot scene to the office runtime. */
@ccclass('AppBootstrap')
export class AppBootstrap extends Component {
  start(): void {
    if (!this.node.getComponent(OfficeBootstrap)) this.node.addComponent(OfficeBootstrap);
  }
}

// Creator imports project scripts before the official scene launches. Attach
// only after Boot.scene is active so the serialized Canvas remains the owner.
if (!EDITOR) {
  director.on(Director.EVENT_AFTER_SCENE_LAUNCH, () => {
    const canvas = director.getScene()?.getChildByName('Canvas');
    if (canvas && !canvas.getComponent(AppBootstrap)) canvas.addComponent(AppBootstrap);
  });
}
