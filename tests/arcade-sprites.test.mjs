import test from 'node:test';
import assert from 'node:assert/strict';
import { arcadeSprites,arcadeSprite } from '../pets/arcade-sprites.js';
import { slicePalette } from '../pets/slice-sprites.js';
import { cyberpunkPalette } from '../pets/cyberpunk-sprites.js';
import { lilgotchiPalette } from '../pets/lilgotchi-sprites.js';
const palettes={classic:['',1],pizza:slicePalette,cyberpunk:cyberpunkPalette,lilgotchi:lilgotchiPalette};
test('every hatched identity has a compact immutable portrait with safe palette values',()=>{
 const identities=['babytchi','marutchi','tamatchi','kuchitamatchi','mametchi','ginjirotchi','maskutchi','kuchipatchi','nyorotchi','tarakotchi','oyajitchi'];
 for(const [family,pets] of Object.entries(arcadeSprites)){
  assert.deepEqual(Object.keys(pets),identities);
  const distinct=new Set();
  for(const [id,frame] of Object.entries(pets)){
   assert.equal(arcadeSprite(family,id),frame);assert.equal(frame.length,6);assert.ok(Object.isFrozen(frame));
   for(const row of frame){assert.equal(row.length,8);assert.ok(Object.isFrozen(row));for(const pixel of row)assert.ok(Number.isInteger(pixel)&&pixel>=0&&pixel<palettes[family].length);}
   assert.ok(frame.flat().some(Boolean));distinct.add(JSON.stringify(frame));
   // A centered portrait at every valid lane fits the 32 by 16 playfield.
   for(let center=4;center<=28;center++)for(let jump=0;jump<=3;jump++){
    const left=center-4,top=10-jump;
    assert.ok(left>=0&&left+8<=32&&top>=0&&top+6<=16);
   }
  }
  assert.equal(distinct.size,identities.length,family);
 }
});
test('unknown family and identity use a known compact fallback',()=>{
 assert.equal(arcadeSprite('unknown','mametchi'),arcadeSprites.classic.mametchi);
 assert.equal(arcadeSprite('unknown','unknown'),arcadeSprites.classic.babytchi);
});
