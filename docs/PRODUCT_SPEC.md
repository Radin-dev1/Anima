# ANIMA Product Specification

**Version:** 0.2.0-draft  
**Status:** Canonical for M1–M6 planning  
**Format companion:** [`anima-format/SCHEMA.md`](./anima-format/SCHEMA.md)

This document is the product source of truth. Decisions are concrete; each major choice includes a one-sentence justification.

---

# PART 1 — Product Vision & Positioning

## 1.1 Elevator pitch

ANIMA is a professional animation platform that unifies frame-by-frame drawing, character rigging with live performance capture, and node-based compositing inside one non-destructive scene graph — so artists never leave the app to clean up, composite, or hand animation to collaborators, and every AI assist emits editable native strokes, bones, and nodes instead of locked video.

## 1.2 Tagline

**One canvas. Three workspaces. Native data everywhere.**

## 1.3 Mission

Give independent creators and small studios a Harmony-class pipeline without Harmony-class cost or fragmentation, by treating drawing, rigging, and compositing as views of the same scene graph rather than separate products glued by export.

## 1.4 Target users (priority order)

| Priority | Audience | Primary job-to-be-done | Success metric |
|----------|----------|------------------------|----------------|
| 1 | **Indie 2D animators** (freelance / YouTube / short film) | Ship polished shorts without hopping Toon Boom → AE → Premiere | Time from rough to export ↓ 40% vs multi-app |
| 2 | **Small studios (2–15 seats)** | Collaborate on sequences with review, locks, and shared library | Review cycle length ↓; fewer “wrong file” incidents |
| 3 | **Motion designers / hybrid 2.5D** | Rig + LIVE PERFORMANCE + mograph nodes in one timeline | Takes → keyframes usable same day |
| 4 | **Educators / students** | Learn classical + digital animation with low cost and clear mental model | Free tier completion of first 12s loop |

*Justification for priority:* Indie volume drives product-led growth; studios fund Studio tier; motion designers validate Rig+Live; education fills Free funnel.

## 1.5 Core differentiators

1. **Three workspaces, one graph** — Draw / Rig / Composite are lenses on one scene graph; switch never converts/exports/destroys data; layers editable only in home workspace.
2. **AI → native data only** — Inbetweens are vector/raster strokes on layers; auto-rig is bones+weights; no “AI video” dead ends.
3. **LIVE PERFORMANCE MODE** — Webcam face, mic lipsync (12 visemes), hands, MIDI/gamepad → keyframes at &lt;100 ms glass-to-glass budget.
4. **Yjs collab + Git-semantics VC** — Soft locks and presence for live work; commits/branches/visual diffs for durable history.
5. **Hybrid 2D + reduced 3D** — glTF/FBX/OBJ with toon/NPR and baked physics keys inside the same camera as 2D cels.

## 1.6 Pricing — Free / Creator / Studio

### Free — $0

| Capability | Gate |
|------------|------|
| Projects | **1** active project |
| Resolution | Export up to **1080p**, 24/30 fps |
| Workspaces | Draw + Timeline; Rig (bones FK only, no Live); Composite (5 nodes max) |
| Collab | Local only; no cloud sync |
| AI | On-device only (inbetween preview, rough-to-clean preview); no cloud credits |
| Export | MP4 H.264, GIF, PNG sequence; **watermark** on Instagram/TikTok/YouTube presets |
| Asset library | Local folder only |
| Support | Community Discord |

### Creator — $19 / month (or $190 / year)

| Capability | Gate |
|------------|------|
| Projects | Unlimited |
| Resolution | Up to **4K**, custom fps including mixed timelines |
| Workspaces | Full Draw / Rig / Composite; LIVE PERFORMANCE MODE |
| Collab | Cloud sync **5 GB**; 2 concurrent presence users (personal share links) |
| AI | **2,000 cloud credits / mo** + unlimited on-device |
| Export | No watermark; ProRes 422; WebM; interactive web export |
| Asset library | Personal cloud library 5 GB |
| Support | Email, 48h SLA |

### Studio — $79 / seat / month (min 3 seats; annual preferred)

| Capability | Gate |
|------------|------|
| Everything in Creator | Yes |
| Collab | Soft locks, comments, voice hooks, **Review Mode**, SSO (SAML/OIDC) |
| Storage | **500 GB** team library + per-seat 50 GB working set |
| AI | **10,000 credits / seat / mo**; priority queue; private model endpoint option |
| Pipeline | Render farm CLI, batch watch folders, plugin SDK signing |
| VC | Git-semantics team remotes, protected branches, visual diff in Review |
| Support | Dedicated Slack/Teams, 8h business SLA, onboarding call |

*Justification:* Freemium conversion on watermark + project cap; Creator at indie price point under Toon Boom Harmony Essentials; Studio priced under Adobe Team + Harmony combo for small shops.

---

# PART 2 — Three-Workspace Architecture

### Full specification: Draw Space · Rig Space · Composite Space

All three workspaces are *lenses* on one scene graph and one timeline. Switching workspaces never converts, exports, or destroys data — it changes which tools and panels are active and which layer types are editable in place.

**Canonical status:** This Part 2 is the authoritative workspace architecture for ANIMA. Part 3 (timeline & scene graph schemas) follows below and will deepen the shared data model without redefining workspace behavior.

### Global rules for all workspaces

