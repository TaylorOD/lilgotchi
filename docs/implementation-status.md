# Implementation status

Each stage gets its own branch and PR. Later branches may build on earlier work, but each PR must remain focused and be merged separately after approval.

| Stage | Status | Evidence and handoff |
| --- | --- | --- |
| 1. Standalone foundation | Implemented and browser checked | [PR 1](https://github.com/TaylorOD/lilgotchi/pull/1). Desktop and phone screenshots included |
| 2. Widget and storage | Implemented and initial browser checks passed | 30 tests pass. Custom element, private channel, host saves, static build and three install examples |
| 3. Default parity | Pending | Compare original actions and restore original presentation |
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

The current build is not the finished widget. Complete behavior parity, full custom art, bounds fixes, shell polish and the optional dialogue adapter remain pending. No live AI provider or personal site deployment is configured by this stage.

## Widget evidence

The parent browser review verified opening, character switching, persisted selection after reload, two independent inline games under hostile CSS, separate origin loading and saving, and a duplicate key showing a read only notice. Export downloaded a valid save envelope. Progress survived navigation and reload. The 320 pixel drawer is usable, with nested scrolling left for shell polish. Full import interaction remains part of final integration review.

Storage tests cover family isolation, writer ownership, stale revision rejection, expired leases, quota failure followed by further saves and reopen, blocked storage, preserved corrupt data and invalid imports. The build copies the static runtime and install examples without package dependencies.
