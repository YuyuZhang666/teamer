import type { OfficeZoneId } from './OfficeLayout.ts';

export interface OfficeIllustrationViewportState {
  readonly offsetX: number;
  readonly offsetY: number;
  readonly scale: number;
}

export interface OfficeIllustrationGesture {
  readonly panX: number;
  readonly panY: number;
  readonly zoomScale: number;
}

export interface OfficeIllustrationLabel {
  readonly id: OfficeZoneId;
  readonly text: string;
  readonly x: number;
  readonly y: number;
}

export const OFFICE_ILLUSTRATION_SIZE = Object.freeze({
  width: 750,
  height: 1334,
});

export const OFFICE_ILLUSTRATION_LIMITS = Object.freeze({
  minScale: 1,
  maxScale: 3.2,
});

export const OFFICE_ILLUSTRATION_TEXTURE_PATH = 'office-art/office-master-v2/texture';

export const OFFICE_ILLUSTRATION_LABELS: readonly Readonly<OfficeIllustrationLabel>[] = Object.freeze([
  Object.freeze({ id: 'break-area', text: '厕所 / 摸鱼区', x: -270, y: 500 }),
  Object.freeze({ id: 'pantry', text: '茶水间', x: -25, y: 505 }),
  Object.freeze({ id: 'boss-office', text: '老板办公室', x: 245, y: 500 }),
  Object.freeze({ id: 'open-office', text: '开放办公区', x: -85, y: 90 }),
  Object.freeze({ id: 'meeting-room', text: '会议室', x: 255, y: 135 }),
  Object.freeze({ id: 'elevator', text: '电梯', x: -255, y: -470 }),
  Object.freeze({ id: 'reception', text: '公司入口 / 前台', x: 90, y: -455 }),
]);

const finiteOr = (value: number, fallback: number): number => (
  Number.isFinite(value) ? value : fallback
);

const clamp = (value: number, minimum: number, maximum: number): number => {
  const clamped = Math.max(minimum, Math.min(maximum, value));
  return clamped === 0 ? 0 : clamped;
};

export interface OfficeIllustrationIntroTransform {
  readonly scale: number;
  readonly offsetY: number;
}

export function officeIllustrationIntroTransform(
  elapsedSeconds: number,
): Readonly<OfficeIllustrationIntroTransform> {
  const progress = clamp(finiteOr(elapsedSeconds, 0), 0, 16) / 16;
  return Object.freeze({
    scale: Math.round((1.08 - progress * 0.08) * 1000) / 1000,
    offsetY: Math.round((-24 + progress * 24) * 1000) / 1000,
  });
}

export function reduceOfficeIllustrationViewport(
  state: Readonly<OfficeIllustrationViewportState>,
  gesture: Readonly<OfficeIllustrationGesture>,
): Readonly<OfficeIllustrationViewportState> {
  const currentScale = clamp(
    finiteOr(state.scale, OFFICE_ILLUSTRATION_LIMITS.minScale),
    OFFICE_ILLUSTRATION_LIMITS.minScale,
    OFFICE_ILLUSTRATION_LIMITS.maxScale,
  );
  const requestedZoom = Number.isFinite(gesture.zoomScale) && gesture.zoomScale > 0
    ? gesture.zoomScale
    : 1;
  const scale = clamp(
    currentScale * requestedZoom,
    OFFICE_ILLUSTRATION_LIMITS.minScale,
    OFFICE_ILLUSTRATION_LIMITS.maxScale,
  );
  const maxOffsetX = OFFICE_ILLUSTRATION_SIZE.width * (scale - 1) / 2;
  const maxOffsetY = OFFICE_ILLUSTRATION_SIZE.height * (scale - 1) / 2;
  const panX = finiteOr(gesture.panX, 0);
  const panY = finiteOr(gesture.panY, 0);

  return Object.freeze({
    offsetX: clamp(finiteOr(state.offsetX, 0) + panX, -maxOffsetX, maxOffsetX),
    offsetY: clamp(finiteOr(state.offsetY, 0) + panY, -maxOffsetY, maxOffsetY),
    scale,
  });
}