| Rule | Spec |
|------|------|
| Shared state | Timeline, playhead, scene graph, **one project-wide undo stack**, color palettes, asset library |
| Visibility vs editability | Any layer type is **visible** in every workspace; it is **editable** only in its **home workspace**. Selecting a foreign layer offers **Jump to home workspace** (one action). `Tab` cycles Draw → Rig → Composite → Draw |
| Switch preserves | Zoom, pan, selected layer, playhead, and **per-workspace panel layout** |
| Non-destructive | All edits are modifiers/nodes/channels unless the user explicitly **bakes** / flattens |
| On switch (engine) | Flush pending stroke/deform/Live buffers → rebind GPU tool pipelines → emit `workspace.changed` for collab presence — **no bake, no export, no data loss** |

**Home workspace by layer type**

| Layer / data type | Home workspace |
|-------------------|----------------|
| `rasterStroke`, `vectorStroke`, `fill`, `cel`, stop-motion capture frames | Draw |
| `mesh`, bones, weights, swap sets, Live takes / behavior blocks | Rig |
| Composite graph nodes, AE-style projected layers, mograph/text, procedural env, sequence assembly clips | Composite |

---

## 2A — DRAW SPACE (traditional / frame-by-frame)

**Sources / DNA:** Pencil2D, FlipaClip, DigiCel FlipBook, OpenToonz, TupiTube, Toon Boom Harmony (X-sheet).

### Panel layout (default, Standard density)

| Region | Proportion | Panels |
|--------|------------|--------|
| Top bar | ~4% H | Workspace tabs, scene name, fps, density, presence |
| Left | **18% W** | Tool shelf, Brush presets, Color / Ink / Palette |
| Center | **52% W × ~66% H** | Canvas (GPU hybrid); light-table underlay |
| Right | **30% W** | Layers / Drawing Bank / Cels · X-Sheet · Onion / Light Table |
| Bottom | **100% W × ~30% H** | Unified Timeline + audio scrub (shared) |

### Default toolset

Brush, Pencil, Ink Pen, Soft Brush, Marker, Airbrush, Texture Brush, Hard Eraser, Soft Eraser, Fill Bucket, Lasso / Marquee Select, Transform, Eyedropper, Hand, Zoom, Rotate View, Flip Peek, Mirror Guide, Cel Swap, Light Table Pin.

### Keyboard map (Draw — remappable; Blender/AE/Harmony/Photoshop maps available in Part 7)

| Key | Action |
|-----|--------|
| `Tab` | Cycle workspace (global) |
| `B` | Brush |
| `E` | Eraser |
| `G` | Fill bucket |
| `V` | Transform |
| `I` | Eyedropper |
| `H` | Hand / pan |
| `Z` | Zoom tool (or `Ctrl`+scroll) |
| `[` / `]` | Brush size − / + |
| `{` / `}` | Softness / hardness − / + |
| `,` / `.` | Previous / next frame |
| `Shift+,` / `Shift+.` | Previous / next **key** frame only |
| `O` | Toggle onion skin |
| `Shift+O` | Onion keys-only mode |
| `L` | Light table panel focus / toggle |
| `F` | Flip peek (hold) |
| `Shift+F` | Mirror view horizontal |
| `R` | Rotate canvas (hold + drag); `Shift+R` reset rotation |
| `1`–`9` | Cel / swap-slot assign under playhead |
| `0` | Clear swap slot / restore previous cel |
| `Space` | Play / pause (when not mid-stroke); hold+drag = temporary pan |
| `Ctrl+Z` / `Ctrl+Shift+Z` | Undo / Redo (project-wide stack) |
| `Ctrl+S` | Save / commit draft |
| `Ctrl+J` | Jump to home workspace of selected layer |
| `M` | Toggle canvas mirror guide |
| `Ctrl+[` / `Ctrl+]` | Prev / next drawing in Drawing Bank |

---

### 2A.1 Canvas Engine

**Hybrid stroke model.** Each stroke is stored as a pressure/tilt/velocity-rich polyline (`StrokePath`) that remains the **source of truth**. Soft brushes and fills may stamp into a **GPU raster cache** of **256×256** mipmapped tiles keyed by `(layerId, frame, cameraHash)`. Vector paths drive scale-independent edits, AI cleanup, and export; tiles accelerate paint-over and display.

**Pointer dynamics.** Sample at display rate (≥60 Hz, prefer stylus report rate):

| Channel | Range | Use |
|---------|-------|-----|
| Pressure | 0–1 | Size, opacity, flow curves |
| Tilt altitude / azimuth | device radians | Angle, oval stamp, calligraphy |
| Velocity | px/ms | Optional size/opacity falloff; predictive smoothing input |

**Stabilization (mutually selectable primary mode + optional prediction).**

| Mode | Behavior | Default |
|------|----------|---------|
| **Pull-string** | Cursor leads; stroke anchor trails at string length `L` px (1–64, default **12**) | Preferred for intentional curves |
| **Averaging** | Trailing window of `N` samples (2–16, default **5**) | Preferred for tremor / mouse |
| Strength | 0–100% blend between raw and stabilized | 60% |

**Predictive smoothing:** extrapolate one sample ahead with **Catmull-Rom** over the last four stabilized points; clamp prediction to ≤8 px. *Justification:* recovers perceived latency without the rubber-band feel of heavy averaging alone.

**View transforms (canvas chrome, non-destructive).**

| Control | Spec |
|---------|------|
| Pan / zoom | Standard; zoom 1%–6400% |
| **Rotate view** | Free rotate; does not alter layer data |
| **Flip view** | Temporary horizontal/vertical flip for handedness check |
| **Mirror guide** | Vertical/horizontal symmetry drawing (writes mirrored strokes as real data on commit) |

**Coordinate spaces.** Pointer → view matrix → scene camera → **layer local space** (strokes stored here). Onion “relative to camera” reprojects prior frames by camera delta at draw time only.

