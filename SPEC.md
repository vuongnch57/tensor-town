# AI Factory — Explorable 3D Reference Site

**Specification for implementation by Claude Code**
Owner: Glenn · Version 2.0 · October 2026

---

## 0. How to use this document (instructions for Claude Code)

- Read this whole file before writing code. It is the single source of truth, together with the design references in §4.12.
- Implement **one phase at a time** (§10). At the end of each phase, stop, summarise what was built, list anything you were unsure about, and wait for review.
- **Do not invent technical facts.** Numbers and specific claims shown to users must come from §8. If content needs a fact that is not there, write `TODO(fact)` in the content file and show a visible placeholder.
- All user-facing text lives in content files (§4.7), never hard-coded in components.
- **The whole site is in English.**
- Prefer simple, readable code. The owner is an experienced React developer, new to Three.js.

---

## 1. Product overview

### 1.1 What it is
A static website that visualizes AI data-center infrastructure (the topics of the NVIDIA AI Infrastructure and Operations / NCA-AIIO syllabus) as one **explorable isometric 3D factory**. Data is cargo, GPUs are production halls, memory and storage are warehouses, networks are roads and rails, operations is a control room.

It is a **reference, not a course**. There are no steps, no lessons, no quizzes and no progress tracking. Users open any zone and click any object, in any order, to see:
- **what it is** (concept and factory metaphor),
- **key facts** (verified specs),
- **how it compares** with what it is often confused with,
- **related items** elsewhere in the factory.

### 1.2 Goals
1. Make abstract infrastructure concepts visible: where data flows, where the bottleneck is, which technology fixes it.
2. Make everything discoverable: users must always know what is clickable (numbered hotspots, a per-zone index, a site-wide Index page).
3. Make comparisons first-class: every concept links to a side-by-side comparison.
4. Be a portfolio piece showing React + 3D skills.

### 1.3 Non-goals
- Not an official NVIDIA resource. No NVIDIA logos, artwork or trade dress.
- Not a course: no step sequences, quizzes, scores or completion states.
- Not a real simulator: simulated numbers are illustrative and labelled so.
- No backend, accounts, CMS or analytics in v1.

### 1.4 Audience
Developers, IT staff and students who want an intuitive picture of AI data centers, including people preparing for NCA-AIIO. Assume no prior infrastructure knowledge.

---

## 2. The core metaphor

Every scene uses this mapping consistently.

| Concept | Factory metaphor | Visual |
|---|---|---|
| Data | Parcels / crates | Small rounded boxes moving on paths |
| CPU | Manager's office | Small office; coordinates, does not do bulk work |
| GPU | Production hall | Large hall full of workers |
| SM | Workshop cell inside the hall | Repeated cells in a grid |
| CUDA core | Worker | Tiny figure; animates when busy, grey when idle |
| Tensor Core | Stamping press | Machine that processes a whole tray at once |
| HBM | Warehouse next to the hall | Blue shelving building |
| Memory bandwidth | Conveyor speed | Belt from warehouse into hall |
| Number formats | Crate sizes | Big / half / quarter crates; more fit on a truck |
| PCIe | Shared service corridor | Narrow corridor |
| NVLink | Sky-bridge between GPU rooms | Enclosed bridge |
| NVSwitch | Central sorting hub | Hub connecting all rooms |
| DGX / HGX | Complete building / its 8-room core sold to builders | Building with 8 rooms |
| InfiniBand | Private freight rail | Never drops cargo |
| Ethernet (traditional) | Public road | Under congestion, parcels fall off and are re-sent |
| Spectrum-X | Road with smart traffic control | Adaptive routing signs |
| DPU (BlueField) | Gatehouse and mailroom | Gatehouse at the entrance |
| GPUDirect RDMA / Storage | Courier delivering straight into the hall | Path bypassing the manager's office |
| Local NVMe cache | Shed next to the building | Shed |
| Parallel file system | Central campus warehouse | Large shared warehouse |
| Object storage | Remote depot at the port | Far away, cheaper, slower |
| Checkpoint | Snapshot of the production line | Copy sent to the warehouse |
| Training | Production line being built | Many workers, long time |
| Inference | 24/7 shop | Queue of customers, each served fast |
| NGC / RAPIDS / TensorRT | Tool store / prep area / compactor | Stations on the line |
| Triton / NIM | Configurable shipping dock / pre-packed box | Dock |
| Slurm | Dispatcher with a ticket queue | Desk with tickets |
| Kubernetes | Container yard with cranes | Cranes moving containers |
| MIG / time-slicing / vGPU | Hall split by walls / shift schedule / rented booths | Walls, clock, booths |
| DCGM | Control-tower sensors | Tower with screens |
| Power, cooling, PUE | Substation, chillers, coolant pipes, power meter | Facility buildings |
| BasePOD / SuperPOD | Campus built from standard blocks | Repeating blocks |

