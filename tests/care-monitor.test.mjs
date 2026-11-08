import test from 'node:test';
import assert from 'node:assert/strict';
import { careNeeds, advanceSavedPet, refreshCare } from '../widget/care-monitor.js';
import { GameState } from '../pets/engine.js';
import { SaveStore } from '../widget/save-store.js';
import { setSimulationTime } from '../pets/clock.js';

test('counts distinct needs, not poop piles, and suppresses eggs and vacation',()=>{
  const state={stage:'adult',hunger:0,happiness:0,poopCount:4,isSick:true,isMisbehaving:true};
  assert.equal(careNeeds(state).length,5);
  assert.deepEqual(careNeeds({...state,stage:'egg'}),[]);
  assert.deepEqual(careNeeds({...state,vacationAt:1}),[]);
  assert.deepEqual(careNeeds({...state,isDead:true,bornAt:42}),['Remember your pet']);
  assert.deepEqual(careNeeds({...state,isDead:true,bornAt:42},'42'),[]);
});

test('background simulation hatches saved eggs without touching standalone storage',()=>{
  const now=Date.now();
  setSimulationTime(now-120000);
  const state=new GameState();
  setSimulationTime(null);
  const next=advanceSavedPet(JSON.parse(JSON.stringify(state)));
  assert.equal(next.stage,'baby');
  assert.deepEqual(careNeeds(next),['Food','Play']);
  assert.equal(state.stage,'egg');
  assert.ok(next.lastProcessed>=now);
});

test('refresh skips the active writer and unstarted pets, and respects other owners',async()=>{
  const data=new Map();const storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
  const store=new SaveStore('care-test',{storage,locks:null});
  const other=new SaveStore('care-test',{storage,locks:null});
  setSimulationTime(Date.now()-120000);
  const state=JSON.parse(JSON.stringify(new GameState()));setSimulationTime(null);
  await other.acquire('slice');other.save('slice',state);
  let advanced=0;
  const result=await refreshCare(store,['slice','cyberpunk','lilgotchi'],'cyberpunk',s=>{advanced++;return s;});
  assert.equal(advanced,0);assert.equal(result.length,1);assert.equal(result[0].stale,true);
  other.release('slice');
  await refreshCare(store,['slice'],null,s=>{advanced++;return {...s,lastProcessed:Date.now()};});
  assert.equal(advanced,1);assert.equal(store.owns('slice'),false);
  await refreshCare(store,['slice'],null,()=>{throw new Error('must not resimulate a fresh save');});
  assert.equal(store.load('slice').revision,2);
  assert.equal(store.raw('lilgotchi'),null);store.dispose();other.dispose();
});