---

### 2A.2 Brush System

**Parameter table**

| Parameter | Type | Range / notes |
|-----------|------|----------------|
| `sizePx` | float | 0.5–1024 |
| `sizePressure` | curve | pressure → size multiplier |
| `opacity` | float | 0–1 |
| `opacityPressure` | curve | |
| `flow` | float | 0–1 per dab |
| `spacing` | float | fraction of size; default 0.12 |
| `scatter` | float | 0–1 positional jitter |
| `textureGrain` | asset ref + depth | tip texture / grain map |
| `wetEdge` | float | 0–1 watercolor edge darkening (raster) |
| `hardness` | float | 0–1 |
| `angle` / `angleJitter` | deg | tip rotation |
| `tiltAffordance` | bool | use stylus tilt |
| `velocitySize` | curve | optional |
| `blendMode` | enum | srcOver, multiply, screen, overlay, behind, erase |
| `vectorMode` | enum | `polyline` \| `ribbon` \| `rasterOnly` |
| `antiAlias` | bool | default true |

**Default brush set (10)**

| # | Name | Role |
|---|------|------|
| 1 | Pencil HB | Hard graphite line |
| 2 | Pencil 2B | Soft construction |
| 3 | Ink Nib | Crisp vector-friendly ink |
| 4 | Ink Brush | Calligraphic pressure |
| 5 | Flat Marker | Comic fill lines |
| 6 | Soft Air | Shading / mist |
| 7 | Texture Grain | Paper grain stamp |
| 8 | Hard Eraser | Pixel/vector hard delete |
| 9 | Soft Eraser | Feathered erase |
| 10 | Mix Blender | Smudge / wet mix |

**`.abr` import.** ABR v6/v7 tip images + approximate dynamics → `BrushPreset` with `source: "abr"`. Unsupported dynamics degrade to pressure size/opacity. *Justification:* covers the majority of community brush packs.

**Brush lock.** Toggle locks size/opacity/color against accidental `[`/`]` and palette clicks during long takes; lock state is per-tool and persisted in workspace state.

---

### 2A.3 Onion Skinning

| Param | Spec |
|-------|------|
| Range | `N_before`, `N_after` ∈ 0–10 (default **3 / 3**) |
| Tint | Before = cool **`#5B8CFF`**; After = warm **`#FF8A5B`** (multiply over stroke albedo) |
| Falloff | `opacity_i = base * falloff^|i|`, `falloff` default **0.72**, base default **0.55** |
| **Keys-only** | Show only frames that have key drawings on the onion target layer(s) |
| **Relative to camera** | Reproject onion frames by camera transform delta so pans don’t leave incorrect ghosts |
| **Cross-layer onion** | Optionally include selected additional layers (e.g. rough under clean) with independent opacity |

Onion never writes pixels; it is a view-time composite.

---

### 2A.4 Light Table

Pinned references under the active drawing layer:

- Any layer from the **current scene**, another scene in the project, or an imported still / video frame
- Per-ref: opacity, desaturation, blend (normal/multiply), offset XY, solo
- Does **not** appear in final export unless user invokes **Flatten light table** (explicit bake → new layer)

---

### 2A.5 X-Sheet (Exposure Sheet)

Full Toon Boom / OpenToonz-style column view, **bidirectionally synced** with the unified timeline.

| Column type | Contents |
|-------------|----------|
| Frame # | Absolute scene frame |
| Layer / cel columns | Exposure, holds, empties, cel labels |
| Timing chart | Tick marks / inbetween notation (stored as metadata on exposures) |
| Audio | Waveform thumbnail column; lipsync viseme lane when present |

**Sync rules:** Edit exposure length in X-sheet → writes hold/empty into the layer’s frame channel. Scrub timeline → highlight X-sheet row. Reorder columns ↔ reorder layer stack. Same integer frame domain as Part 3 timeline.

---

### 2A.6 Cel System

| Feature | Spec |
|---------|------|
| **Drawing bank** | Per-layer library of named drawings (`drawingId`); exposures reference bank IDs instead of duplicating stroke data |
| Substitution | One drawing reused across many frames via exposure pointers |
| **Auto-hold** | Empty frames inherit previous exposure until next key |
| **Cycles** | `cycle(drawingIds[], times\|frameLength)` modifier on the exposure channel |
| **Swap-on-keypress** | Hotkeys `1`–`9` map to bank slots (mouth shapes, hands); press writes/replaces exposure at playhead |

Drawing bank assets live under `assets/drawings/` in `.anima` (see format notes); Part 3 will formalize `Drawing` / `Exposure` channel schemas.

---

### 2A.7 Cleanup Pipeline

Ordered, **non-destructive** stage stack on a Draw layer (or as sibling output layers):

**Rough → Tie-down → Clean → Color**

| Stage | Purpose | Output |
|-------|---------|--------|
| Rough | Construction / gesture | Editable strokes |
| Tie-down | Volume / perspective fix | New layer or override stack entry |
| Clean | Final line (centerline/contour smooth, gap close, stroke unify, despeckle) | Editable clean strokes |
| Color | Flats / tones | Fill paths / paint layer |

AI-assisted cleanup (Part 5) is an **optional pass** that inserts native strokes into the Clean stage — never a baked video plate. Original Rough always retained unless user deletes.

---

### 2A.8 Paint & Fill

| Feature | Spec |
|---------|------|
| Bucket | Flood fill with **gap close**; `gapTolerancePx` default **2** (0–16) |
| Vector fill | Prefer closed vector regions when source is vector; else raster fill on color layer |
| Palettes | Project-wide palette refs; swatches are linear RGB with display transform |
| **Costume variants** | Palette swap sets remapping named roles (`skin`, `shirt`, …) without rewriting fills |
| **Shadow / highlight** | Auto-generate from line art + light angle as editable fill regions (user-refinable); stored as native fills |

