import test from 'node:test';
import assert from 'node:assert/strict';
import { catalog, families, getCharacter, allowedCharacters, initialCharacter, frameCharacter } from '../pets/catalog.js';
import { classicSprites } from '../pets/classic-sprites.js';
import { GameState, Evo } from '../pets/engine.js';
import { C } from '../pets/constants.js';
import { SaveStore, saveKey, parseImport } from '../widget/save-store.js';

test('catalog exposes only four egg families and validates frame identity pairs',()=>{
  assert.deepEqual(families,['slice','cyberpunk','lilgotchi','default']);
  assert.ok(catalog.every(choice=>choice.character==='egg'&&choice.stage==='egg'));
  for(const choice of catalog){
    assert.ok(classicSprites[choice.character].idle1);
    assert.equal(frameCharacter(new URLSearchParams({character:choice.id,pet:choice.skin})),choice);
  }
  assert.throws(()=>frameCharacter(new URLSearchParams('character=mametchi&pet=pizza')),/configuration/);
  assert.throws(()=>frameCharacter(new URLSearchParams('character=unknown')),/configuration/);
});

test('allowlists preserve order, reject invalid configuration and fall back without erasing a choice',()=>{
  assert.deepEqual(allowedCharacters(),families);
  assert.deepEqual(allowedCharacters('all'),families);
  assert.deepEqual(allowedCharacters('cyberpunk, default slice cyberpunk'),['cyberpunk','default','slice']);
  for(const value of ['', '  ', ',', 'default,unknown','all,slice','mametchi'])assert.throws(()=>allowedCharacters(value),/Invalid/);
  const allowed=['default','slice'];
  assert.equal(initialCharacter('mametchi','slice',allowed),'default');
  assert.equal(initialCharacter('slice','default',allowed),'slice');
  assert.equal(initialCharacter(null,'slice',allowed),'slice');
});

test('every family starts and resets as an egg and keeps normal evolution',()=>{
  for(const choice of catalog){
    const state=new GameState(choice);
    assert.equal(state.stage,choice.stage);assert.equal(state.character,choice.character);
    assert.equal(state.weight,C.BASE_WT[choice.stage]||5);
    assert.equal(state.age,0);assert.equal(state.careMistakes,0);assert.equal(state.discipline,0);assert.equal(state.prevTeen,null);
    state.age=9;state.character='tarakotchi';state.reset();
    assert.equal(state.character,choice.character);assert.equal(state.age,0);
  }
  assert.equal(Evo.evolve({stage:'baby',character:'babytchi'}).character,'marutchi');
  assert.equal(Evo.evolve({stage:'teen',character:'tamatchi',careMistakes:0,discipline:0}).character,'tarakotchi');
  assert.equal(Evo.evolve(new GameState(getCharacter('default'))).character,'babytchi');
});

test('every family has independent progress and portable imports',async()=>{
  const values=new Map();const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  const store=new SaveStore('lineup',{storage,locks:null});
  try{
    for(const choice of catalog){
      assert.ok(await store.acquire(choice.id));store.load(choice.id);
      store.save(choice.id,new GameState(choice));
      assert.equal(store.load(choice.id).state.character,choice.character);
      assert.equal(parseImport(store.raw(choice.id)).family,choice.id);
    }
    assert.equal(new Set(catalog.map(c=>saveKey('lineup',c.id))).size,catalog.length);
    assert.equal(saveKey('lineup','default'),'lilgotchi:v1:lineup:default');
    const original=store.raw('cyberpunk');
    assert.throws(()=>parseImport(original,['default','slice']),/not available/);
    assert.equal(store.raw('cyberpunk'),original);
  }finally{store.dispose();}
});

globalThis.HTMLElement=class{};
globalThis.customElements={get:()=>true};
const { LilGotchi }=await import('../lilgotchi.js');
test('public selection and confirmed imports reject choices outside the site list before changing state',async()=>{
  const widget={allowed:['default'],serial:callback=>callback(),importData:{family:'cyberpunk'},unload:()=>assert.fail('must not unload')};
  await assert.rejects(LilGotchi.prototype.setCharacter.call(widget,'cyberpunk'),/not available/);
  await assert.rejects(LilGotchi.prototype.confirmImport.call(widget),/not available/);
});

test('host page query parameters do not configure the embedded game',async()=>{
  const { execFileSync }=await import('node:child_process');
  execFileSync(process.execPath,['--input-type=module','-e',`globalThis.location={search:'?character=unrelated&pet=unrelated'};globalThis.HTMLElement=class{};globalThis.customElements={get:()=>true};await import('./lilgotchi.js');`],{cwd:new URL('..',import.meta.url)});
});
