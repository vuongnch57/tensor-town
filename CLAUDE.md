# AI Factory — project instructions

This repo builds **AI Factory**, an explorable isometric 3D reference site about AI data-center infrastructure.

## Source of truth
- `SPEC.md` is the full specification. Read it completely before any work, and re-read the relevant section before each phase.
- `design/tokens.json` holds the design tokens (colours, type, spacing, radii, shadows). Map them to Tailwind and to the 3D scene palette; never hard-code other colours.
- `design/reference/` holds the visual references for the 3D scene (see SPEC §4.13).
- Screen designs and the design system are linked in SPEC §4.12.

## Working rules
- Work **one phase at a time** (SPEC §10). When a phase is done: run the tests and the build, summarise what you built, list open questions and `TODO(fact)` items, and **stop for review**. Do not start the next phase until asked.
- All user-facing text is in **English** and lives in `src/content/`, never inside components.
- **Never invent technical facts or numbers.** Only use values from SPEC §8. Anything else gets `TODO(fact)` and a visible placeholder.
- Ask before adding any dependency not listed in SPEC §4.1 or §4.13.
- No NVIDIA logos or brand artwork. Footer text per SPEC §9.

## Commands
- `npm run dev` — local dev server
- `npm run build` — static build to `dist/`
- `npm test` — vitest (simulations, content checks)

## Code style
- TypeScript strict; small components named after factory objects; pure, tested functions for simulation, search and content checks.
- Commit after each meaningful step with messages like `feat(gpu-hall): …`, `content(storage-yard): …`.
