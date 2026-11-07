import test from 'node:test';
import assert from 'node:assert/strict';
import {Evo} from '../pets/engine.js';
import {sliceNames} from '../pets/slice-sprites.js';
import {cyberpunkNames,cyberpunkSprites} from '../pets/cyberpunk-sprites.js';
import {lilgotchiNames} from '../pets/lilgotchi-sprites.js';
import {originalCypunk} from '../pets/cypunk-original.js';
test('all six care branches resolve to the reviewed custom adults',()=>{
 const routes=[
  [0,100,'mametchi','Margherita','JavaScript','Duck Egg'],
  [0,75,'ginjirotchi','Pepperoni','Sentinel','Quail Egg'],
  [3,50,'maskutchi','BBQ Chicken','Matrix','Goose Egg'],
  [5,50,'kuchipatchi','Meat Lovers','404','Jumbo Egg'],
  [5,25,'nyorotchi','Anchovy','MissingNumber','Golden Egg'],
  [5,0,'tarakotchi','Pineapple','Blue Screen','Century Egg'],
 ];
 for(const [careMistakes,discipline,id,...names] of routes){
  const result=Evo.toAdult({character:'tamatchi',careMistakes,discipline});
  assert.equal(result.character,id);
  assert.deepEqual([sliceNames[id],cyberpunkNames[id],lilgotchiNames[id]],names);
 }
});
test('Sentinel and Binary Seed retain their original expressions',()=>{
 assert.deepEqual(cyberpunkSprites.ginjirotchi,originalCypunk.mametchi);
 assert.deepEqual(cyberpunkSprites.egg,originalCypunk.egg);
});