---

## 3. Site structure

### 3.1 Pages
- `/` **Map.** Isometric overview with 9 zone markers, a search box that highlights matching zones, zone cards (with counts of clickable items), and "Popular comparisons".
- `/zone/:slug` **Zone page.** Zone index (left), 3D scene with numbered hotspots and a "Simulate" bar (centre), detail panel (right). Selecting an item updates the URL: `/zone/:slug/:itemId`, so every item is linkable.
- `/index` **Index.** Every clickable item on the site (objects and concepts), grouped by zone or A–Z, filterable by type and category, searchable.
- `/compare/:compareId` **Compare.** List of comparisons on the left, CompareTable on the right, "Why people mix them up" note. Concepts can be added or removed (2–3 columns).
- `/about` **About.** What the site is, how to use it, disclaimer, credits.

### 3.2 Zones

| # | Slug | Title | Objects (numbered hotspots) | Concepts (no pin) |
|---|---|---|---|---|
| 1 | `gpu-hall` | GPU Hall | Data, CPU, GPU, SM, CUDA core, Tensor Core, HBM, Memory bandwidth | CPU vs GPU, Memory- vs compute-bound, Training vs inference |
| 2 | `packing-station` | Packing Station | FP32 crate, BF16/FP16 crate, FP8 box, INT8 box, Delivery truck, Transformer Engine | TF32, Mixed precision, Quantization |
| 3 | `dgx-building` | DGX Building | GPU room, NVLink bridge, NVSwitch hub, HGX board, DGX system | PCIe, MGX, Grace Hopper (GH200), Scale-up vs scale-out |
| 4 | `transport-network` | Transport Network | DGX node, DPU gatehouse, InfiniBand rail, Ethernet road, Dropped parcels, Spectrum-X control | RDMA, RoCE, GPUDirect RDMA, Four cluster networks, Scale-out |
| 5 | `storage-yard` | Storage Yard | GPU hall, NVMe cache shed, Parallel file system, Object storage depot, GPUDirect Storage, Checkpoint | Read and re-read, Epoch, Storage fabric |
| 6 | `production-line` | Production Line | NGC, RAPIDS, Training line, TensorRT, Shipping dock (Triton, NIM), 24/7 shop, Customer queue | CUDA and CUDA-X, NCCL, NVIDIA AI Enterprise, Training vs inference |
| 7 | `control-room` | Control Room | Control tower (DCGM), Dispatcher desk (Slurm), Partitioned hall (MIG), Shift-scheduled hall (time-slicing), Container yard (Kubernetes), Cluster manager (Base Command Manager) | vGPU, nvidia-smi, The 100% utilization trap, Workload management, MLOps |
| 8 | `power-cooling` | Power and Cooling | Substation, GPU rack, Air-cooled hall, Liquid cooling loop, Chillers, PUE meter | GPU heat output, Rack power density |
| 9 | `campus-expansion` | Campus Expansion | Scalable unit, SuperPOD campus, Expansion plot, Rented capacity | DGX BasePOD, Reference architecture, GB200 NVL72, On-prem vs cloud vs hybrid, Data sovereignty |

Totals: 54 objects, 34 concept entries (one, Training vs inference, appears in two zones and shares one content entry).

### 3.3 Comparisons (15)
CPU vs GPU · HBM vs GDDR · Training vs inference · FP32 / BF16 / FP8 / INT8 · NVLink vs NVSwitch vs PCIe · DGX vs HGX vs MGX · InfiniBand vs Ethernet vs Spectrum-X · GPUDirect RDMA vs GPUDirect Storage · Storage tiers (NVMe / parallel FS / object) · Triton vs NIM · Slurm vs Kubernetes · MIG vs time-slicing vs vGPU · Air vs liquid cooling · BasePOD vs SuperPOD · On-prem vs cloud vs hybrid.

