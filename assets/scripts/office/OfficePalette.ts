export type OfficePaletteKey =
  | 'background'
  | 'wall'
  | 'floor'
  | 'wood'
  | 'walnut'
  | 'blueGray'
  | 'brand'
  | 'yellow'
  | 'coral'
  | 'plant'
  | 'mint'
  | 'glass'
  | 'shadow'
  | 'ink'
  | 'skin'
  | 'white';

export const OFFICE_PALETTE: Readonly<Record<OfficePaletteKey, string>> = Object.freeze({
  background: '#DCEAF0',
  wall: '#F3EFE7',
  floor: '#E9D9C1',
  wood: '#D6B58A',
  walnut: '#825C42',
  blueGray: '#9DAEB8',
  brand: '#2E6F78',
  yellow: '#F2B84B',
  coral: '#D97861',
  plant: '#5F8F62',
  mint: '#A8C7B2',
  glass: '#90BFD0AA',
  shadow: '#2637412E',
  ink: '#263741',
  skin: '#EDC7A5',
  white: '#FFFFFF',
});