---

### 2A.9 Flipping Controls

FlipBook-style rapid review:

| Binding | Behavior |
|---------|----------|
| Hold `F` | Ping-pong ±`K` frames (default K=2) at `flipHz` (default **8**) |
| Scroll / stylus button | User-mappable flip next/prev |
| Pedal | HID mapping via preferences |

Used for arcs, volume, and timing checks; does not alter data.

---

### 2A.10 Mobile / Touch Mode

FlipaClip-style simplified chrome (Quick density default):

- Full-screen canvas; collapsible radial tool menu
- Two-finger pan/zoom; **two-finger tap = undo**; **three-finger tap = redo**
- Pinch-horizontal on timeline edge = scrub
- Pressure from Apple Pencil / S-Pen when available
- Same `.anima` project; reduced brush preset cache for offline tablet

---

## 2B — RIG SPACE (puppet / cutout / 3D)

**Sources / DNA:** Moho, Cartoon Animator 5, Adobe Character Animator, Blender (reduced), Synfig.

### Panel layout

| Region | Proportion | Panels |
|--------|------------|--------|
| Left | **16% W** | Rig tools, Bone tree, Constraints, Dynamics |
| Center | **~54% W** | Viewport (2D mesh + optional 3D); camera controls |
| Right | **30% W** | Properties · Weight paint · Layer-swap map · **LIVE PERFORMANCE** · Behaviors |
| Bottom | Shared timeline | Bone channels, takes, behavior layers |

### Default toolset

Bone Create, Bone Edit, FK Pose, IK Handle, Smart Bone, Constraint Add, Dynamics Paint, Mesh Generate/Edit, Weight Paint, Wrap/Curve Deformer, Layer Swap Map, Live Arm, Live Rec, Take Marker, Behavior Drop, Auto-Rig.

### Keyboard map (Rig)

| Key | Action |
|-----|--------|
| `Tab` | Cycle workspace (global) |
| `Ctrl+B` | Add bone |
| `Y` | Toggle FK / IK on selected chain |
| `Q` / `W` / `E` | Select / Pose / Weight modes |
| `R` | Record Live take (toggle) |
| `T` | Apply / insert take as keyframes |
| `Ctrl+R` | Auto-rig selection |
| `Ctrl+J` | Jump to home workspace of selection |
| `,` / `.` | Frame step |
| `1`–`9` | Trigger swap sets / behaviors (when Live armed) |
| `Space` | Play / pause |

---

### 2B.1 2D Bone System

| Feature | Spec |
|---------|------|
| Hierarchy | Parent/child bones; length, rest pose, scale |
| **FK / IK** | Per-chain switch; solvers: two-bone analytic, **FABRIK**, **CCD**; pole vectors; angle limits |
| **Smart bones** | Control bone rotation/translation drives corrective mesh deform, layer visibility, or morphs via keyed curves (Moho-style) |
| **Constraints** | Target/aim, angle limits, position/rotation/scale copy, path, **squash-and-stretch** bones |
| **Dynamics** | Spring/damping Verlet on chains (hair, tails, cloth-lite); **bake to keys** for deterministic export/collab |

---

### 2B.2 Mesh Deformation

- Auto mesh from artwork silhouette; manual vertex edit
- Weight painting with heat-map visualization; max **4** influences/vertex (LBS)
- Wrap deformers; curve/path deformers for ribbons and tails
- Bind pose stored on `MeshDeform`; Draw layers can texture or cage-warp onto mesh

---

### 2B.3 Layer-Swap Rigging

Cartoon Animator-style sprite / cel swapping for hands, mouths, eyes:

- Swap sets reference **Drawing Bank** / sprite sheets
- **Angle-based auto-selection:** character turn / control angle picks the correct sprite
- Driven by float channels, smart bones, or Live viseme / trigger streams

---

### 2B.4 3D Subsystem (deliberately reduced)

| Capability | Spec |
|------------|------|
| Import | **glTF 2.0**, FBX, OBJ |
| Animation | Pose-based FK/IK on imported skeletons |
| Modeling | Basic primitives + extrusion only (not a full DCC) |
| Materials | PBR + **toon / NPR** ramps + line rendering to match 2D |
| Camera | **One unified** 2D/3D scene camera (ortho or perspective) |
| Physics | Rigid body, cloth, hair — simulate in session → **bake to keyframes** (no runtime physics in playback) |

*Justification:* Baking keeps farm/collab deterministic and matches 2D channel mental model.

---

### 2B.5 LIVE PERFORMANCE MODE

Character Animator–class puppeteering with editable native outputs.

#### Inputs → rig parameters

| Source | Mapped params (examples) |
|--------|---------------------------|
| Webcam face | `headYaw/Pitch/Roll`, `browL/R`, `eyeOpenL/R`, `eyeX/Y`, `jawOpen`, `mouthSmile`, `mouthFunnel` — each with sensitivity + smoothing |
| Mic lipsync | 12-viseme weights + energy |
| Hand tracking | Wrist, finger curls; gesture enums → arm/hand bones |
| Keyboard / MIDI / gamepad | Swap sets, replays, behavior triggers (wave, jump, walk) |

#### 12-viseme set

`REST`, `A`, `E`, `I`, `O`, `U`, `F_V`, `L`, `W_Q`, `M_B_P`, `C_D_G_K_N_S_Z_TH`, `R`

