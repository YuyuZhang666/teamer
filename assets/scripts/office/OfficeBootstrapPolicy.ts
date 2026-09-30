export const OFFICE_WORLD_MARKER = 'OfficeWorld';

export function shouldBuildOfficeWorld(childNames: readonly string[]): boolean {
  return !childNames.includes(OFFICE_WORLD_MARKER);
}
