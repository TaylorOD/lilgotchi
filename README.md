# lilgotchi

A small virtual pet for your website, based on [plateaukao/tamagochi](https://github.com/plateaukao/tamagochi).

This checkout starts with the existing personal site game. The reusable widget and complete character families are being implemented from the [design docs](docs/lilgotchi/README.md).

## Run it

Node.js is the only local tool needed. There are no package dependencies.

```sh
npm start
npm test
```

Open `http://localhost:4176`. To choose another port, use `npm start -- --port 4177`.

The demo opens the current game from the pizza launcher. The untouched original is at `/reference/upstream.html`. The original sprite contact sheet is at `/reference/contact-sheet.html`.

## Source and checks

The pinned upstream HTML is kept intact under `reference/`. Its exact revision and file hash are in [source.json](reference/source.json). Credits and license terms are in [NOTICE](pets/NOTICE.md).

`npm test` runs the existing gameplay checks plus original source integrity, constants, sprite matrices, font, evolution boundary and logical rendering comparisons. These checks establish a baseline. They do not yet prove complete behavioral or browser pixel parity.

`npm run inventory` regenerates the original frame inventory from the pinned source.

See the [difference register](docs/parity-status.md) and [module handoff](docs/module-handoff.md) for remaining work.