---

## 4. Technical architecture

### 4.1 Stack
- **Vite + React 18 + TypeScript** (strict).
- **@react-three/fiber** and **@react-three/drei** (`OrthographicCamera`, `RoundedBox`, `ContactShadows`, `Html`, `Instances`, `PerformanceMonitor`).
- **maath** for camera and value easing.
- **zustand** for shared state (selected item, simulation parameters, search query).
- **react-router-dom**, **Tailwind CSS**, **vitest**.
- A small client-side search (e.g. **minisearch**) over the content index. No other runtime dependencies without asking.

### 4.2 Static build and hosting
`npm run build` produces a static `dist/`. Targets: Vercel or Cloudflare Pages, with SPA fallback (`vercel.json` rewrite, `public/_redirects`).

### 4.3 Folder structure
```
src/
  app/                 # router, layout, providers
  pages/               # MapPage, ZonePage, IndexPage, ComparePage, AboutPage
  three/
    core/              # IsoCamera, Lighting, Ground, palette, materials
    primitives/        # Parcel, Worker, Building, Conveyor, Path, Hotspot
    zones/<slug>/      # Scene.tsx, sim.ts, sim.test.ts, anchors.ts
  ui/                  # ZoneIndex, DetailPanel, CompareTable, SimulateBar, Search, ZoneMarker, Fallback2D
  content/
    zones.ts           # zone list
    items/<slug>.ts    # objects and concepts per zone
    comparisons.ts
  state/               # zustand stores
  lib/                 # search, webgl detection, url helpers
```

### 4.4 Scene conventions
- **Camera:** orthographic isometric (elevation ≈ 35°, azimuth 45°). Selecting an item eases the camera toward that object (≈0.4 s); a "Reset view" button returns to the zone overview. No free orbit in v1.
- **Geometry:** built procedurally from primitives (`RoundedBox`, cylinders). No external models needed in v1; CC0 low-poly assets may replace primitives later behind the same component interfaces.
- **Instancing** for parcels and workers; a zone scene stays under ~150 draw calls.
- **Lighting:** hemisphere + one directional light with soft shadows; `ContactShadows`. Shadows off on low-power devices.
- **Selection feedback:** the selected object gets an emissive tint and its hotspot turns `accent`; other objects dim slightly. Hovering an index row highlights its object.

### 4.5 Visual tokens
Use the AI Factory design system tokens (§4.12): UI tokens `surface-*`, `line`, `ink`, `muted`, `accent`, `warn`; scene tokens `scene-*` (hall orange, storage blue, network lilac, parcel sand, parcel-hot coral, idle grey). Font: Be Vietnam Pro. Dark theme for the 2D UI; the 3D scene keeps daylight colours in both themes.

### 4.6 Item model (core abstraction)
Every clickable thing is an **item**. Objects have a scene anchor and a hotspot number; concepts do not.

```ts
type ItemKind = 'object' | 'concept';

type Item = {
  id: string;                 // unique across the site, e.g. 'hbm'
  zone: ZoneSlug;
  kind: ItemKind;
  number?: number;            // objects only; matches the hotspot and the zone index
  name: string;               // "HBM"
  category: string;           // "Memory"
  metaphor: string;           // "The warehouse next to the GPU hall"
  swatch?: string;            // scene token for the metaphor swatch
  summary: string;            // 2–3 sentences
  facts: { label: string; value: string }[];   // from §8 only
  compare?: { with: string[]; rows: CompareRow[]; fullCompareId?: string };
  related: string[];          // item ids, same zone or other zones
  anchorId?: string;          // objects: id of the 3D anchor in anchors.ts
  sim?: Partial<SimParams>;   // optional: simulation state to apply on select
};
```

