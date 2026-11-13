# Working on lilgotchi

Node.js is all you need. There are no dependencies to install.

```sh
npm start
npm test
npm run build
```

Open [localhost:4176](http://localhost:4176). The build goes in `dist`. Keep that whole folder together when hosting it.

## Where things live

| Area | Files |
| --- | --- |
| Widget and drawer | `lilgotchi.js`, `widget/shell.css` |
| Hosted script | `embed.js` |
| Saves and backups | `widget/save-store.js`, `pets/storage.js` |
| New game models | `pets/minigames/` |
| Game rules | `pets/engine.js`, `pets/constants.js`, `pets/game.js` |
| Time and wellbeing | `pets/clock.js`, `pets/away.js`, `pets/wellbeing.js` |
| Drawing and movement | `pets/renderer.js`, `pets/layout.js`, `pets/presentation.js` |
| Character art | `pets/*-sprites.js`, `pets/skins.js` |
| Controls and screen | `pets/game.html`, `pets/embed.css`, `pets/custom-themes.css` |
| Frame connection | `pets/boot.js` |

The host owns saves. An isolated iframe runs the game. They talk through a private MessageChannel that checks the origin, frame and connection token. Keep save validation and ownership checks in place.

## Custom element

```html
<script type="module" src="/assets/lilgotchi/lilgotchi.js"></script>
<lil-gotchi character="slice" storage-key="site-pets"></lil-gotchi>
```

Use the [script settings](install.md) without `data-` on the element. Set them before adding it to the page.

```js
const pet = document.querySelector('lil-gotchi');
await pet.open();
await pet.setCharacter('cyberpunk');
await pet.close();
```

Events are `lilgotchi:ready`, `lilgotchi:open`, `lilgotchi:close`, `lilgotchi:characterchange` and `lilgotchi:error`. The script emits `lilgotchi:loaderror` if loading fails.

## Styling and hosting

Shell variables are `--lilgotchi-surface`, `--lilgotchi-text`, `--lilgotchi-accent`, `--lilgotchi-spacing` and `--lilgotchi-z`. The launcher exposes `lil-gotchi::part(launcher)`. These don’t recolor the game inside its iframe.

Serve modules with a JavaScript content type. If assets live on another origin, enable CORS and allow your site to frame the game. A content security policy needs the asset origin in `script-src`, `style-src` and `frame-src`. The game frame also uses inline styles. No game API connection is needed.

## Saves

Keep the storage key stable. Validate imported files before replacing progress. Damaged saves must stay recoverable. Web Locks allow one active writer per pet, with a lease fallback for older browsers.

Closing the drawer saves and stops drawing and sound. Care continues until the page closes. Vacation pauses it. Removing the element releases its frame and save ownership.

## Check and release

Run `npm test`, then look at the changed screens on desktop and mobile. `/qa/` has fixed states and busy scenes. `/design/evolution/` shows every family and expression. `/qa/directions.html` compares every left and right pose. `/qa/guess.html?pet=pizza` runs the guessing game without saving. Add `direction=right` for a repeatable first answer or `hold=1` for a frozen reveal screenshot. Read the [sprite rules](frame-contract.md) before changing art.

`npm run build` creates the static folder. `npm pack` creates the installable package. On Windows, `scripts/package-release.ps1` makes a zip from a clean, committed checkout.

Keep published version folders unchanged. Check the hosted install after deployment.

The website workflow tests and builds the latest `main` after every merge, then updates the `demo` publishing branch and requests a GitHub Pages build. It preserves existing release folders and PR previews. New package versions get their own install folder. Check the website workflow and Pages deployment before calling a release live. The workflow can also be run manually from Actions if a deployment needs another try.

The header version, release links and generated install code use `package.json` during the build and local preview. Bump that version for an app release. Merging the bump publishes it to npm and GitHub, as described below.

Current testing gaps are in the [release notes](release-review.md).

## New games

The games keep game models separate from the screen. Each factory returns `input(action)`, `advance(milliseconds)`, `snapshot()`, `pause()`, `resume()` and `quit()`. Models own their score and timing. They do not touch saves, DOM nodes or pet care.

Snapshots expose the game ID, phase, pause state and result. Results are `win`, `loss`, `quit` or `null`. The host owns input, drawing and reward settlement. Calling advance while paused or after a result must not change the run.

Use injected randomness for repeatable tests. Check boundary inputs, duplicate rewards, pause and large time steps. Run the complete test suite before reviewing the games in desktop and mobile browsers. The [release checklist](../design/games/release-checklist.md) tracks integration evidence. Keep any unverified checks listed when preparing a release.
## Pull request previews

Same repository PRs into `main` get a preview link in a comment. It updates on each push and disappears when the PR closes. Forks do not publish previews.

Previews keep their own pet saves. They leave the live demo and your pets alone. Sample pages are excluded because they use shared test saves.

## Publish a release

A release PR bumps the `package.json` version, updates the install snippets and adds a `## <version>` section to the [release notes](release-review.md). Before merging, run `npm test` and `npm pack --dry-run`, and install the packed archive into a temporary project to check its complete `dist` folder.

Merging it does the rest. The release workflow sees a version npm doesn't have yet, runs the tests and publishes the package to npm. Then it makes the `v<version>` GitHub release with the package, the site zip and that version's notes. Merges that keep the same version publish nothing.

npm trusts `.github/workflows/release.yml` on `TaylorOD/lilgotchi` as a trusted publisher, so the workflow needs no npm token and npm adds provenance to each version. Renaming the workflow file breaks that until it is updated on npm too.

If a run fails, fix the cause and rerun it from Actions. It skips whatever already went out, so a release missing only its GitHub page just gets that. Never replace an existing version. After a release, check `npm view lilgotchi version` and the hosted install.
