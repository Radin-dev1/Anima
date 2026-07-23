# ANIMA Roadmap — 12 Months / 6 Milestones

Team sizing assumes a lean product-led studio. Dates relative to T0 = kickoff.

| Milestone | Month | Theme |
|-----------|-------|-------|
| M1 | 0–2 | Draw Space MVP (desktop) |
| M2 | 2–4 | Timeline + `.anima` + web review player |
| M3 | 4–6 | Rig Space + Live Performance alpha |
| M4 | 6–8 | Composite Space + expressions |
| M5 | 8–10 | Collab (Yjs) + Creator cloud |
| M6 | 10–12 | AI layer GA + Studio tier |

---

## M1 — Draw Space MVP (desktop) · Months 0–2

**Shippable scope**
- Tauri shell + Rust/wgpu canvas: pressure strokes, undo, layers
- Onion skin (N before/after, tint, falloff)
- Basic brushes + eraser + fill
- Timeline scrub + playback at fixed fps
- Local save draft (proto `.anima` subset)
- Week-1 web prototype parity features mirrored in engine

**Team:** 2 engine (Rust/GPU), 1 desktop UI, 1 product/design, 0.5 QA  
**Riskiest assumption:** Hybrid vector+raster stroke cache hits 16 ms stroke-to-ink on mid-range laptops with wgpu across Windows/macOS.

---

## M2 — Unified timeline & format · Months 2–4

**Shippable scope**
- Channels/keyframes (hold/linear/bezier), dope sheet, markers, audio scrub
- Formal `.anima` zip + validators
- X-sheet sync, cel holds
- WASM review player (read-only scrub + comments stub)
- Export GIF/MP4 1080p

**Team:** +1 format/IO, +1 web WASM  
**Riskiest assumption:** Mixed-fps sequences with hold/blend resample stay editable without exploding cache invalidation complexity.

---

## M3 — Rig + LIVE PERFORMANCE alpha · Months 4–6

**Shippable scope**
- 2D FK/IK, weight paint, layer-swap mouths
- Live face + 12-viseme lipsync + take baking
- Auto-rig v0 on layered characters
- Latency budget instrumentation (&lt;100 ms target on reference hardware)

**Team:** +1 tracking/ML, +1 rig tools  
**Riskiest assumption:** Glass-to-glass &lt;100 ms is achievable in the Tauri+wgpu pipeline without dropping to a dedicated capture process on Windows.

---

## M4 — Composite Space · Months 6–8

**Shippable scope**
- Node graph (source/color/blur/key/mograph subset)
- AE-style layer projection
- JS expressions (QuickJS)
- Motion blur + time remap
- Reduced 3D import (glTF) + toon shade

**Team:** +1 compositing, +0.5 TD docs  
**Riskiest assumption:** Dual UI (graph + layer list) can stay bijective without divergent edge-case bugs that force a data-model fork.

---

## M5 — Collaboration & Creator cloud · Months 8–10

**Shippable scope**
- Yjs sync, presence, soft locks
- 5 GB cloud, personal share links
- Git-semantics commits + visual diff v1
- Free/Creator billing gates (watermark, project caps)

**Team:** +1 backend/sync, +0.5 security  
**Riskiest assumption:** High-frequency stroke updates over Yjs remain smooth for 2–4 concurrent users without custom CRDT chunking beyond Y.Array of strokes.

---

## M6 — AI GA + Studio · Months 10–12

**Shippable scope**
- Inbetween, rough-to-clean, auto-color, audio-to-performance (native outputs)
- Prompt bar + safety rails + credit metering
- Review Mode, SSO, render farm CLI, team library 500 GB
- Plugin ABI v1 signed builds

**Team:** +1 ML infra, +1 enterprise  
**Riskiest assumption:** Cloud inbetween quality is good enough that artists prefer refine-in-ANIMA over exporting to specialized tools — measured by ≥40% of Creator users invoking AI weekly without undo-all rates &gt;25%.

---

## Hiring pulse

```
M1: 4.5 FTE → M3: 7 FTE → M6: 10 FTE (+ contractors for ABR/FBX as needed)
```

## Kill criteria (executive)

- Miss stroke latency by &gt;2× after M1 hardening → reconsider egui-only or platform-native canvas.
- Live latency uncured by M3 exit → ship Rig without Live; Live becomes M5 add-on.
- Collab CRDT cost too high → fall back to turn-based soft-lock file sections for Studio v1.