#### Phoneme → viseme mapping (English ARPAbet subset)

| Phonemes | Viseme |
|----------|--------|
| silence / `SP` / `.` | REST |
| `AA`, `AH`, `AO` | A |
| `EH`, `AE` | E |
| `IY`, `IH`, `AY` | I |
| `OW`, `OY` | O |
| `UW`, `UH`, `AW` | U |
| `F`, `V` | F_V |
| `L`, `EL` | L |
| `W`, `WH`, `Q` | W_Q |
| `M`, `B`, `P` | M_B_P |
| `CH`, `JH`, `SH`, `ZH`, `DH`, `TH`, `S`, `Z`, `T`, `D`, `G`, `K`, `N`, `NG` | C_D_G_K_N_S_Z_TH |
| `R`, `ER` | R |

Audio path uses 30–50 ms look-ahead; display delayed by the same buffer for A/V sync inside the latency budget.

#### Recording model

1. Arm parameters / channels for record  
2. `R` starts a **take**; trackers sample 60–90 Hz, resampled to timeline fps  
3. Multiple **layered takes** (e.g. face pass, then arms)  
4. `T` / Apply Take → editable keyframes (optional Butterworth denoise)  
5. Takes stored as assets under `assets/takes/` with provenance

#### Latency pipeline (&lt;100 ms glass-to-glass)

```
Camera/Mic → Capture (≤16ms) → Inference (≤33ms) → Param filter (≤8ms)
→ Channel write → GPU pose eval (≤8ms) → Present (≤16ms)  ≈ 81ms typical
```

Drop inference frames before UI frames; never block the draw/present thread.

---

### 2B.6 Auto-Rigging

| Path | Output |
|------|--------|
| Template skeletons | Biped, quadruped, bird, fish |
| AI auto-rig (Part 5) | From single character drawing / layered art → native `Bone[]` + weights + suggested smart controls |
| Sharing | Rig package format for marketplace / library (content-addressed in asset store) |

All outputs are user-refinable in Weight Paint / Bone Edit — never locked black boxes.

---

### 2B.7 Walk & Behavior System

| Feature | Spec |
|---------|------|
| Walk generator | Parametric cycle: speed, bounce, arm swing, stride, **mood** sliders |
| **Behavior blocks** | Reusable non-destructive layers: breathe, blink, idle sway, look-at |
| **Layering order** (bottom → top evaluation) | 1. Base keys / takes → 2. Locomotion clip → 3. Behavior blocks → 4. Dynamics (optional) → 5. Manual override keys |
| Export | Clips and behaviors as library assets |

Behaviors are modifiers over channels; mute/solo per block; bake optional for delivery.

---

## 2C — COMPOSITE SPACE (VFX / motion graphics / editing)

**Sources / DNA:** After Effects, Jitter, Terragen, Movavi, Stop Motion Studio, Powtoon, Animaker, Flipsnack.

### Panel layout

| Region | Proportion | Panels |
|--------|------------|--------|
| Left | **16% W** | Node catalog (categories below) |
| Center | **~44% W** | Node graph canvas |
| Right top | **~40% W × ~50% H** | Viewer |
| Right bottom | **~40% W** | AE-style **Layer view** (projection of graph) |
| Bottom | Shared timeline | Time remap, effect params, sequence assembly when in Seq mode |

### Default toolset

Select, Pan, Node Create, Wire, Mute/Solo, Viewer Split, Layer View Toggle, Text Animator, Shape, Stop Motion Capture, Sequence Cut, Hotspot, Expression Editor.

### Keyboard map (Composite)

| Key | Action |
|-----|--------|
| `Tab` | Cycle workspace (global) |
| `Shift+A` | Add node (catalog search) |
| `Ctrl+E` | Expression editor on selected property |
| `Ctrl+L` | Toggle Layer view ↔ Graph focus |
| `0` (numpad) | Fit viewer |
| `,` / `.` | Frame step |
| `Space` | Play / pause |
| `Ctrl+J` | Jump to home workspace of sourced layer |
| `Ctrl+/` | Mute selected node |

---

### 2C.1 Node Graph Compositor

Every scene can render into a composite node graph. **Categories:**

| Category | Nodes (representative) |
|----------|------------------------|
| **Input** | Scene, Footage, Image, Camera, Procedural |
| **Filter** | Blur, Glow, Color grade (curves/wheels), Chromatic aberration, Displacement |
| **Keying** | Chroma (spill suppression), Luma, AI rotoscope (→ editable matte paths) |
| **Generate** | Gradients, Noise, Fractals |
| **Utility** | Merge, Transform, Time remap, Expression |
| **Output** | Viewer, File Output, Web Interactive |

Graph is canonical storage; evaluation is demand-driven with tile caching shared with the core renderer.

---

### 2C.2 Layer View ↔ Node Mapping

AE-style layer timeline is a **synchronized view** of the same graph — not a second data model.

| Layer UI concept | Node graph mapping |
|------------------|--------------------|
| Layer row | Top-level branch from a Scene/Footage input to merge stack |
| Stack order | Z-order / merge input order |
| Blend mode | Merge node mode |
| Opacity | Merge/opacity param or channel |
| Effects stack | Linear chain of filter nodes on that branch |
| Track matte | Matte link input on merge |
| Reorder layers | Rewire merge inputs |

Edits in either view update one graph. *Justification:* AE muscle memory without forking formats.

---

### 2C.3 Effects, Motion & Expressions

| Feature | Spec |
|---------|------|
| Motion blur | Per-layer; shutter angle 0–720°; samples 8–64 |
| Speed ramp | Time-remap channel; graph-editable; frame blend or optical-flow assist → **native warp mesh** (not locked video) |
| Expressions | **JavaScript subset** on QuickJS (desktop) / constrained interpreter (web) |

