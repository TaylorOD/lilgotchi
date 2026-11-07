import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_CATCHUP,limitAbsence,resumeVacation } from '../pets/away.js';
test('a long absence preserves partial intervals and replays at most eight hours',()=>{
  const state={lastProcessed:100000,lastHungerDecay:90000,stageStartTime:50000,attentionCallTime:null};
  const now=100000+30*86400000;
  assert.equal(limitAbsence(state,now),30*86400000-MAX_CATCHUP);
  assert.equal(now-state.lastProcessed,MAX_CATCHUP);
  assert.equal(state.lastProcessed-state.lastHungerDecay,10000);
  assert.equal(state.attentionCallTime,null);
});
test('vacation freezes growth, decay, overrides and care history without changing birthday',()=>{
  const state={bornAt:100,stageStartTime:100,lastProcessed:200,vacationAt:200,lastAgeInc:100,wellbeingUpdatedAt:200,sleepOverrideUntil:500,careTotal:42};
  assert.equal(resumeVacation(state,10200),true);
  assert.equal(state.stageStartTime,10100);assert.equal(state.lastProcessed,10200);
  assert.equal(state.sleepOverrideUntil,10500);assert.equal(state.bornAt,100);assert.equal(state.careTotal,42);
  assert.equal(resumeVacation(state,20200),false);
});
