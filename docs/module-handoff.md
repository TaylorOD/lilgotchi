# Module handoff

The foundation intentionally preserves the existing game modules. Later tasks can replace their interfaces together without rewriting the original reference.

| Area | Current files | Next owner |
| --- | --- | --- |
| Shell and lifecycle | `pets/widget.js`, `panel.js`, `widget.css` | Widget, then shell polish |
| State persistence | `pets/storage.js`, `boot.js` | Widget |
| Rules and timing | `pets/game.js`, `engine.js`, `constants.js`, `clock.js` | Default parity |
| Logical drawing | `pets/renderer.js` and render methods in `game.js` | Rendering |
| Artwork | `pets/classic-sprites.js`, `skins.js` | Default and character families |
| Original presentation | `pets/game.html`, `game.css`, `font.js`, `sound.js` | Default parity |
| Optional dialogue | New adapter plus controller hooks | Dialogue |

`GameState` provides reset, load, save and clearSave. `Evo` exposes evolution decisions. `setSimulationTime` controls the adapted clock for tests. `TamagotchiApp` owns actions and rendering. The current browser boot exposes `window.app`, which is a development aid rather than the planned public API.

The widget task should establish the frame channel and persistence interfaces before subsequent agents change them. The rendering task should establish a shared frame and anchor contract before custom art integration.

The source harness in `tests/upstream-harness.mjs` evaluates the original without booting the browser or performing network calls. It supplies a controlled Date and repeatable random sequence. Extend action comparisons there while keeping `reference/upstream.html` untouched.

`reference/contact-sheet.html` is the initial original art review surface. Extend a separate QA page for family and stage selection, fixed animation frames and reaction fixtures. Production controls must not expose test time or state mutation.

Keep source reference captures and final browser proof under `pr-screenshots/`. Capture actual game areas at desktop and phone sizes before pushing visual work.
