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

## Widget interface

The public entry is `lilgotchi.js`. It defines `<lil-gotchi>` and imports `widget/save-store.js`. Shell styling is in `widget/shell.css`. A private MessageChannel connects each element to its frame after checking parent origin, source window and a unique nonce.

`pets/storage.js` now exports `configureStorage(adapter)`. Embedded boot supplies synchronous `load()` and a `save(state)` callback that sends validated state to the host. Direct game pages retain their original storage path for reference testing. Keep those function exports stable.

`pets/boot.js` delays app creation until the host connection arrives. It handles `snapshot` requests, sends `save`, `ready`, `close` and sound `preference` messages, and receives `save-status`. Later dialogue support can extend this private protocol with validated message types. Public families map to the existing internal `classic`, `pizza` and `cyberpunk` values.

Default also sends the boolean `eink` preference through that channel. `TamagotchiApp` accepts optional `{eink, onThemeChange}` constructor options. The host passes both sound and E ink preferences at connection. Direct game pages use a guarded local theme preference instead.

`pets/game.css` is the complete original stylesheet and is checked against the pinned source. Keep embedding and accessible control differences in `pets/embed.css`. Custom families additionally load `pets/custom-themes.css` before starting the game. Do not put custom palette overrides back into the original stylesheet.

The host owns all embedded persistence. Do not read parent DOM or parent localStorage from the iframe. `SaveStore` handles validation, locks, leases, revisions, export data and confirmed replacement backups. A later site migration should use this adapter instead of changing frame storage.

Run `npm run build` to create the static distribution. `examples/nested/`, `examples/cross-origin.html` and `examples/duplicate.html` are the widget QA surfaces. Shell polish owns further accessibility and responsive improvements.

The source harness in `tests/upstream-harness.mjs` evaluates the original without booting the browser or performing network calls. It supplies a controlled Date and repeatable random sequence. Extend action comparisons there while keeping `reference/upstream.html` untouched.

`reference/contact-sheet.html` is the initial original art review surface. Extend a separate QA page for family and stage selection, fixed animation frames and reaction fixtures. Production controls must not expose test time or state mutation.

`qa/index.html` now supplies that separate review surface. Its controls select all original identities, reactions, frame and theme. `qa/fixtures.js` is shared with a frozen source view. `qa/frame.js` mounts the current game markup without production boot and uses a no save adapter. These files do not enter the release build. Later art agents can use the family selector directly.

The Default screen comparison now omits only the original EGG label and heart draw operations, because those indicators moved below the LCD. All body and effect buffers still compare against the source. Raw sprites, font, paint and sound remain strict. Read [frame-contract.md](frame-contract.md) before adding art. The layout module derives opaque bounds and places complete matrices without overlaps. Custom bodies use equally padded frames up to 16 by 12, and eggs up to 16 by 10. The combined QA fixture and Animate fork checkbox cover the tightest live compositions.

Keep source reference captures and final browser proof under `pr-screenshots/`. Capture actual game areas at desktop and phone sizes before pushing visual work.
