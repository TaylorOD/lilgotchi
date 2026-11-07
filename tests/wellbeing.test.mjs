import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeWellbeing, advanceWellbeing, applyWellbeingAction, setManualSleep, sleepDecision, careGrade } from '../pets/wellbeing.js';
const make = () => initializeWellbeing({stage:'child', hunger:4,happiness:4,poopCount:0,isSick:false,isSleeping:false,isDead:false},0);
test('wellbeing migration starts fresh without inventing historical care',()=>{
 const state={isSick:true}; initializeWellbeing(state,123);
 assert.equal(state.health,60); assert.equal(state.energy,100); assert.equal(state.wellbeingUpdatedAt,123);
 assert.equal(careGrade(state).score,null);
});
test('energy tracks elapsed time and duplicate ticks cannot drain it',()=>{
 const state=make(); advanceWellbeing(state,3600000); assert.equal(state.energy,95);
 advanceWellbeing(state,3600000); assert.equal(state.energy,95);
 state.isSleeping=true; advanceWellbeing(state,7200000); assert.equal(state.energy,100);
});
test('neglect reduces health while medicine recovery only applies to a cure',()=>{
 const state=make(); state.isSick=true; advanceWellbeing(state,3600000); assert.equal(state.health,92);
 applyWellbeingAction(state,'medicine',3600000); assert.equal(state.health,92);
 applyWellbeingAction(state,'cured',3600000); assert.equal(state.health,100);
});
test('manual sleep and wake overrides expire and wake resets decay clocks',()=>{
 const state=make(); state.energy=40; setManualSleep(state,true,0);
 assert.equal(sleepDecision(state,false,1000),true);
 setManualSleep(state,false,1000); assert.equal(state.lastHungerDecay,1000);
 assert.equal(sleepDecision(state,true,2000),false);
 assert.equal(sleepDecision(state,true,7201000),true);
});
test('eggs and dead pets do not accrue invented care scores',()=>{
 for(const key of ['egg','dead']) {const state=make();state.stage=key;state.isDead=key==='dead';advanceWellbeing(state,3600000);assert.equal(state.careDuration,0);}
});
test('care grades use time weighted averages rather than counting actions',()=>{
 const state=make();advanceWellbeing(state,600000);assert.equal(careGrade(state).label,'Perfect');
 state.careTotal=30*state.careDuration;assert.equal(careGrade(state).label,'Bad');
 applyWellbeingAction(state,'meal',600000);assert.equal(careGrade(state).label,'Bad');
});
test('old save migration preserves progress and starts metrics from lastProcessed', async()=>{
 const {GameState}=await import('../pets/engine.js');
 const {configureStorage}=await import('../pets/storage.js');
 const state=new GameState();
 const saved=JSON.parse(JSON.stringify(state)); saved.stage='child'; saved.character='marutchi';saved.lastProcessed=1000;saved.hunger=2;saved.isSick=true;
 for(const key of ['energy','health','wellbeingUpdatedAt','careTotal','careDuration','sleepOverride','sleepOverrideUntil']) delete saved[key];
 configureStorage({load:()=>saved});
 try {assert.equal(state.load(),true);assert.equal(state.hunger,2);assert.equal(state.health,60);assert.equal(state.wellbeingUpdatedAt,1000);}
 finally {configureStorage(null);}
});
test('malformed optional wellbeing values are rejected without rejecting legacy saves', async()=>{
 const {validState}=await import('../pets/valid-state.js');const {GameState}=await import('../pets/engine.js');const state=new GameState();
 for(const patch of [{energy:101},{health:NaN},{sleepOverride:'forever'},{careDuration:1,careTotal:101.1},{wellbeingUpdatedAt:-1}]) assert.equal(validState({...state,...patch}),false);
 assert.equal(validState(state),true);
});
test('full energy manual sleep survives reload and lasts at least five minutes',()=>{
 const state=make();setManualSleep(state,true,1000);
 const restored=JSON.parse(JSON.stringify(state));
 assert.equal(sleepDecision(restored,false,2000),true);
 assert.equal(sleepDecision(restored,false,300999),true);
 advanceWellbeing(restored,301000); assert.equal(sleepDecision(restored,false,301000),false);
 assert.equal(restored.sleepOverride,'wake');
});

test('future wellbeing clocks and incomplete override pairs cannot enter saves',async()=>{
 const {validState}=await import('../pets/valid-state.js');const {GameState}=await import('../pets/engine.js');const state=new GameState();
 assert.equal(validState({...state,wellbeingUpdatedAt:state.lastProcessed+300001}),false);
 assert.equal(validState({...state,sleepOverride:'sleep',sleepOverrideUntil:state.wellbeingUpdatedAt+7500001}),false);
 const partial={...state};delete partial.sleepOverrideUntil;assert.equal(validState(partial),false);
});
