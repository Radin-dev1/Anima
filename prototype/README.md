# ANIMA Prototype — Week-1 PoC

In-browser Draw Space slice that mirrors the `.anima` scene-graph concepts (`Project → Scene → Layer → Channel → Keyframe`).

## Goals (1 week)

| Day | Deliverable |
|-----|-------------|
| 1 | Vite + TS scaffold; scene-graph types; empty canvas |
| 2 | Pressure-aware stroke drawing; undo; brush size |
| 3 | Multi-layer + onion skin (before/after tint) |
| 4 | Timeline scrub + playback |
| 5 | GIF export; polish UI; README |

## Run

```bash
cd prototype
npm install
npm run dev
```

Then open the URL Vite prints (default `http://localhost:5173`).

**Live deployment:** the GitHub Pages site **is this app** — https://radin-dev1.github.io/Anima/  
(`npm run build` with `base: '/Anima/'`; CI deploys `prototype/dist` on every push to `main`.)

## Features

- Frame-by-frame drawing (pointer / stylus pressure when available)
- Onion skinning (cool before / warm after, opacity falloff)
- Layers (add, select, visibility, clear frame)
- Timeline: scrub, play/pause, frame step, duration
- GIF export of the current scene
- Modular core types aligned with `docs/anima-format/schemas`

## Non-goals (this PoC)

Rig Space, Composite nodes, Yjs, AI, `.anima` zip round-trip.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview build |
