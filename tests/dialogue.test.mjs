import test from 'node:test';
import assert from 'node:assert/strict';
import { Dialogue,contextFor,validContext,triggers,personalities } from '../pets/dialogue.js';
import { DialogueHost } from '../widget/dialogue-host.js';
const state={character:'marutchi',hunger:2,happiness:3,discipline:50,age:2,weight:10,privateSave:'never sent'};
const context=(event='idle',family='default')=>contextFor(state,event,family,'Marutchi');
test('every source trigger and personality has minimal validated context',()=>{
 for(const event of triggers)for(const character of Object.keys(personalities))for(const family of ['default','slice','cyberpunk']){
  const c=contextFor({...state,character},event,family,'Pet');assert.equal(validContext(c),true);assert.equal('privateSave' in c,false);
 }
 for(const extra of [{secret:'x'},{event:'unknown'},{hunger:5},{name:'x'.repeat(51)},{personality:'override'},{family:'other'}])assert.equal(validContext({...context(),...extra}),false);
});
test('disabled dialogue sends nothing, busy drops overlap, reply and retry stay text',()=>{
 const sent=[],shown=[];const d=new Dialogue(m=>sent.push(m),true,(...x)=>shown.push(x));
 d.talk(context());assert.equal(sent.length,0);d.enabled=true;
 for(const event of triggers){d.talk(context(event));d.talk(context());assert.equal(sent.at(-1).context.event,event);d.receive({id:d.id,text:'<b>hello</b>'});assert.deepEqual(shown.at(-1),['<b>hello</b>','reply']);}
 d.talk(context());d.receive({id:d.id,text:'x'.repeat(281)});assert.equal(shown.at(-1)[1],'error');d.retry();assert.equal(d.busy,true);d.cancel();
});
test('cancel rejects stale replies and allows a new request',()=>{
 const shown=[];const d=new Dialogue(()=>{},true,(...x)=>shown.push(x));d.enabled=true;d.talk(context());const id=d.id;d.cancel();d.talk(context('sick'));d.receive({id,text:'stale'});assert.equal(d.busy,true);d.receive({id:d.id,text:'new'});assert.deepEqual(shown.at(-1),['new','reply']);
});
test('host validates family and context, rejects bad replies, aborts stale work',async()=>{
 const replies=[];let resolve,signal,calls=0;
 const host=new DialogueHost((c,o)=>{calls++;signal=o.signal;return new Promise(r=>resolve=r);},m=>replies.push(m),'default');
 await host.receive({type:'dialogue-request',id:1,context:context('idle','slice')});assert.equal(calls,0);
 const run=host.receive({type:'dialogue-request',id:2,context:context()});await Promise.resolve();host.cancel();assert.equal(signal.aborted,true);resolve('old');await run;assert.equal(replies.length,0);
 for(const value of [null,{},'', 'x'.repeat(281)]){host.callback=()=>value;await host.receive({type:'dialogue-request',id:3,context:context()});assert.equal(replies.at(-1).error,true);}
 host.callback=()=>{throw Error('private details');};await host.receive({type:'dialogue-request',id:4,context:context()});assert.deepEqual(replies.at(-1),{type:'dialogue-result',id:4,error:true});
});
test('timeouts stop busy state and abort host work',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});const sent=[],d=new Dialogue(m=>sent.push(m),true);d.enabled=true;d.talk(context());t.mock.timers.tick(10000);assert.equal(d.busy,false);assert.equal(sent.at(-1).type,'dialogue-cancel');
 let signal;const replies=[];const host=new DialogueHost((c,o)=>{signal=o.signal;return new Promise(()=>{});},m=>replies.push(m),'default');const run=host.receive({type:'dialogue-request',id:1,context:context()});await Promise.resolve();t.mock.timers.tick(9000);await run;assert.equal(signal.aborted,true);assert.equal(replies[0].error,true);
});
import {upstreamAt} from './upstream-harness.mjs';
globalThis.location={search:'?pet=classic'};
const {TamagotchiApp}=await import('../pets/game.js');
const {GameState}=await import('../pets/engine.js');
const {setSimulationTime}=await import('../pets/clock.js');
test('care dialogue hooks match the pinned source sequence and context',t=>{
 t.mock.timers.enable({apis:['setTimeout']});
 const noon=new Date(2026,0,5,12).getTime();setSimulationTime(noon);
 const node={classList:{add(){},remove(){},toggle(){}},textContent:''};globalThis.document={getElementById:()=>node};globalThis.localStorage={setItem(){}};
 const source=upstreamAt(noon,[0]);
 const make=(prototype,state)=>{
  const events=[];const app=Object.assign(Object.create(prototype),{state,events,sound:new Proxy({},{get:()=>()=>{}}),talk(event){events.push({event,hunger:this.state.hunger,happiness:this.state.happiness,character:this.state.character});},ai:{on:true,talk(st,event){events.push({event,hunger:st.hunger,happiness:st.happiness,character:st.character});return Promise.resolve(null);}}});
  for(const name of ['toast','updateButtons','showDialogue','closeOverlay'])app[name]=()=>{};
  Object.assign(state,{stage:'child',character:'marutchi',hunger:2,happiness:2,poopCount:1,isMisbehaving:true});return app;
 };
 const actual=make(TamagotchiApp.prototype,new GameState()),expected=make(source.TamagotchiApp.prototype,new source.GameState());
 const originalRandom=Math.random;Math.random=()=>0;
 try{
 for(const [method,arg] of [['doFeed','meal'],['doFeed','snack'],['handleAction','clean'],['handleAction','discipline'],['makeSick'],['checkAttention']]){actual[method](arg);expected[method](arg);assert.deepEqual(actual.events,expected.events);}
 for(const app of [actual,expected])Object.assign(app.state,{isSick:false,attentionCallTime:null,hunger:0});actual.checkAttention();expected.checkAttention();assert.deepEqual(actual.events,expected.events);
 for(const app of [actual,expected])Object.assign(app.state,{attentionCallTime:null,hunger:2,happiness:0});actual.checkAttention();expected.checkAttention();assert.deepEqual(actual.events,expected.events);
 for(const app of [actual,expected])Object.assign(app.state,{happiness:2,isMisbehaving:false});actual.maybeMisbehave();expected.maybeMisbehave();assert.deepEqual(actual.events,expected.events);
 for(const wins of [0,5]){actual.gameWins=expected.gameWins=wins;actual.finishGame();expected.finishGame();assert.deepEqual(actual.events,expected.events);}
 const night=new Date(2026,0,5,23).getTime();setSimulationTime(night);source.setTime(night);actual.checkSleep();expected.checkSleep();assert.deepEqual(actual.events,expected.events);
 setSimulationTime(noon);source.setTime(noon);actual.checkSleep();expected.checkSleep();assert.deepEqual(actual.events,expected.events);
 for(const app of [actual,expected])Object.assign(app.state,{stage:'egg',character:'egg'});actual.doEvolve();expected.doEvolve();assert.deepEqual(actual.events,expected.events);
 }finally{Math.random=originalRandom;setSimulationTime(null);}
});
import {createDialogueRoute} from '../server-example/route.mjs';
test('server example validates authentication, request shape, rate and budget before provider',async()=>{
 let calls=0,time=0;const route=createDialogueRoute({authorize:r=>r.user,provider:()=>{calls++;return 'hello';},maxCalls:2,maxCostMicros:20,reserveCostMicros:10,now:()=>time});
 const req={user:'one',method:'POST',body:context()};
 assert.equal((await route({...req,user:null})).status,401);
 assert.equal((await route({...req,body:{...context(),private:'x'}})).status,400);
 assert.equal((await route(req)).status,200);assert.equal((await route(req)).status,429);
 time=10000;assert.equal((await route(req)).status,200);time=20000;assert.equal((await route(req)).status,429);assert.equal(calls,2);
});
