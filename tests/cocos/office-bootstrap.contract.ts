import type { Camera, Node } from 'cc';
import { OfficeBootstrap } from '../../assets/scripts/office/OfficeBootstrap.ts';
import { OfficeExploreCamera } from '../../assets/scripts/office/OfficeExploreCamera.ts';
import { OfficeIllustratedView, type OfficeIllustratedHandles } from '../../assets/scripts/office/OfficeIllustratedView.ts';
import { OfficeHud, type OfficeHudHandles } from '../../assets/scripts/office/OfficeHud.ts';
import { OfficeIntroCamera } from '../../assets/scripts/office/OfficeIntroCamera.ts';
import { OFFICE_CAMERA_POSES } from '../../assets/scripts/office/OfficeCameraModel.ts';

export function configureIntroContract(
  intro: OfficeIntroCamera,
  camera: Camera,
  hud: OfficeHud,
  canvas: Node,
): OfficeHudHandles {
  const handles = hud.build(canvas);
  intro.configure(camera, OFFICE_CAMERA_POSES);
  intro.play();
  intro.skip();
  intro.isComplete;
  OfficeBootstrap;
  return handles;
}

export function configureExploreContract(
  explore: OfficeExploreCamera,
  camera: Camera,
): void {
  explore.configure(camera, OFFICE_CAMERA_POSES.settle);
  explore.setInteractive(true);
  explore.setInteractive(false);
}

export function configureIllustratedViewContract(
  canvas: Node,
): OfficeIllustratedHandles {
  const illustrated = new OfficeIllustratedView();
  const handles = illustrated.build(canvas, (_ready) => undefined);
  illustrated.setIntroTime(8);
  illustrated.setInteractive(true);
  illustrated.setVisible(true);
  illustrated.dispose();
  return handles;
}