**Expression API (documented):** `time`, `fps`, `value`, `thisLayer`, `thisComp`, `thisChannel`, `wiggle()`, `loopIn()` / `loopOut()`, `posterizeTime()`, property linking via `comp.layer(name).transform…`. No filesystem or network access.

```js
const amp = 20, freq = 2;
value + Math.sin(time * freq * Math.PI * 2) * amp;
```

---

### 2C.4 Motion Graphics Toolkit

| Feature | Spec |
|---------|------|
| Text animators | Per-character position/rotation/opacity/tracking with range selectors |
| Presets | Fade, pop, glitch, typewriter, bounce — each fully editable after apply |
| Shapes | Trim paths, repeaters, booleans |
| Social layouts | Auto-reflow for **1:1**, **9:16**, **16:9** |
| Brand kits | Fonts, colors, logos applied project-wide |

---

### 2C.5 Procedural Environments

Terragen-inspired, animation-first:

- Heightfield terrain + erosion simulation parameters (keyable)
- Procedural sky (time-of-day; clouds as 2.5D volumes)
- Weather particles: rain, snow, fog; **global wind force** that can drive Rig Space bone dynamics
- Parallax auto-setup: one landscape → N depth-sliced layers following the camera

---

### 2C.6 Stop Motion Module

| Step | Spec |
|------|------|
| Capture | Live USB / phone-as-webcam feed |
| Onion | Against previous captured frame |
| Trigger | Remote / keyboard / MIDI |
| Cleanup | Dead-frame removal; exposure & WB lock; chroma-key rig removal |
| Landing | Frames land on a normal **Draw Space** layer for hybrid practical/digital work |

Home workspace for captured frames = Draw; Composite hosts the capture bay UI as a module.

---

### 2C.7 Sequence Editing

Movavi-style **final assembly** above scene timelines:

- Multi-scene sequence timeline: scenes as clips, transitions, audio tracks with waveforms
- Ducking and simple mixing
- Export marks / chapter markers
- Animation-first — not a long-form Premiere replacement

Sequence Editor shares playhead semantics with scenes when drilling in; see Part 3 for `Sequence` schema.

---

### 2C.8 Interactive / Web Output

| Output | Spec |
|--------|------|
| HTML embed | Scroll-driven playback, hover states, clickable hotspots (`InteractionNode`) |
| Flipbook mode | Page-turn presentation for storyboards / comics |
| Player | WASM reduced player / WebGL; Lottie-adjacent subset export where supported |

---

### Workspace Switching — Data Behavior Summary

| Data / UI state | On workspace switch | Editable where? |
|-----------------|---------------------|-----------------|
| Scene graph nodes / layers | **Preserved**; never converted or destroyed | Home workspace only; visible everywhere |
| Timeline + playhead | **Shared / preserved** | All (timing); content edits per home rules |
| Undo stack | **Project-wide**; uninterrupted | All |
| Palettes / asset library | **Shared** | All |
| Zoom / pan (view) | **Preserved per workspace** | View-only |
| Selection | **Preserved**; foreign home → Jump affordance | Edit in home |
| Panel layout | **Preserved per workspace** | — |
| In-progress stroke / deform / Live buffer | **Flushed to channels** then switch | — |
| Onion / Light Table / Live arming | Workspace-local UI state preserved | Draw / Rig respectively |
| Explicit bake / flatten | Only when user invokes | Produces new layer/keys; sources kept |

---

*End of Part 2. Part 3 — Unified Timeline & Scene Graph follows.*

---

# PART 3 — Unified Timeline & Scene Graph

## 3.1 Hierarchy

```
Project
 └─ Sequences[]
     └─ Scenes[] / ShotRefs[]
         └─ Layers[]
             └─ Channels[]          // e.g. transform.x, brush.frames, bone.rot
                 └─ Keyframes[]
```

Also: `assets[]`, `brushPresets[]`, `takes[]`, `comments[]`, `historyRefs[]`.

## 3.2 Timeline features

| Feature | Spec |
|---------|------|
| Mixed fps | Sequence declares `timebase`; scenes may run at different fps with resample policy `hold` \| `blend` \| `optical` |
| Keyframe types | `hold`, `linear`, `bezier` (cubic), `bounce`, `elastic` presets |
| Graph editor | Channel curves; bezier handles in value/time |
| Dope sheet | Key diamonds across layers; box select; scale timing |
| Markers | Scene/sequence markers with color, name, chapter export |
| Audio scrub | Waveform under timeline; scrubbing plays grains; lipsync viseme lane |

## 3.3 Layer blending across paradigms

**Render order:** Bottom → top layers; Composite node graph may override with explicit z.

**Color:** Working space **linear Rec.709** (or ACES opt-in Studio); display **sRGB OETF**. UI color pickers show sRGB; storage float linear.

**Alpha:** **Premultiplied** in GPU framebuffer; file IO converts to/from straight as needed. *Justification:* premultiplied matches GPU blending and AE-compatible export paths.

## 3.4 `.anima` zip format

See [`anima-format/SCHEMA.md`](./anima-format/SCHEMA.md). Summary:

```
project.anima  (zip)
  manifest.json
  project.json
  sequences/{id}.json
  scenes/{id}.json
  assets/...
  previews/...
  yjs/          optional collab snapshot
```

## 3.5 JSON schemas

Authoritative schemas live in `docs/anima-format/schemas/`. Inline summaries:

### Layer (example)

