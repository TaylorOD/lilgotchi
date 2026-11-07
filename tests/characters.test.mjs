import test from 'node:test';
import assert from 'node:assert/strict';
import { catalog, families, getCharacter, allowedCharacters, initialCharacter, frameCharacter } from '../pets/catalog.js';
import { classicSprites } from '../pets/classic-sprites.js';
import { GameState, Evo } from '../pets/engine.js';
import { C } from '../pets/constants.js';
import { SaveStore, saveKey, parseImport } from '../widget/save-store.js';
import { contextFor, validContext } from '../pets/dialogue.js';

test('catalog exposes every original sprite identity and validates frame identity pairs',()=>{
  assert.deepEqual(catalog.filter(c=>c.skin==='classic').map(c=>c.character).sort(),Object.keys(classicSprites).filter(id=>id==='egg'||getCharacter(id)).sort());
  assert.equal(catalog.filter(c=>c.skin==='classic').length,12);
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
  assert.deepEqual(allowedCharacters('mametchi, default slice mametchi'),['mametchi','default','slice']);
  for(const value of ['', '  ', ',', 'default,unknown','all,slice'])assert.throws(()=>allowedCharacters(value),/Invalid/);
  const allowed=['default','slice'];
  assert.equal(initialCharacter('mametchi','slice',allowed),'default');
  assert.equal(initialCharacter('slice','default',allowed),'slice');
  assert.equal(initialCharacter(null,'slice',allowed),'slice');
});

test('original presets start fresh at their pictured stage, reset consistently and keep normal evolution',()=>{
  for(const choice of catalog){
    const state=new GameState(choice);
    assert.equal(state.stage,choice.stage);assert.equal(state.character,choice.character);
    assert.equal(state.weight,C.BASE_WT[choice.stage]||5);
    assert.equal(state.age,0);assert.equal(state.careMistakes,0);assert.equal(state.discipline,0);assert.equal(state.prevTeen,null);
    state.age=9;state.character='tarakotchi';state.reset();
    assert.equal(state.character,choice.character);assert.equal(state.age,0);
    if(choice.stage!=='egg')assert.ok(validContext(contextFor(state,'idle',choice.id,choice.name)));
  }
  assert.equal(Evo.evolve(new GameState(getCharacter('babytchi'))).character,'marutchi');
  assert.equal(Evo.evolve(new GameState(getCharacter('tamatchi'))).character,'tarakotchi');
  assert.equal(Evo.evolve(new GameState(getCharacter('default'))).character,'babytchi');
});

test('every choice has independent progress, portable imports and no duplicated legacy migration',async()=>{
  const values=new Map();const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  const store=new SaveStore('lineup',{storage,locks:null});
  try{
    for(const choice of catalog){
      assert.ok(await store.acquire(choice.id));store.load(choice.id);
      store.save(choice.id,new GameState(choice));
      assert.equal(store.load(choice.id).state.character,choice.character);
      assert.equal(parseImport(store.raw(choice.id)).family,choice.id);
      if(choice.skin==='classic' && choice.id!=='default')assert.equal(store.migrateLegacy(choice.id),false);
    }
    assert.equal(new Set(catalog.map(c=>saveKey('lineup',c.id))).size,14);
    assert.equal(saveKey('lineup','default'),'lilgotchi:v1:lineup:default');
    const original=store.raw('mametchi');
    assert.throws(()=>parseImport(original,['default','slice']),/not available/);
    assert.equal(store.raw('mametchi'),original);
  }finally{store.dispose();}
});

globalThis.HTMLElement=class{};
globalThis.customElements={get:()=>true};
const { LilGotchi }=await import('../lilgotchi.js');
test('public selection and confirmed imports reject choices outside the site list before changing state',async()=>{
  const widget={allowed:['default'],serial:callback=>callback(),importData:{family:'mametchi'},unload:()=>assert.fail('must not unload')};
  await assert.rejects(LilGotchi.prototype.setCharacter.call(widget,'mametchi'),/not available/);
  await assert.rejects(LilGotchi.prototype.confirmImport.call(widget),/not available/);
});

test('host page query parameters do not configure the embedded game',async()=>{
  const { execFileSync }=await import('node:child_process');
  execFileSync(process.execPath,['--input-type=module','-e',`globalThis.location={search:'?character=unrelated&pet=unrelated'};globalThis.HTMLElement=class{};globalThis.customElements={get:()=>true};await import('./lilgotchi.js');`],{cwd:new URL('..',import.meta.url)});
});
