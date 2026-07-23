# ANIMA

**One canvas. Three workspaces. Native data everywhere.**

ANIMA is a unified 2D/hybrid animation platform that merges frame-by-frame drawing, bone/mesh rigging with live performance capture, and node-based compositing into a single non-destructive scene graph — with AI that always emits editable native data, never baked pixels.

## Quick links

| Document | Description |
|----------|-------------|
| [Product Spec](docs/PRODUCT_SPEC.md) | Full Parts 1–8: vision, workspaces, timeline, collab, AI, architecture, UX, export |
| [Architecture](docs/ARCHITECTURE.md) | Mermaid diagrams: engine, workspaces, AI, sync, render pipeline |
| [Wireframes](docs/WIREFRAMES.md) | ASCII layouts for Draw / Rig / Composite / Sequence Editor |
| [Roadmap](docs/ROADMAP.md) | 12-month / 6-milestone plan with team & risks |
| [`.anima` Format](docs/anima-format/SCHEMA.md) | Zip layout + schema index |
| [JSON Schemas](docs/anima-format/schemas/) | Layer, Bone, Keyframe, Node, Scene, Project |
| [Example Scene](docs/anima-format/examples/bouncing-ball-scene.json) | Bouncing ball + rig + glow node |
| [Prototype](prototype/README.md) | Week-1 in-browser PoC plan & run instructions |

## Run the prototype

Week-1 PoC: frame-by-frame drawing, onion skinning, layers, timeline playback, GIF export.

```bash
cd prototype
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

## Pricing (summary)

| Tier | Price | Gating |
|------|-------|--------|
| **Free** | $0 | 1 project, 1080p export, local only, watermark on social presets |
| **Creator** | $19/mo | Unlimited projects, 4K, cloud sync (5 GB), AI cloud credits, no watermark |
| **Studio** | $79/seat/mo | Review mode, soft locks, render farm CLI, SSO, 500 GB library, priority AI |

See [PRODUCT_SPEC.md § Part 1](docs/PRODUCT_SPEC.md) for exact feature gates.

## Architectural spine

- **Scene graph**: `Project → Sequences → Scenes → Layers → Channels → Keyframes`
- **Three workspaces**: Draw Space · Rig Space · Composite Space (shared graph, switch without bake)
- **Core**: Rust + wgpu; desktop shell Tauri + React; web reduced WASM build
- **Collab**: Yjs CRDT; Git-semantics version control with visual diff
- **AI rule**: every AI feature outputs editable native ANIMA data

## Repo layout

```
Anima/
├── README.md
├── docs/
│   ├── PRODUCT_SPEC.md
│   ├── ARCHITECTURE.md
│   ├── WIREFRAMES.md
│   ├── ROADMAP.md
│   └── anima-format/
│       ├── SCHEMA.md
│       ├── schemas/*.json
│       └── examples/bouncing-ball-scene.json
└── prototype/          # Vite + TypeScript in-browser PoC
```

## License

Proprietary — all rights reserved until open-source decision at M4 review.