```json
{
  "id": "layer_ink",
  "name": "Ink",
  "type": "rasterStroke",
  "visible": true,
  "locked": false,
  "blendMode": "srcOver",
  "opacity": 1.0,
  "channels": ["ch_frames", "ch_opacity"],
  "metadata": { "onionEligible": true }
}
```

### Bone (example)

```json
{
  "id": "bone_forearm_L",
  "name": "Forearm_L",
  "parentId": "bone_upperarm_L",
  "length": 120,
  "rest": { "x": 0, "y": 0, "rotation": 0, "scaleX": 1, "scaleY": 1 },
  "ik": { "enabled": true, "targetId": "ctrl_hand_L", "poleId": "pole_elbow_L" },
  "limits": { "rotationMin": -2.4, "rotationMax": 0.2 }
}
```

### Keyframe (example)

```json
{
  "id": "kf_01",
  "frame": 12,
  "value": 80.0,
  "interp": "bezier",
  "handles": { "in": { "dt": -3, "dv": 0 }, "out": { "dt": 3, "dv": 0 } }
}
```

### Node (composite example)

```json
{
  "id": "node_glow",
  "type": "blur.gaussian",
  "inputs": { "image": "node_beauty.output" },
  "params": { "radius": 12, "sigma": 4 },
  "outputs": { "output": "tex" }
}
```

## 3.6 Non-destructive everything

Mutations append to an operation log (local) / Yjs updates (collab). Flatten, bake, and rasterize create **new** layers or cache artifacts; sources remain unless user deletes. AI outputs land as sibling layers or channel overrides with provenance metadata `createdBy: "ai:<feature>:<model>"`.

---

# PART 4 — Collaboration

## 4.1 CRDT choice: **Yjs over Automerge**

**Decision:** Yjs.  
**Justification:** Mature CRDT ecosystem for rich editors, shared types for maps/arrays/binary, and proven presence/awareness APIs suited to canvas cursors and soft locks — Automerge’s document model is excellent for JSON but weaker ecosystem fit for high-frequency drawing strokes.

## 4.2 Soft locks

Users claim a lock on `layerId` | `boneId` | `nodeId` with TTL heartbeat (15s). Others see amber outline; edits are blocked client-side but CRDT still converges if violated (server may reject write with lock token). Hard locks not used — *justification:* animation needs glance edits without bureaucracy.

## 4.3 Presence

Awareness field: `{ userId, name, color, workspace, selection[], cursorWorld, playhead }`. Render remote cursors and playhead ghosts.

## 4.4 Comments & voice hooks

Pin comments to `{ sceneId, frame, worldPos?, layerId? }`. Voice hooks: optional WebRTC room per sequence (Studio); recordings attach as audio assets linked to comment threads.

## 4.5 Git-semantics version control

Commits snapshot `.anima` (chunked). Branches for experiments. Visual diff: layer thumbnail scrub, channel curve overlay, bone hierarchy diff, node graph diff. Merge: Yjs-assisted for non-overlapping; conflict UI for same channel keys.

## 4.6 Asset library

Team/personal library: brushes, cels, rigs, behaviors, comps. Content-addressed blobs; reference by hash in project.

## 4.7 Review Mode (Studio)

Read-only timeline + drawing annotations + approval states (`draft|inReview|approved|rejected`). Playlist of shots; version compare A/B. Export review PDF/CSV notes.

---

# PART 5 — AI Layer

## 5.1 Hard rule

**Every AI feature must emit editable native ANIMA data** (strokes, fills, bones, weights, keyframes, nodes). Video/pixel-only outputs are forbidden as final artifacts; temporary preview rasters allowed if discarded or converted.

## 5.2 Feature specs

| Feature | Input | Output type | UI entry | Manual refine |
|---------|-------|-------------|----------|---------------|
| **Inbetweening** | Two+ key drawings on layer | Intermediate `StrokePath` frames / raster strokes | Timeline “AI Inbetween” | Edit strokes; delete/regenerate range |
| **Auto-rig** | Character layers / mesh | `Bone[]` + weights + controls | Rig Space “Auto-Rig” | Weight paint, bone edit |
| **Rough-to-clean** | Rough stroke layer | Cleanup stack output layer | Draw cleanup panel | Adjust cleanup params; tweak vectors |
| **Auto-color** | Line art + palette hint | Fill path layer | Paint “Auto Color” | Bucket fix, palette remap |
| **Text-to-animatic** | Script + style refs | Sequence of rough scenes + markers | File → New from Script | Redraw; retime X-sheet |
| **Audio-to-performance** | Dialogue audio | Viseme keys + jaw/energy channels | Live / Timeline “Bake Lipsync” | Viseme editor, offset |
| **Style transfer node** | Source image + style ref | Composite node writing new layer ref | Composite catalog | Node params; paint mask |
| **Mocap** | Video / Live take | Bone channel keys | Live “Apply Take” | Graph editor smooth |
| **Stop-motion cleanup** | Captured frames | Denoise + matte + optional vectorize | Stop Motion bay | Matte edges, timing |

## 5.3 Prompt bar architecture + safety rails

- Global prompt bar (`Ctrl+K` AI mode): intent parser routes to feature tools with structured args.
- Rails: block CSAM / weapons-for-harm prompts; refuse to generate photoreal minors; watermark AI provenance in metadata; user assets never train global models without opt-in (Studio contract).
- Credit metering on cloud; clear “on-device” badge when local.

## 5.4 On-device vs cloud

| On-device | Cloud |
|----------|-------|
| Light inbetween, cleanup preview, lipsync small models, face/hand track | Heavy inbetween, text-to-animatic, style transfer, long mocap solve |
| Offline: cloud features disable with queued jobs when back online | Requires Creator+ |

