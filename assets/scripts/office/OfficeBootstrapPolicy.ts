export const OFFICE_WORLD_MARKER = 'OfficeWorld';

export function shouldBuildOfficeWorld(childNames: readonly string[]): boolean {
  return !childNames.includes(OFFICE_WORLD_MARKER);
}

export type OfficePresentation = 'procedural' | 'illustrated';

export function selectOfficePresentation(illustrationReady: boolean): OfficePresentation {
  return illustrationReady ? 'illustrated' : 'procedural';
}
