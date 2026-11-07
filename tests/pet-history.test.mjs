import test from 'node:test';
import assert from 'node:assert/strict';
import { PetHistory, HISTORY_LIMIT, historyKey } from '../widget/pet-history.js';
import { SaveStore } from '../widget/save-store.js';
import { GameState } from '../pets/engine.js';
import { getCharacter } from '../pets/catalog.js';
function setup(instance){
  const values=new Map();
  const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  const store=new SaveStore(instance,{storage,locks:null,now:()=>2000000000000});
  return {values,storage,store,history:new PetHistory(store)};
}
function dead(bornAt=1000){const state=new GameState(getCharacter('mametchi'));return {...state,bornAt,age:8,stage:'dead',isDead:true};}
test('death records deduplicate per lifetime and persist before a new pet replaces it',async()=>{
  const {store,history,storage}=setup('history-lifetimes');
  await store.acquire('slice');
  try{
    assert.equal(history.recordDeath('slice',dead()),true);
    assert.equal(history.recordDeath('slice',dead()),false);
    assert.equal(history.recordDeath('slice',new GameState(getCharacter('slice'))),false);
    assert.equal(history.recordDeath('slice',dead(2000)),true);
    const reopened=new PetHistory(new SaveStore('history-lifetimes',{storage,locks:null}));
    assert.equal(reopened.list('slice').length,2);
    assert.equal(reopened.list('slice')[0].bornAt,2000);
    assert.match(history.describe(history.list()[0]),/Slice.*Mametchi.*8 days old/);
    const copy=history.list();copy[0].age=999;assert.equal(history.list()[0].age,8);
  }finally{store.dispose();}
});
test('history ownership, family isolation and instance isolation are enforced',async()=>{
  const {store,history,storage}=setup('history-isolation');
  assert.throws(()=>history.recordDeath('slice',dead()),/another window/);
  await store.acquire('slice');
  try{
    history.recordDeath('slice',dead());
    assert.deepEqual(history.list('cyberpunk'),[]);
    assert.deepEqual(new PetHistory(new SaveStore('other-history',{storage,locks:null})).list(),[]);
    assert.throws(()=>history.recordDeath('unknown',dead()),/Invalid/);
    assert.throws(()=>history.recordDeath('slice',{...dead(),character:'<script>'}),/Invalid/);
    assert.throws(()=>history.recordDeath('slice',dead(3000000000000)),/Invalid/);
  }finally{store.dispose();}
});
test('history pruning keeps the newest bounded set and corrupted data is never overwritten',async()=>{
  const {store,history,values}=setup('history-bounds');await store.acquire('slice');
  try{
    for(let i=1;i<=HISTORY_LIMIT+3;i++)history.recordDeath('slice',dead(i));
    assert.equal(history.list('slice').length,HISTORY_LIMIT);
    assert.equal(history.list('slice').at(-1).bornAt,4);
    const key=historyKey(store.instance,'slice');values.set(key,'broken');
    assert.throws(()=>history.recordDeath('slice',dead(999)),/recovery/);
    assert.equal(values.get(key),'broken');
  }finally{store.dispose();}
});
test('history uses the existing session fallback when durable writes fail',async()=>{
  const {store,history,storage}=setup('history-session');await store.acquire('slice');
  try{
    storage.setItem=()=>{throw new Error('quota');};
    assert.equal(history.recordDeath('slice',dead()),true);
    assert.equal(store.persistent,false);
    assert.equal(history.list('slice').length,1);
    const reopened=new PetHistory(new SaveStore('history-session',{storage,locks:null}));
    assert.equal(reopened.list('slice').length,1);
  }finally{store.dispose();}
});

globalThis.HTMLElement=class{};
globalThis.customElements={get:()=>true};
const { LilGotchi }=await import('../lilgotchi.js');
test('host remembers the previous dead lifetime before saving a restart',()=>{
  const calls=[];
  const previous=dead();const next=new GameState(getCharacter('slice'));
  const host={store:{raw:()=>JSON.stringify({state:previous}),save:(family,state)=>calls.push(['save',state])},rememberDeath:(family,state)=>calls.push(['remember',state]),renderHistory:()=>calls.push(['render'])};
  LilGotchi.prototype.savePet.call(host,'slice',next);
  assert.deepEqual(calls.map(call=>call[0]),['remember','save','remember','render']);
  assert.equal(calls[0][1].bornAt,previous.bornAt);assert.equal(calls[1][1],next);
});
test('history failure is reported without throwing into normal care saving',()=>{
  const host={history:{recordDeath:()=>{throw new Error('history unavailable');}}};
  assert.doesNotThrow(()=>LilGotchi.prototype.rememberDeath.call(host,'slice',dead()));
  assert.equal(host.historyError,'history unavailable');
});