---

# PART 6 — Technical Architecture

## 6.1 Stack decision

| Layer | Choice | Justification |
|-------|--------|---------------|
| Core engine | **Rust + wgpu** (Vulkan/Metal/DX12) | Predictable perf, portable GPU, safe systems code for timeline & tessellation |
| Desktop UI | **Tauri 2 + React** (panels) | Smaller than Electron; web-skill UI; native FS; pairs with WASM preview |
| Panels alternative rejected | egui/iced or Qt | egui less designer-friendly for complex panel chrome; Qt heavier licensing/skills split |
| Scripting | **Python via PyO3** | Pipeline TDs expect Python |
| Expressions | **JS (QuickJS)** | AE-familiar expressions |
| Mobile | **Rust FFI** → Swift/Kotlin UI | Share engine |
| Web | **WASM reduced build** | Draw PoC + review player; no full Live farm |

## 6.2 Rendering pipeline

```
Scene Graph Eval → Drawable List → Tile Cache Query →
Tessellate/Stroke Raster → Layer Composite (premul linear) →
OCIO Display Transform → Swapchain
```

Composite Space inserts node graph eval before final composite.

## 6.3 Performance budgets (requirements)

| Budget | Target |
|--------|--------|
| UI frame (idle scrub) | ≤ 16.7 ms (60 Hz) |
| Stroke-to-ink | ≤ 16 ms p95 |
| Live Performance glass-to-glass | &lt; 100 ms |
| 4K timeline scrub (cached) | ≥ 24 fps interactive |
| Project open (1 GB) | ≤ 5 s to editable |
| Collab stroke sync | ≤ 100 ms LAN awareness |

## 6.4 Caching

Immutable tile cache keyed by `(layerId, frame, cameraHash, fxHash)`. LRU + disk mmap. Invalidation on channel edit.

## 6.5 Plugins

WASM + native dylib plugins via stable C ABI `anima_plugin_v1`. Signed for Studio. Manifest declares capabilities (nodes, brushes, importers).

## 6.6 Data safety

Local autosave every 30s + crash journal; cloud CRDT snapshots; encryption at rest (Studio); no silent cloud training; export checksums in manifest.

---

# PART 7 — UX & Onboarding

## 7.1 Density modes

| Mode | Use |
|------|-----|
| **Quick** | Large controls, fewer panels — students / tablet |
| **Standard** | Default |
| **Pro** | Compact, maximum timeline rows, minimal chrome |

## 7.2 First-run 3-minute tutorial

1. Draw a bouncing ball (30s)  
2. Onion + scrub (45s)  
3. Add layer + GIF export (45s)  
4. Peek Rig: one bone wave (60s)  
5. Switch Composite: glow node (30s)  

Skip anytime; progress stored in user prefs.

## 7.3 Command palette & shortcuts

`Ctrl+K` / `Cmd+K` command palette. Remappable shortcuts. Bundled maps: **Blender**, **After Effects**, **Harmony**, **Photoshop** (+ ANIMA default). Global: `Tab` cycles workspaces; `Ctrl+J` jumps to the selected layer’s home workspace (Part 2).

## 7.4 Accessibility

WCAG 2.2 AA for UI chrome; screen reader labels on panels; colorblind-safe onion tints option; full keyboard canvas navigation mode; scalable UI 80–200%.

## 7.5 ASCII wireframes

See [`WIREFRAMES.md`](./WIREFRAMES.md) for full Draw / Rig / Composite / Sequence Editor layouts.

---

# PART 8 — Export & Interop

## 8.1 Video formats

| Format | Notes |
|--------|-------|
| MP4 H.264 / H.265 | Social + delivery |
| ProRes 422 / 4444 | Studio finishing |
| WebM VP9/AV1 | Web |
| PNG / EXR sequence | VFX pipe |
| GIF / APNG / WebP anim | Loops |
| WAV / AAC audio | Muxed or separate |

## 8.2 Social presets

| Preset | Size | FPS | Notes |
|--------|------|-----|-------|
| YouTube 1080 | 1920×1080 | 24/30/60 | Free watermark |
| YouTube 4K | 3840×2160 | 24/30 | Creator+ |
| Instagram Feed | 1080×1080 | 30 | |
| Instagram Story / Reels | 1080×1920 | 30 | |
| TikTok | 1080×1920 | 30 | |
| Twitter/X | 1920×1080 | 30 | |

## 8.3 Import / export matrix

| Type | Import | Export |
|------|--------|--------|
| PSD / PSB (layers) | ✓ | ✓ (flattened layers optional) |
| TVG / Toon Boom partial | ✓ (paths best-effort) | — |
| SVG | ✓ | ✓ |
| PNG/JPEG/TIFF/EXR | ✓ | ✓ |
| MP4/MOV/WebM | ✓ (ref) | ✓ |
| glTF / FBX / OBJ | ✓ | glTF ✓ |
| ABR brushes | ✓ | — |
| Lottie (subset) | ✓ | ✓ subset |
| `.anima` | ✓ | ✓ |

## 8.4 Batch / render farm CLI

```bash
anima render project.anima --sequence seq_main --out /renders \
  --format prores422 --farm --workers 8 --frame 1001-1480
```

Watch folder mode for Studio. Exit codes: 0 ok, 2 validation, 3 render fail, 4 license.

---

## Document history

| Ver | Date | Notes |
|-----|------|-------|
| 0.2.0 | 2026-07-23 | Part 2 expanded to canonical three-workspace full spec |
| 0.1.0 | 2026-07-23 | Initial exhaustive Parts 1–8 |
