import { drawingAtFrame } from './project';
import { paintStroke } from './strokes';
import type { OnionSettings, Scene } from './types';

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function tintedStrokeColor(base: string, tint: string, strength = 0.55): string {
  const a = hexToRgb(base.startsWith('#') ? base : '#cccccc');
  const t = hexToRgb(tint);
  const r = Math.round(a.r * (1 - strength) + t.r * strength);
  const g = Math.round(a.g * (1 - strength) + t.g * strength);
  const b = Math.round(a.b * (1 - strength) + t.b * strength);
  return `rgb(${r},${g},${b})`;
}

export function renderScene(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  frame: number,
  onion: OnionSettings,
  activeLayerId: string | null,
): void {
  const { width, height } = scene;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = scene.backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Checkerboard hint for empty feel
  drawSubtleGrid(ctx, width, height);

  if (onion.enabled) {
    for (let i = onion.before; i >= 1; i--) {
      const f = frame - i;
      if (f < 0) continue;
      const alpha = Math.pow(onion.falloff, i) * 0.55;
      paintFrame(ctx, scene, f, onion.beforeTint, alpha, true);
    }
    for (let i = 1; i <= onion.after; i++) {
      const f = frame + i;
      if (f >= scene.durationFrames) continue;
      const alpha = Math.pow(onion.falloff, i) * 0.55;
      paintFrame(ctx, scene, f, onion.afterTint, alpha, true);
    }
  }

  paintFrame(ctx, scene, frame, null, 1, false);

  // Active layer outline cue — none; keep clean
  void activeLayerId;
}

function paintFrame(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  frame: number,
  tint: string | null,
  alphaMul: number,
  isOnion: boolean,
): void {
  for (const layer of scene.layers) {
    if (!layer.visible) continue;
    const channel = scene.channels.find((c) => c.layerId === layer.id && c.path === 'frames');
    if (!channel) continue;
    const drawing = drawingAtFrame(channel, frame);
    ctx.save();
    ctx.globalAlpha = layer.opacity * alphaMul;
    for (const stroke of drawing.strokes) {
      if (isOnion && stroke.erase) continue;
      const color = tint ? tintedStrokeColor(stroke.color, tint) : undefined;
      paintStroke(ctx, stroke, color, 1);
    }
    ctx.restore();
  }
}

function drawSubtleGrid(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  const step = 40;
  for (let x = 0; x <= w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
    ctx.stroke();
  }
  ctx.restore();
}

/** Flat bitmap for GIF — no onion, no grid */
export function renderFrameToImageData(
  scene: Scene,
  frame: number,
): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = scene.width;
  canvas.height = scene.height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = scene.backgroundColor;
  ctx.fillRect(0, 0, scene.width, scene.height);
  paintFrame(ctx, scene, frame, null, 1, false);
  return ctx.getImageData(0, 0, scene.width, scene.height);
}
