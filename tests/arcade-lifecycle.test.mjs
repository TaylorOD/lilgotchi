import test from 'node:test';
import assert from 'node:assert/strict';
import {Arcade,arcadeCue} from '../pets/arcade.js';
import {setSimulationTime} from '../pets/clock.js';

function setup() {
  setSimulationTime(100000);
  const listeners={},frames=[];
  function node() {
    const children=[],queries=new Map(),classes=new Set(['show']);
    return {children,hidden:false,checked:false,textContent:'',className:'',style:{},addEventListener(){},
      classList:{contains:x=>classes.has(x),add:x=>classes.add(x),remove:x=>classes.delete(x)},
      setAttribute(){},focus(){},append(...items){children.push(...items);},replaceChildren(...items){children.splice(0,children.length,...items);},
      querySelector(key){if(!queries.has(key))queries.set(key,node());return queries.get(key);},
      getContext(){return {fillStyle:'',fillRect(){},clearRect(){}};}};
  }
  globalThis.document={body:node(),hidden:false,createElement:node,addEventListener:(name,fn)=>{listeners[name]=fn;}};
  globalThis.window={addEventListener:(name,fn)=>{listeners[name]=fn;}};
  globalThis.requestAnimationFrame=fn=>{frames.push(fn);};
  let saves=0,wins=0,losses=0;
  const app={state:{stage:'adult',character:'mametchi',hunger:4,happiness:2,energy:100,health:100,poopCount:0,wellbeingUpdatedAt:100000,save(){saves++;}},
    renderer:{renderToCanvas(){}},sound:{gameWin(){wins++;},gameLose(){losses++;}},updateButtons(){},openOverlay(){},closeOverlay(){},panelVisible:true};
  const arcade=new Arcade(app);
  return {arcade,app,listeners,frames,counts:()=>({saves,wins,losses})};
}

test('arcade refuses runs for unavailable pets',()=>{
  for(const change of [{stage:'egg'},{isDead:true},{vacationAt:1},{isSleeping:true},{isSick:true},{hunger:0}]) {
    const {arcade,app,counts}=setup();Object.assign(app.state,change);arcade.select('get');arcade.start();
    assert.equal(arcade.model,null);assert.equal(counts().saves,0);assert.equal(app.state.energy,100);
  }
});

test('arcade charges energy once per run and cannot restart an active run',()=>{
  const {arcade,app}=setup();arcade.select('get');arcade.start();const model=arcade.model,energy=app.state.energy;
  assert.equal(energy,95);arcade.start();assert.equal(arcade.model,model);assert.equal(app.state.energy,energy);
});

test('arcade settles one winning reward and caps happiness',()=>{
  const {arcade,app,counts}=setup();app.state.happiness=4;arcade.selection='get';
  arcade.model={snapshot:()=>({id:'get',result:'win',phase:'done'})};
  arcade.paint();arcade.paint();assert.equal(app.state.happiness,4);assert.equal(counts().wins,1);assert.equal(counts().saves,1);
});

test('Flag uses Space for Both and ignores keyboard repeats',()=>{
  const {arcade,listeners}=setup();arcade.select('flag');arcade.start();const actions=[];arcade.input=action=>actions.push(action);
  listeners.keydown({target:{tagName:'DIV'},key:' ',repeat:false,preventDefault(){}});listeners.keydown({target:{tagName:'DIV'},key:' ',repeat:true,preventDefault(){}});
  assert.deepEqual(actions,['both']);
});

test('death and vacation cancel before a frame can award a win',()=>{
  for(const change of [{isDead:true},{vacationAt:1}]) {
    const {arcade,app,frames,counts}=setup();arcade.select('get');arcade.start();let advances=0,quit=false;
    arcade.model={advance(){advances++;},snapshot:()=>({id:'get',result:'win',phase:'done',paused:false}),quit(){quit=true;}};
    Object.assign(app.state,change);arcade.last=1;frames.shift()(20);
    assert.equal(advances,0);assert.equal(counts().wins,0);assert.equal(quit,true);assert.equal(arcade.model,null);
  }
});

