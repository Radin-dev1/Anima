# ANIMA

**One canvas. Three workspaces. Native data everywhere.**

ANIMA is a unified 2D/hybrid animation platform that merges frame-by-frame drawing, bone/mesh rigging with live performance capture, and node-based compositing into a single non-destructive scene graph — with AI that always emits editable native data, never baked pixels.

## Open the app

**The deployed site is the Draw Space prototype** (canvas, onion skin, layers, timeline, GIF export) — not a docs landing page.

**[→ Launch ANIMA Draw Space](https://radin-dev1.github.io/Anima/)**

> First-time setup: in the repo **Settings → Pages → Build and deployment → Source**, choose **GitHub Actions** if Pages is not already wired. Pushes to `main` rebuild and redeploy the app automatically.

## Run locally

```bash
cd prototype
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`). For a production build: `npm run build` → `prototype/dist` (served under `/Anima/` on Pages).

## Documentation

Specs live in the repo under `/docs` (they are **not** the public homepage).

| Document | Description |
|----------|-------------|
| [Product Spec](docs/PRODUCT_SPEC.md) | Parts 1–8: vision, workspaces, timeline, collab, AI, architecture, UX, export |
| [Architecture](docs/ARCHITECTURE.md) | Mermaid diagrams: engine, workspaces, AI, sync, render pipeline |
| [Wireframes](docs/WIREFRAMES.md) | ASCII layouts for Draw / Rig / Composite / Sequence Editor |
| [Roadmap](docs/ROADMAP.md) | 12-month / 6-milestone plan |
| [`.anima` Format](docs/anima-format/SCHEMA.md) | Zip layout + schema index |
| [Prototype notes](prototype/README.md) | Week-1 PoC plan |

## Pricing (summary)

| Tier | Price | Gating |
|------|-------|--------|
| **Free** | $0 | 1 project, 1080p export, local only, watermark on social presets |
| **Creator** | $19/mo | Unlimited projects, 4K, cloud sync (5 GB), AI cloud credits, no watermark |
| **Studio** | $79/seat/mo | Review mode, soft locks, render farm CLI, SSO, 500 GB library, priority AI |

See [PRODUCT_SPEC.md § Part 1](docs/PRODUCT_SPEC.md) for exact feature gates.

## Architectural spine

- **Scene graph**: `Project → Sequences → Scenes → Layers → Channels → Keyframes`
- **Three workspaces**: Draw · Rig · Composite — lenses on one graph + timeline ([Part 2](docs/PRODUCT_SPEC.md#part-2--three-workspace-architecture))
- **Core**: Rust + wgpu; desktop shell Tauri + React; web reduced WASM build
- **Collab**: Yjs CRDT; Git-semantics version control with visual diff
- **AI rule**: every AI feature outputs editable native ANIMA data

## Repo layout

```
Anima/
├── README.md                 # Repo readme (GitHub view)
├── .github/workflows/        # Pages deploy → prototype/dist
├── docs/                     # Product specs (not the live site)
└── prototype/                # Vite + TS Draw Space app (= deployment)
```

## License

Proprietary — all rights reserved until open-source decision at M4 review.
