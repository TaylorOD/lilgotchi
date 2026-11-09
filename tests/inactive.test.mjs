import test from 'node:test';
import assert from 'node:assert/strict';
import { inactiveSince, resumeInactive } from '../widget/inactive.js';
import { refreshCare } from '../widget/care-monitor.js';
import { GameState } from '../pets/engine.js';
import { SaveStore } from '../widget/save-store.js';

test('inactive time does not age the pet or consume the remaining stage time',()=>{
  const state=JSON.parse(JSON.stringify(new GameState()));
  const since=state.lastProcessed+30000,elapsed=20*86400000;
  const next=resumeInactive(state,since,since+elapsed);
  assert.equal(next.stageStartTime,state.stageStartTime+elapsed);
  assert.equal(next.lastProcessed,state.lastProcessed+elapsed);
  assert.equal(next.age,state.age);assert.equal(next.character,state.character);
  assert.equal(next.hunger,state.hunger);assert.equal(next.bornAt,state.bornAt);
  assert.equal(since+elapsed-next.stageStartTime,since-state.stageStartTime);
});

test('an existing vacation survives an inactive pause without counting time twice',()=>{
  const state={vacationAt:1000,lastProcessed:1000,stageStartTime:500};
  const next=resumeInactive(state,2000,10000);
  assert.equal(next.vacationAt,9000);assert.equal(next.stageStartTime,8500);
});

test('inactive families retain their saves and are never simulated by the monitor',async()=>{
  const values=new Map();const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
  const store=new SaveStore('inactive-test',{storage,locks:null});
  await store.acquire('default');store.save('default',JSON.parse(JSON.stringify(new GameState())));store.release('default');
  const before=store.raw('default');store.preference('inactive-default',Date.now());
  assert.ok(inactiveSince(store,'default'));
  const result=await refreshCare(store,['default'],null,()=>{throw new Error('inactive pets must not advance');});
  assert.deepEqual(result,[]);assert.equal(store.raw('default'),before);
  store.preference('inactive-default',0);assert.equal(inactiveSince(store,'default'),0);
  store.dispose();
});