test('hidden panel pauses a run without losing progress or settling rewards',()=>{
  const {arcade,app,frames,counts}=setup();arcade.select('get');arcade.start();const model=arcade.model;
  app.panelVisible=false;frames.shift()(20);assert.equal(model.snapshot().paused,true);
  const snapshot=model.snapshot();frames.shift()(1000);assert.deepEqual(model.snapshot(),snapshot);assert.equal(counts().wins,0);
});


test('arrow keys work when a game action button has keyboard focus',()=>{
 const {arcade,listeners}=setup();arcade.select('get');arcade.start();const actions=[];arcade.input=action=>actions.push(action);
 listeners.keydown({target:{tagName:'BUTTON'},key:'ArrowLeft',repeat:false,preventDefault(){}});
 assert.deepEqual(actions,['left']);
});

test('a death before an input cancels the run without a final reward',()=>{
 const {arcade,app,counts}=setup();arcade.select('get');arcade.start();app.state.isDead=true;
 arcade.model={input(){},snapshot:()=>({id:'get',phase:'done',result:'win'}),quit(){}};
 arcade.input('left');assert.equal(counts().wins,0);assert.equal(arcade.model,null);
});

test('back to the picker cancels the run and keeps quitting reward free',()=>{
 const {arcade,counts}=setup();arcade.select('get');arcade.start();const model=arcade.model;
 arcade.open();assert.equal(model.snapshot().result,'quit');assert.equal(arcade.model,null);assert.equal(counts().wins,0);
});


test('Heading accepts ArrowUp as jump and refuses input while hidden',()=>{
 const {arcade,listeners,app}=setup();arcade.select('heading');arcade.start();
 const actions=[];arcade.model.input=action=>actions.push(action);
 listeners.keydown({target:{tagName:'DIV'},key:'ArrowUp',repeat:false,preventDefault(){}});
 assert.deepEqual(actions,['jump']);
 app.panelVisible=false;arcade.input('left');assert.deepEqual(actions,['jump']);
 assert.equal(arcade.model.snapshot().paused,true);arcade.togglePause();assert.equal(arcade.model.snapshot().paused,true);
});
test('unavailable games explain why Start will not run',()=>{
 const {arcade,app}=setup();app.state.isSleeping=true;arcade.select('get');arcade.start();
 assert.equal(arcade.q('.arcade-start').disabled,true);
 assert.match(arcade.q('.arcade-instruction').textContent,/Wake/);
 assert.equal(arcade.model,null);
});
test('visible cue text explains phases and repeated Flag cues identify the new round',()=>{
 assert.equal(arcadeCue({id:'bump',phase:'meter'}),'Stop in the target');
 assert.equal(arcadeCue({id:'hoops',phase:'arc',made:true}),'Basket!');
 assert.equal(arcadeCue({id:'get',phase:'done',result:'loss'}),'Try another round');
 assert.notEqual(arcadeCue({id:'flag',phase:'cue',cue:'left',round:1}),arcadeCue({id:'flag',phase:'cue',cue:'left',round:2}));
});
test('Memory plays one paired tone per visible cue and replays after pause',()=>{
 const {arcade,app}=setup();const tones=[];app.sound.beep=(...args)=>tones.push(args);
 arcade.select('memory');arcade.start();assert.equal(tones.length,1);
 arcade.paint();arcade.paint();assert.equal(tones.length,1);
 arcade.pause();arcade.togglePause();assert.equal(tones.length,2);
 assert.ok([440,660,880].includes(tones[0][0]));
});
test('clock countdown changes do not repeatedly announce score status',()=>{
 const {arcade}=setup();arcade.select('get');arcade.start();
 const first=arcade.q('.arcade-announcement').textContent;
 arcade.model.advance(1000);arcade.paint();
 assert.equal(arcade.q('.arcade-announcement').textContent,first);
 assert.doesNotMatch(first,/seconds|30s/);
});
