# public/models

Reserved for CC0 low-poly prop packs (trees, trucks, forklifts, containers, fences, lamps), per SPEC §4.13.

**Status: empty.** The build environment could not download the packs (kenney.nl returned 403 through the
sandbox proxy). The scene therefore uses procedural props in `src/three/primitives/` behind the same
component interface, so GLB models can replace them later without touching the zone scenes.

## To add them manually
1. Download the CC0 packs from https://kenney.nl/assets (suggested: *Nature Kit*, *City Kit (Commercial)*,
   *Car Kit* / *Train Kit*, *Conveyor Kit*).
2. Convert with `npx gltfjsx model.glb --transform` (gltfjsx is allowed as a dev-only tool, SPEC §4.13) and
   compress with Draco or Meshopt.
3. Put the `.glb` files here and list every pack in `LICENSE-NOTES.md` and on `/about`.

Only CC0 or otherwise clearly licensed assets. No paid assets.
