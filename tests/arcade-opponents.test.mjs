import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseOpponent } from '../pets/arcade-opponents.js';
test('head to head opponents cover every other family and never your own',()=>{
 for(const family of ['pizza','cyberpunk','lilgotchi','classic']){
  const rivals=[0,.34,.67,.999].map(value=>chooseOpponent(family,()=>value));
  assert.equal(new Set(rivals.map(rival=>rival.family)).size,3);
  for(const rival of rivals){
   assert.notEqual(rival.family,family);
   assert.ok(rival.frames.lookLeft.length);
   assert.ok(rival.frames.lookRight.length);
   for(const frame of [rival.frames.lookLeft,rival.frames.lookRight])
    for(const row of frame)for(const pixel of row)if(pixel)assert.ok(rival.palette[pixel]);
  }
 }
});
