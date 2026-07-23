import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import { renderFrameToImageData } from '../core/renderer';
import type { Scene } from '../core/types';

export async function exportGif(scene: Scene, filename = 'anima-export.gif'): Promise<void> {
  const fps = scene.fps;
  const delay = Math.round(1000 / fps);
  const gif = GIFEncoder();

  for (let f = 0; f < scene.durationFrames; f++) {
    const image = renderFrameToImageData(scene, f);
    const { data, width, height } = image;
    const palette = quantize(data, 256);
    const index = applyPalette(data, palette);
    gif.writeFrame(index, width, height, { palette, delay });
  }

  gif.finish();
  const bytes = gif.bytes();
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const blob = new Blob([copy], { type: 'image/gif' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
