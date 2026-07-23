import {
  clearFrame,
  createDemoProject,
  createLayer,
  ensureKeyframe,
  framesWithKeys,
  getFrameChannel,
  getScene,
} from '../core/project';
import { renderScene } from '../core/renderer';
import { createStroke, StrokeStabilizer } from '../core/strokes';
import { TimelinePlayer } from '../core/timeline';
import type { BrushSettings, OnionSettings, Project, Stroke } from '../core/types';
import { exportGif } from '../export/gif';

export function mountApp(root: HTMLElement): void {
  const project: Project = createDemoProject();
  let scene = getScene(project);
  let activeLayerId = scene.layers[0]!.id;
  let frame = 0;
  let exporting = false;

  const brush: BrushSettings = {
    color: '#f2f5fa',
    size: 6,
    tool: 'brush',
  };

  const onion: OnionSettings = {
    enabled: true,
    before: 3,
    after: 2,
    falloff: 0.72,
    beforeTint: '#5b8cff',
    afterTint: '#ff8a5b',
  };

  const stabilizer = new StrokeStabilizer(10, 4);
  let drawing = false;
  let currentStroke: Stroke | null = null;

  root.innerHTML = `
    <header class="topbar">
      <div class="brand">ANI<span>MA</span></div>
      <div class="workspace-tabs">
        <button class="active" type="button">Draw</button>
        <button type="button" title="Coming in M3">Rig</button>
        <button type="button" title="Coming in M4">Composite</button>
      </div>
      <div class="meta" id="meta">${scene.width}×${scene.height} · ${scene.fps} fps · PoC</div>
    </header>
    <div class="main">
      <aside class="panel" id="tools-panel"></aside>
      <section class="canvas-wrap">
        <div class="canvas-stage">
          <canvas id="draw-canvas" width="${scene.width}" height="${scene.height}"></canvas>
        </div>
        <div class="hint">
          Draw with mouse or stylus · <kbd>B</kbd> brush <kbd>E</kbd> eraser
          <kbd>,</kbd>/<kbd>.</kbd> frames <kbd>Space</kbd> play <kbd>O</kbd> onion
        </div>
      </section>
      <aside class="panel right" id="layers-panel"></aside>
    </div>
    <footer class="timeline" id="timeline"></footer>
  `;

  const canvas = root.querySelector('#draw-canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  const toolsPanel = root.querySelector('#tools-panel')!;
  const layersPanel = root.querySelector('#layers-panel')!;
  const timelineEl = root.querySelector('#timeline')!;

  const player = new TimelinePlayer((f) => {
    frame = f;
    redraw();
    syncTimelineUI();
  });
  player.configure(scene.fps, scene.durationFrames, frame);

  function redraw(): void {
    renderScene(ctx, scene, frame, onion, activeLayerId);
  }

  function renderTools(): void {
    toolsPanel.innerHTML = `
      <h2>Tools</h2>
      <div class="tool-row">
        <button type="button" data-tool="brush" class="${brush.tool === 'brush' ? 'active' : ''}">Brush</button>
        <button type="button" data-tool="eraser" class="${brush.tool === 'eraser' ? 'active' : ''}">Eraser</button>
      </div>
      <label class="field">Color
        <input type="color" id="color" value="${brush.color}" />
      </label>
      <label class="field">Size <span id="size-val">${brush.size}px</span>
        <input type="range" id="size" min="1" max="48" value="${brush.size}" />
      </label>
      <h2>Onion skin</h2>
      <label class="check"><input type="checkbox" id="onion" ${onion.enabled ? 'checked' : ''}/> Enabled</label>
      <label class="field">Before (${onion.before})
        <input type="range" id="onion-before" min="0" max="8" value="${onion.before}" />
      </label>
      <label class="field">After (${onion.after})
        <input type="range" id="onion-after" min="0" max="8" value="${onion.after}" />
      </label>
      <h2>Export</h2>
      <button class="btn primary" type="button" id="export-gif" ${exporting ? 'disabled' : ''}>
        ${exporting ? 'Exporting…' : 'Export GIF'}
      </button>
      <button class="btn" type="button" id="clear-frame">Clear frame</button>
    `;

    toolsPanel.querySelectorAll('[data-tool]').forEach((btn) => {
      btn.addEventListener('click', () => {
        brush.tool = (btn as HTMLElement).dataset.tool as 'brush' | 'eraser';
        renderTools();
      });
    });
    const color = toolsPanel.querySelector('#color') as HTMLInputElement;
    color.addEventListener('input', () => {
      brush.color = color.value;
    });
    const size = toolsPanel.querySelector('#size') as HTMLInputElement;
    size.addEventListener('input', () => {
      brush.size = Number(size.value);
      const label = toolsPanel.querySelector('#size-val');
      if (label) label.textContent = `${brush.size}px`;
    });
    const onionCb = toolsPanel.querySelector('#onion') as HTMLInputElement;
    onionCb.addEventListener('change', () => {
      onion.enabled = onionCb.checked;
      redraw();
    });
    const ob = toolsPanel.querySelector('#onion-before') as HTMLInputElement;
    ob.addEventListener('input', () => {
      onion.before = Number(ob.value);
      renderTools();
      redraw();
    });
    const oa = toolsPanel.querySelector('#onion-after') as HTMLInputElement;
    oa.addEventListener('input', () => {
      onion.after = Number(oa.value);
      renderTools();
      redraw();
    });
    toolsPanel.querySelector('#export-gif')!.addEventListener('click', async () => {
      exporting = true;
      renderTools();
      try {
        await exportGif(scene, `${project.name.replace(/\s+/g, '-').toLowerCase()}.gif`);
      } finally {
        exporting = false;
        renderTools();
      }
    });
    toolsPanel.querySelector('#clear-frame')!.addEventListener('click', () => {
      const ch = getFrameChannel(scene, activeLayerId);
      if (!ch) return;
      clearFrame(ch, frame);
      redraw();
      syncTimelineUI();
    });
  }

  function renderLayers(): void {
    layersPanel.innerHTML = `
      <h2>Layers</h2>
      <div class="layer-list" id="layer-list"></div>
      <button class="btn" type="button" id="add-layer">+ Layer</button>
    `;
    const list = layersPanel.querySelector('#layer-list')!;
    // Top of list = top of stack visually: reverse for UI
    [...scene.layers].reverse().forEach((layer) => {
      const row = document.createElement('div');
      row.className = `layer-item ${layer.id === activeLayerId ? 'active' : ''}`;
      row.innerHTML = `
        <input type="checkbox" data-vis="${layer.id}" ${layer.visible ? 'checked' : ''} title="Visibility" />
        <span>${escapeHtml(layer.name)}</span>
      `;
      row.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).tagName === 'INPUT') return;
        activeLayerId = layer.id;
        renderLayers();
        redraw();
      });
      row.querySelector('input')!.addEventListener('change', (e) => {
        layer.visible = (e.target as HTMLInputElement).checked;
        redraw();
      });
      list.appendChild(row);
    });
    layersPanel.querySelector('#add-layer')!.addEventListener('click', () => {
      const n = scene.layers.length + 1;
      const { layer, channel } = createLayer(`Layer ${n}`, n);
      scene.layers.push(layer);
      scene.channels.push(channel);
      activeLayerId = layer.id;
      renderLayers();
      redraw();
      syncTimelineUI();
    });
  }

  function syncTimelineUI(): void {
    const readout = timelineEl.querySelector('#frame-readout');
    const scrub = timelineEl.querySelector('#scrub') as HTMLInputElement | null;
    if (readout) readout.textContent = `f ${frame + 1} / ${scene.durationFrames}`;
    if (scrub) scrub.value = String(frame);
    const playBtn = timelineEl.querySelector('#play') as HTMLButtonElement | null;
    if (playBtn) playBtn.textContent = player.isPlaying ? 'Pause' : 'Play';
    timelineEl.querySelectorAll('.dope .tick').forEach((el) => {
      const f = Number((el as HTMLElement).dataset.frame);
      el.classList.toggle('current', f === frame);
    });
  }

  function renderTimeline(): void {
    const ch = getFrameChannel(scene, activeLayerId);
    const keys = new Set(ch ? framesWithKeys(ch) : []);
    const ticks = Array.from({ length: scene.durationFrames }, (_, i) => {
      const cls = [
        'tick',
        keys.has(i) ? 'has-key' : '',
        i === frame ? 'current' : '',
      ]
        .filter(Boolean)
        .join(' ');
      return `<div class="${cls}" data-frame="${i}">${i + 1}</div>`;
    }).join('');

    timelineEl.innerHTML = `
      <div class="timeline-controls">
        <button class="btn" type="button" id="prev">‹</button>
        <button class="btn primary" type="button" id="play">Play</button>
        <button class="btn" type="button" id="next">›</button>
        <span class="frame-readout" id="frame-readout">f ${frame + 1} / ${scene.durationFrames}</span>
        <label class="field" style="flex-direction:row;align-items:center;gap:0.4rem;margin:0">
          Duration
          <input type="number" id="duration" min="1" max="120" value="${scene.durationFrames}" style="width:4rem;background:var(--panel-2);border:1px solid var(--border);color:var(--text);border-radius:4px;padding:0.25rem" />
        </label>
      </div>
      <input class="scrub" type="range" id="scrub" min="0" max="${scene.durationFrames - 1}" value="${frame}" />
      <div class="dope">${ticks}</div>
    `;

    timelineEl.querySelector('#play')!.addEventListener('click', () => {
      player.configure(scene.fps, scene.durationFrames, frame);
      player.toggle();
      syncTimelineUI();
    });
    timelineEl.querySelector('#prev')!.addEventListener('click', () => {
      player.pause();
      player.setFrame(frame - 1);
      frame = player.current;
      syncTimelineUI();
      redraw();
      renderTimelineKeysOnly();
    });
    timelineEl.querySelector('#next')!.addEventListener('click', () => {
      player.pause();
      player.setFrame(frame + 1);
      frame = player.current;
      syncTimelineUI();
      redraw();
      renderTimelineKeysOnly();
    });
    const scrub = timelineEl.querySelector('#scrub') as HTMLInputElement;
    scrub.addEventListener('input', () => {
      player.pause();
      frame = Number(scrub.value);
      player.setFrame(frame);
      syncTimelineUI();
      redraw();
    });
    timelineEl.querySelectorAll('.dope .tick').forEach((el) => {
      el.addEventListener('click', () => {
        player.pause();
        frame = Number((el as HTMLElement).dataset.frame);
        player.setFrame(frame);
        syncTimelineUI();
        redraw();
      });
    });
    const dur = timelineEl.querySelector('#duration') as HTMLInputElement;
    dur.addEventListener('change', () => {
      scene.durationFrames = Math.max(1, Math.min(120, Number(dur.value) || 24));
      if (frame >= scene.durationFrames) frame = scene.durationFrames - 1;
      player.configure(scene.fps, scene.durationFrames, frame);
      renderTimeline();
      redraw();
    });
  }

  function renderTimelineKeysOnly(): void {
    const ch = getFrameChannel(scene, activeLayerId);
    const keys = new Set(ch ? framesWithKeys(ch) : []);
    timelineEl.querySelectorAll('.dope .tick').forEach((el) => {
      const f = Number((el as HTMLElement).dataset.frame);
      el.classList.toggle('has-key', keys.has(f));
      el.classList.toggle('current', f === frame);
    });
  }

  function canvasPoint(e: PointerEvent): { x: number; y: number; p: number } {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const p = e.pressure > 0 ? e.pressure : 0.5;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      p,
    };
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const layer = scene.layers.find((l) => l.id === activeLayerId);
    if (!layer || layer.locked || !layer.visible) return;
    player.pause();
    canvas.setPointerCapture(e.pointerId);
    drawing = true;
    stabilizer.reset();
    const ch = getFrameChannel(scene, activeLayerId);
    if (!ch) return;
    const drawingData = ensureKeyframe(ch, frame);
    currentStroke = createStroke(brush.color, brush.size, brush.tool === 'eraser');
    const pt = stabilizer.push(canvasPoint(e));
    currentStroke.points.push(pt);
    drawingData.strokes.push(currentStroke);
    redraw();
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!drawing || !currentStroke) return;
    const pt = stabilizer.push(canvasPoint(e));
    currentStroke.points.push(pt);
    redraw();
  });

  const endStroke = () => {
    if (!drawing) return;
    drawing = false;
    currentStroke = null;
    syncTimelineUI();
    renderTimelineKeysOnly();
  };
  canvas.addEventListener('pointerup', endStroke);
  canvas.addEventListener('pointercancel', endStroke);

  window.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    switch (e.key.toLowerCase()) {
      case 'b':
        brush.tool = 'brush';
        renderTools();
        break;
      case 'e':
        brush.tool = 'eraser';
        renderTools();
        break;
      case 'o':
        onion.enabled = !onion.enabled;
        renderTools();
        redraw();
        break;
      case ',':
        player.pause();
        player.setFrame(frame - 1);
        frame = player.current;
        syncTimelineUI();
        redraw();
        break;
      case '.':
        player.pause();
        player.setFrame(frame + 1);
        frame = player.current;
        syncTimelineUI();
        redraw();
        break;
      case ' ':
        e.preventDefault();
        player.configure(scene.fps, scene.durationFrames, frame);
        player.toggle();
        syncTimelineUI();
        break;
    }
  });

  renderTools();
  renderLayers();
  renderTimeline();
  redraw();

  // Satisfy unused after reassignment pattern
  scene = getScene(project);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}
