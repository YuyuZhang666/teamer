import type { Camera, Node } from 'cc';
import { OfficeBootstrap } from '../../assets/scripts/office/OfficeBootstrap.ts';
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
