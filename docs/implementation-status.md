# Implementation status

Each stage gets its own branch and PR. Later branches may build on earlier work, but each PR must remain focused and be merged separately after approval.

| Stage | Status | Evidence and handoff |
| --- | --- | --- |
| 1. Standalone foundation | Implemented and browser checked | [PR 1](https://github.com/TaylorOD/lilgotchi/pull/1). Desktop and phone screenshots included |
| 2. Widget and storage | Implemented and initial browser checks passed | [PR 2](https://github.com/TaylorOD/lilgotchi/pull/2). Custom element, private channel, host saves, static build and three install examples |
| 3. Default parity | Implemented and browser checked | Original presentation and E ink restored. Controlled actions, screen buffers, raster colors and sound cues compared |
| 4. Bounds and animation | Pending | Establish full frame and anchor contract |
| 5. Slice family | Pending | Complete dough through secret adult artwork |
| 6. Cyberpunk family | Pending | Complete binary seed through secret adult artwork |
| 7. Shell polish | Pending | Responsive, keyboard and accessibility checks |
| 8. Dialogue adapter | Pending | Original trigger coverage with deterministic fake provider |
| 9. Integration and site migration | Pending | Release install checks and legacy save migration |

## Foundation evidence

`npm test` passes 15 existing game tests and 5 new source baseline tests. The baseline compares all original constants, sprite matrices and font data, 126 adult branch input combinations, and all original sprite buffers at deterministic positions.

`npm run inventory` records 21 sprite entries from the pinned original. The source integrity test checks the preserved file against its recorded SHA256.

The demo and reference pages are ready for browser review. Screenshots and a PR link should be recorded here after the owning agent finishes that review.

## Remaining release limits

The current build is not the finished widget. Documented offline and embedding differences remain. Full custom art, bounds fixes, shell polish and the optional dialogue adapter are pending. No live AI provider or personal site deployment is configured by this stage.

## Widget evidence

The parent browser review verified opening, character switching, persisted selection after reload, two independent inline games under hostile CSS, separate origin loading and saving, and a duplicate key showing a read only notice. Export downloaded a valid save envelope. Progress survived navigation and reload. The 320 pixel drawer is usable, with nested scrolling left for shell polish. Full import interaction remains part of final integration review.

Storage tests cover family isolation, writer ownership, stale revision rejection, expired leases, quota failure followed by further saves and reopen, blocked storage, preserved corrupt data and invalid imports. The build copies the static runtime and install examples without package dependencies.

## Default evidence

The Default task adds exact source CSS and restored settings, palette and lights off colors. Tests compare the original and fork under controlled time and randomness, including 864 logical screen compositions, both raster themes and all sound cues. The local `/qa/` page provides frozen source and fork views. Parent browser review confirmed idle, lights off and stats layouts against the source, inspected the phone layout, and checked E ink in the actual drawer. Screenshots are included. See `parity-status.md` for intentional behavior differences and remaining bounds work.
