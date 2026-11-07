import test from 'node:test';
import assert from 'node:assert/strict';
import { getCharacter, allowedCharacters, frameCharacter } from '../pets/catalog.js';
import { GameState } from '../pets/engine.js';
import { SaveStore, saveKey, parseImport } from '../widget/save-store.js';

test('Cypunk keeps its existing configuration, saved selection and exported backup identity',async()=>{
  const choice=getCharacter('cyberpunk');
  assert.equal(choice.name,'Cypunk');
  assert.equal(frameCharacter(new URLSearchParams('pet=cyberpunk&character=cyberpunk')),choice);
  assert.deepEqual(allowedCharacters('default,slice,cyberpunk'),['default','slice','cyberpunk']);

  const instance='cypunk-rename-check',state=new GameState(choice);
  state.hunger=2;state.happiness=3;
  const original={schema:1,instance,family:'cyberpunk',revision:7,savedAt:Date.now(),state};
  const raw=JSON.stringify(original),key=saveKey(instance,'cyberpunk');
  const values=new Map([[key,raw]]);
  const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  const store=new SaveStore(instance,{storage,locks:null});
  try{
    assert.equal(store.load('cyberpunk').state.hunger,2);
    assert.equal(store.load('cyberpunk').state.happiness,3);
    assert.equal(parseImport(raw,['default','slice','cyberpunk']).family,'cyberpunk');
    assert.equal(store.raw('cyberpunk'),raw);
    assert.equal(key,`lilgotchi:v1:${instance}:cyberpunk`);
  }finally{store.dispose();}
});