- **Hotspots** render from items with `kind: 'object'` via drei `Html` at the anchor position: numbered dot plus short label. Labels hide below 640px; the selected one keeps its label.
- **ZoneIndex** lists the zone's objects by number, then its concepts (marked "+"), with counts ("8 clickable objects · 3 concepts").
- **DetailPanel** renders the selected item in fixed order: eyebrow (category · zone · #number), name, metaphor, summary, key facts, compact comparison with "Full comparison ›", related chips. Empty state: zone overview and "Click any numbered object".
- Selecting from the scene, the index, a related chip, search or a URL all go through one `select(itemId)` action.

### 4.7 Content files
- `content/items/<slug>.ts` exports the zone's items; `content/comparisons.ts` exports the 15 comparisons (`{ id, title, zone(s), columns: itemId[], rows, whyConfused }`).
- A build-time check (vitest) asserts: every `related` and `compare.with` id exists; object numbers are unique and continuous per zone; every object has an anchor; no fact appears that is not in the facts allow-list (§8) unless marked `TODO(fact)`.

### 4.8 Search and Index
- One search index built from items and comparisons (name, category, aliases, summary).
- Header search on every page: results grouped as Items and Comparisons; Enter opens the first result. `/` focuses search.
- Map page: typing highlights zones with matches and lists matched items on their markers.
- Index page: group by zone or A–Z; filters for type (objects / concepts) and category; each row links to `/zone/:slug/:itemId`.

### 4.9 Simulation ("Simulate" bar)
Some zones have a floating bar under the scene with SegmentedControls, sliders or a run button, and one or two inline stats. Each is a pure, unit-tested `simulate(params)` in `sim.ts`. Every simulated value is labelled "Illustrative, not measured". Simulation is optional for understanding: all content lives in items.

| Zone | Controls | Output |
|---|---|---|
| 1 | Workload (Training / LLM inference), GPU (H100 / H200), Format (FP16 / FP8) | SMs busy %, bottleneck (memory / compute) |
| 2 | Format (FP32 / BF16 / FP8 / INT8), Model size (7B / 13B / 70B) | Weight memory (params × bytes), fits on 80 GB? |
| 3 | Interconnect (PCIe only / NVLink / NVLink + NVSwitch), Run all-to-all | Relative exchange time |
| 4 | Network (InfiniBand / Ethernet / Spectrum-X), Congestion slider | Effective throughput, dropped packets |
| 5 | Cache on/off, Path (via CPU / GPUDirect), Next epoch | Fetch time per epoch, % read from cache |
| 6 | Business need picker | Which station lights up |
| 7 | GPU sharing (MIG / time-slicing / vGPU) | GPU utilization vs SM activity (the 100% trap) |
| 8 | Rack density slider, facility MW, IT MW | Suggested cooling, PUE = facility ÷ IT |
| 9 | Architecture (BasePOD / SuperPOD), Deployment (on-prem / cloud / hybrid), unit count | DGX count, GPU count, own-vs-rent illustration |

Zone 1 toy model (illustrative): `dataSupply = bandwidthTBs / bytesPerValue`; `smBusy = clamp(dataSupply * intensity / capacity, 0.05, 1)`; calibrate so training ≈ 0.9–1.0 (compute-bound), LLM inference H100 FP16 ≈ 0.35, H200 FP16 ≈ 0.5, H100 FP8 ≈ 2× the FP16 value (capped at 1). Unit tests assert these ranges and monotonicity.

### 4.10 Accessibility and fallbacks
- Hotspots are real buttons with `aria-pressed`; the zone index provides the same targets without the scene.
- Detail panel is `aria-live="polite"`.
- `prefers-reduced-motion`: no camera fly-throughs (cut), parcels slow or static.
- No WebGL: render `Fallback2D` (the zone's static isometric image with the same numbered pins) plus the full index and detail panel.

### 4.11 Performance
- 60 fps desktop, 30 fps mid-range phone. DPR clamped to [1, 2]; `PerformanceMonitor` reduces parcels and disables shadows when needed.
- Code-split per zone with `React.lazy`; initial JS (gzipped) under 400 KB excluding the zone chunk.
- Mobile: scene on top, "Index · N" button opens the zone index sheet, detail panel as a bottom sheet with previous / next item buttons.

### 4.12 Design references
- **Design system** (tokens, typography, components Hotspot, ZoneIndex, DetailPanel, CompareTable, SegmentedControl, StatCard, Button, ZoneMarker): https://claude.ai/artifact/1mLG1TwmBVDMjhQpryNLen
- **Screens**: https://claude.ai/artifact/CYc8fWCYNAWcEyn3LmhH7p
  - Page "Shared pages": Map, Compare, Index, About.
  - Page "Zone 1": desktop and mobile.
  - Page "Zones 2–9": one desktop screen per zone showing its index, hotspots with numbers and positions, one selected item in the detail panel, and its Simulate bar.
- Copy `tokens.json` from the design system into the repo and map it to Tailwind theme values and the scene palette. Where the screens and this spec differ on layout, follow the screens; on behaviour and content rules, follow this spec.
- Hotspot positions in the screens come from static images; in 3D, define anchors per object in `anchors.ts` instead.
- Values shown as `[X]` or `[Threshold to verify]` in the screens are placeholders: treat them as `TODO(fact)`.
- **The isometric pictures in the screens are rough placeholders**, generated from flat boxes. They define what objects exist and roughly where; they are **not** the visual target for the 3D scene. The visual target is §4.13.

### 4.13 Visual quality bar (3D scene)

The 3D scene must look like a polished product illustration, not a prototype made of grey boxes.

**Reference images** (in `design/reference/`, provided by the owner):
- `ref-1-island.png`: soft pastel isometric island with rounded low-poly houses, trees, a river, numbered markers and small parcels showing data flow.
- `ref-2-warehouse.png`: clean isometric logistics scene with detailed buildings, pallets, forklifts and trucks, and floating white UI cards beside the scene.

Use them for **style and level of finish only**. Do not copy their brand names, logos or exact compositions.

**What "done" looks like**
1. **Shapes:** every building, machine and vehicle is built from rounded geometry (`RoundedBox` radius 0.04–0.1 of the object size) or a low-poly model; no sharp default cubes. Buildings have readable details: roofs with a slight overhang, doors, windows or vents, rails, shelves.
2. **Lighting:** soft daylight. Hemisphere light plus one warm directional light, an `Environment` preset for gentle reflections, ACES filmic tone mapping. No harsh black shadows.
3. **Shadows and depth:** soft shadows (`AccumulativeShadows` or `SoftShadows` for static scenes, `ContactShadows` under objects) and ambient occlusion (N8AO via `@react-three/postprocessing`). Objects must look grounded, never floating.
4. **Materials:** matte `MeshStandardMaterial` (roughness 0.6–0.9, metalness ≈ 0) in the `scene-*` palette; at most a slight gradient or emissive tint for highlights. Colours stay consistent per building type across all zones.
5. **Life:** every zone has gentle ambient motion: parcels moving along paths, workers bobbing when busy, a slow vehicle or crane, trees swaying slightly. Motion is calm (no fast or flashing animation) and respects `prefers-reduced-motion`.
6. **Composition:** each zone sits on its own rounded "diorama" base (like ref-1) with a clear focal object, enough empty ground to breathe, and a few decorative props (trees, lamps, fences, crates). Nothing important hidden behind other objects at the default camera angle.
7. **Selection:** the selected object gets a soft outline or emissive rim plus a gentle lift or pulse; others dim by ~15%. Hover shows a lighter version of the same effect.
8. **Performance still holds:** the §4.11 budgets apply; use `PerformanceMonitor` to drop AO and accumulated shadows on weak devices before dropping anything else.

**Assets**
- Prefer **CC0 low-poly packs** (for example Kenney's city, industrial, nature and vehicle kits) for props: trees, trucks, forklifts, containers, fences, lamps. Convert with `gltfjsx`, compress with Draco or Meshopt, and list every pack on `/about`.
- Build the zone-specific "hero" objects (GPU hall with SM cells, HBM warehouse, NVSwitch hub, DPU gatehouse, control tower) procedurally in code so they can show internal states (busy, idle, highlighted).
- No paid assets and no assets whose licence is unclear.

**Process**
- In Phase 1, finish **Zone 1 to this bar first**, including props, lighting, AO and motion. Take screenshots at 1440 px and 390 px and stop for owner review before any other zone. Zones 2–9 reuse the same lighting rig, materials and prop library.
- Keep lighting, post-processing and materials in `three/core/` so every zone gets the same look.
- New dependencies allowed for this section: `@react-three/postprocessing` and `gltfjsx` (dev only).

---

## 5. Zone page layout (desktop)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ AI Factory / Zone 1 · GPU Hall          [ Search… ]   Map Index Compare  │
├──────────────┬──────────────────────────────────────┬────────────────────┤
│ ZONE 1 INDEX │ GPU Hall                [Click any…] │ MEMORY·ZONE 1·#7   │
│ 8 objects·3  │                                      │ HBM                │
│ ① Data       │        3D scene with numbered        │ In the factory: …  │
│ ② CPU        │        hotspots ①…⑧                  │ Summary…           │
│ …            │                                      │ KEY FACTS          │
│ ⑦ HBM  ◀     │                                      │ COMPARE  HBM|GDDR  │
│ CONCEPTS     │ ┌ Simulate: [Workload][GPU][Format] ┐│ RELATED chips      │
│ + CPU vs GPU │ └ SMs busy 35% · Memory-bound       ┘│                    │
└──────────────┴──────────────────────────────────────┴────────────────────┘
```

---

## 6. Zone 1 (first zone) — full content

### 6.1 Objects and anchors
| # | id | Name | Category | Metaphor |
|---|---|---|---|---|
| 1 | `data` | Data | Input | Parcels arriving on the road |
| 2 | `cpu` | CPU | Compute | The manager's office |
| 3 | `gpu` | GPU | Compute | The production hall |
| 4 | `sm` | SM | GPU part | A workshop cell inside the hall |
| 5 | `cuda-core` | CUDA core | GPU part | A worker |
| 6 | `tensor-core` | Tensor Core | GPU part | A stamping press that handles a whole tray |
| 7 | `hbm` | HBM | Memory | The warehouse next to the GPU hall |
| 8 | `memory-bandwidth` | Memory bandwidth | Memory | The conveyor from warehouse to hall |

Concepts: `cpu-vs-gpu`, `memory-vs-compute-bound`, `training-vs-inference`.

### 6.2 Example entry (HBM)
- Summary: "High Bandwidth Memory is the GPU's main memory: stacked DRAM placed right beside the chip. Capacity sets how large a model fits on one GPU; bandwidth sets how fast data reaches the cores. For LLM inference, HBM bandwidth is usually the bottleneck, not compute."
- Key facts: H100 SXM: 80 GB HBM3 · ~3.35 TB/s; H200: 141 GB HBM3e · ~4.8 TB/s; Hierarchy: Registers → L1 → L2 (50 MB) → HBM.
- Compare with GDDR: Placement (stacked beside the chip / spread on the board), Bandwidth (very high / lower), Cost (higher / lower), Found in (data center GPUs / gaming GPUs).
- Related: `memory-bandwidth`, `memory-vs-compute-bound`, `fp8` (Zone 2), `gpudirect-storage` (Zone 5).

Write the other Zone 1 entries in the same shape. The screens show the selected item for each zone as a style and depth reference.

---

## 7. Zones 2–9
For each zone: build the scene objects listed in §3.2 with anchors, write every item entry (§4.6), and the simulation in §4.9. The zone screens in §4.12 show the expected depth for one item per zone:

- Zone 2: **FP8** (vs BF16), Transformer Engine chooses per layer.
- Zone 3: **NVSwitch** (vs NVLink); DGX H100 has 4 NVSwitch chips; NVLink 900 GB/s per H100 GPU.
- Zone 4: **Ethernet for AI** (vs InfiniBand); must state that running AI on Ethernet needs careful attention to bandwidth, latency and congestion.
- Zone 5: **Local NVMe cache** (vs parallel FS and object storage); must state that the best AI storage is the one with the best read and re-read performance.
- Zone 6: **Triton and NIM** (Triton vs NIM).
- Zone 7: **Slurm** (vs Kubernetes); also the "100% utilization trap" concept (GPU utilization vs SM activity in DCGM).
- Zone 8: **Liquid cooling** (vs air); air-cooling threshold is `TODO(fact)`.
- Zone 9: **DGX SuperPOD** (vs BasePOD); 32 DGX per scalable unit (H100 generation).

Each comparison in §3.3 gets a full entry in `comparisons.ts` with 4–6 rows, the first row being "In the factory", and a one-paragraph "Why people mix them up".

---

## 8. Verified facts (the only numbers allowed)

| Fact | Value |
|---|---|
| H100 SXM SM count | 132 |
| CUDA cores (FP32) per H100 SM | 128 |
| Tensor Cores per H100 SM | 4 (4th generation) |
| Threads per warp | 32 |
| H100 SXM memory | 80 GB HBM3, ~3.35 TB/s |
| H200 memory | 141 GB HBM3e, ~4.8 TB/s |
| H100 L2 cache | 50 MB |
| NVLink bandwidth per H100 GPU | 900 GB/s total |
| PCIe Gen5 x16 | ~128 GB/s bidirectional |
| NVLink on Blackwell | 1.8 TB/s per GPU |
| DGX H100 | 8× H100 GPUs, 4 NVSwitch chips |
| DGX SuperPOD scalable unit (H100 generation) | 32 DGX systems |
| GB200 NVL72 | 72 Blackwell GPUs + 36 Grace CPUs in one NVLink domain |
| ConnectX-7 | up to 400 Gb/s |
| Format sizes | FP32 4 B, FP16/BF16 2 B, FP8/INT8 1 B |
| Format bits (exponent/mantissa) | FP32 8/23, TF32 8/10, FP16 5/10, BF16 8/7, FP8 E4M3 or E5M2 |
| Tensor Core firsts | Volta FP16; Turing INT8/INT4; Ampere TF32, BF16, structured sparsity, MIG; Hopper FP8 + Transformer Engine; Blackwell FP4 |
| Grace Hopper (GH200) | Grace CPU + Hopper GPU connected by NVLink-C2C |
| PUE | Total facility power ÷ IT equipment power |

Any other number requires `TODO(fact)`.

---

## 9. Legal and content rules
- No NVIDIA logos, product photos or brand colour schemes used as branding. Product names may appear in text.
- Footer on every page: "Personal project, not affiliated with NVIDIA. Simulated numbers are illustrative."
- Do not copy text from NVIDIA, Coursera or Packt materials. All copy is original.
- Credit any CC0 assets on `/about`.

---

## 10. Implementation phases and acceptance criteria

### Phase 0 — Scaffold
Vite + React + TS + Tailwind + R3F + drei + postprocessing + zustand + router + vitest; the shared lighting rig and materials from §4.13 in `three/core/`; download the chosen CC0 prop packs into `public/models/` with a licence note; routes `/`, `/zone/:slug(/:itemId)`, `/index`, `/compare/:id`, `/about` with placeholders; tokens wired to Tailwind; IsoCamera, Lighting, Ground; item types; content-check test.
**Done when:** dev, build and test all pass; a placeholder isometric ground renders; deploy config exists.

### Phase 1 — Zone 1 end to end
Scene, 8 hotspots with anchors, ZoneIndex, DetailPanel, all 11 Zone 1 items, compact comparisons, Simulate bar with tested sim, URL per item, reduced motion, 2D fallback, mobile layout (bottom sheet, index sheet).
**Done when:** every item is reachable from the scene, the index and the URL; content checks pass; the scene meets every point of the visual quality bar (§4.13) and screenshots at 1440 px and 390 px are attached to the phase summary; Lighthouse performance ≥ 80 desktop; works at 375 px.

### Phase 2 — Map, Index, Compare, Search, About
Map with 9 markers and search highlighting; Index page with grouping, filters and search; Compare page with all comparisons that have content so far; header search; About.
**Done when:** search finds every Zone 1 item and comparison; Index lists every item with correct links.

### Phase 3 — Zones 2–5
One zone at a time (scene, anchors, items, comparisons, sim). Stop for review after each zone.

### Phase 4 — Zones 6–9
Same as Phase 3. At the end, all 54 objects, 34 concept entries and 15 comparisons exist and pass content checks.

### Phase 5 — Polish
Optional CC0 assets, share images per zone and per comparison, sound toggle (off by default).

---

## 11. Coding conventions
- TypeScript strict; no `any` without a comment.
- Components named after metaphor objects (`Conveyor`, `Worker`, `StampingPress`), not NVIDIA products, except inside zone folders.
- No allocations inside `useFrame`.
- Simulation, search and content checks are pure, tested functions; components hold no business logic.
- Commit messages: `feat(gpu-hall): …`, `fix(core): …`, `content(storage-yard): …`.
