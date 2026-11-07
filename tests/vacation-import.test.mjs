import test from 'node:test';
import assert from 'node:assert/strict';
import {GameState} from '../pets/engine.js';
import {validState} from '../pets/valid-state.js';
import {resumeVacation} from '../pets/away.js';
import {parseImport} from '../widget/save-store.js';
import {advanceWellbeing} from '../pets/wellbeing.js';

test('a backdated vacation cannot move valid imported clocks into the future',()=>{
 const state=new GameState();state.vacationAt=1;
 const envelope={schema:1,instance:'test',family:'default',revision:1,savedAt:Date.now(),state};
 assert.equal(validState(state),false);
 assert.throws(()=>parseImport(JSON.stringify(envelope)),/invalid game data/);
});

test('clock correction during vacation rebases all relative clocks without altering care',()=>{
 const state=new GameState();const at=state.lastProcessed;
 Object.assign(state,{vacationAt:at,stage:'child',character:'marutchi',stageStartTime:at-60000,lastHungerDecay:at-30000,attentionCallTime:at-10000,attentionReason:'hungry',energy:64,health:80,careDuration:1000,careTotal:80000,sleepOverride:'sleep',sleepOverrideUntil:at+600000});
 const now=at-3600000;
 assert.equal(resumeVacation(state,now),true);
 assert.equal(state.lastProcessed,now);assert.equal(state.wellbeingUpdatedAt,now);
 assert.equal(state.stageStartTime,now-60000);assert.equal(state.lastHungerDecay,now-30000);
 assert.equal(state.attentionCallTime,now-10000);assert.equal(state.sleepOverrideUntil,now+600000);
 assert.equal(state.energy,64);assert.equal(state.health,80);assert.equal(state.careTotal,80000);
 advanceWellbeing(state,now);state.lastProcessed=now;
 assert.equal(validState(state),true);
});

test('old saves without vacation and ordinary current pauses still validate',()=>{
 const state=new GameState();delete state.vacationAt;assert.equal(validState(state),true);
 state.vacationAt=state.lastProcessed;assert.equal(validState(state),true);
});
