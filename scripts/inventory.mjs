import { writeFileSync } from 'node:fs';
import { upstreamAt } from '../tests/upstream-harness.mjs';

const { SP, C } = upstreamAt();
const sprites = Object.entries(SP).map(([name, entry]) => ({
  name,
  frames: Object.entries(Array.isArray(entry) ? { shared: entry } : entry).map(([frame, pixels]) => ({
    frame, width: pixels[0].length, height: pixels.length,
    opaquePixels: pixels.flat().filter(Boolean).length,
  })),
}));
writeFileSync(new URL('../reference/inventory.json', import.meta.url), JSON.stringify({ logicalScreen: { width: C.W, height: C.H, scale: C.SCALE }, sprites }, null, 2) + '\n');
console.log(`Recorded ${sprites.length} original sprite entries.`);
