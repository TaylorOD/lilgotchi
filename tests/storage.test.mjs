import test from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../pets/engine.js';
import { SaveStore, saveKey, validEnvelope, parseImport } from '../widget/save-store.js';

function storage(){const values=new Map();return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};}
function store(instance,backend,options={}){return new SaveStore(instance,{storage:backend,locks:null,...options});}

test('families and instances save independent validated state and preferences',async()=>{
  const backend=storage(),a=store('separate-a',backend),b=store('separate-b',backend);
  for(const family of ['default','slice','cyberpunk']){
    assert.equal(a.load(family),null);assert.equal(await a.acquire(family),true);
    a.save(family,new GameState());
    assert.equal(a.load(family).family,family);assert.equal(b.load(family),null);
  }
  a.preference('character','cyberpunk');assert.equal(store('separate-a',backend).preference('character'),'cyberpunk');
  a.dispose();b.dispose();
});
test('competing instances cannot save until the owner releases',async()=>{
  const backend=storage(),a=store('competition',backend),b=store('competition',backend);
  a.load('default');b.load('default');
  assert.equal(await a.acquire('default'),true);assert.equal(await b.acquire('default'),false);
  assert.throws(()=>b.save('default',new GameState()),/another window/);
  a.save('default',new GameState());a.release('default');
  assert.equal(await b.acquire('default'),true);b.load('default');assert.equal(b.save('default',new GameState()).revision,2);b.dispose();
});
test('stale revisions never overwrite a newer save',async()=>{
  const backend=storage(),a=store('revision',backend);
  a.load('slice');await a.acquire('slice');const current=a.save('slice',new GameState());
  backend.setItem(saveKey('revision','slice'),JSON.stringify({...current,revision:40}));
  assert.throws(()=>a.save('slice',new GameState()),/Newer progress/);a.dispose();
});
test('expired fallback lease cannot continue writing after another owner takes over',async()=>{
  let time=1000;const backend=storage(),a=store('lease',backend,{now:()=>time});
  a.load('slice');await a.acquire('slice');time=17000;
  assert.equal(a.renew('slice'),false);assert.throws(()=>a.save('slice',new GameState()),/another window/);a.dispose();
});
test('quota failure keeps the newer session state across saves and reopening',async()=>{
  const backend=storage(),a=store('quota',backend);a.load('slice');await a.acquire('slice');
  a.save('slice',new GameState());backend.setItem=()=>{throw new Error('quota');};
  const state=new GameState();state.weight=6;a.save('slice',state);state.weight=7;a.save('slice',state);
  assert.equal(a.persistent,false);assert.equal(a.load('slice').state.weight,7);a.dispose();
  const reopened=store('quota',backend);assert.equal(reopened.load('slice').state.weight,7);assert.equal(reopened.persistent,false);reopened.dispose();
});
test('blocked storage can retain progress for this page visit',async()=>{
  const backend={getItem(){throw new Error();},setItem(){throw new Error();}},a=store('blocked',backend);
  a.load('default');await a.acquire('default');a.save('default',new GameState());a.dispose();
  assert.equal(store('blocked',backend).load('default').state.character,'egg');
});
test('corrupt saves are preserved and not silently replaced',async()=>{
  const backend=storage();backend.setItem(saveKey('corrupt','default'),'broken');const a=store('corrupt',backend);
  assert.throws(()=>a.load('default'),/damaged/);await a.acquire('default');assert.throws(()=>a.save('default',new GameState()),/recovery/);
  assert.equal(backend.getItem(saveKey('corrupt','default')),'broken');a.dispose();
});
test('imports reject malformed identity, future clocks and oversized input',()=>{
  const data={schema:1,instance:'portable',family:'slice',revision:1,savedAt:Date.now(),state:new GameState()};
  assert.equal(parseImport(JSON.stringify(data)).family,'slice');
  assert.equal(validEnvelope({...data,state:{...data.state,character:'mametchi'}}),false);
  assert.throws(()=>parseImport(JSON.stringify({...data,state:{...data.state,lastProcessed:Date.now()+86400000}})),/future/);
  assert.throws(()=>parseImport('x'.repeat(40000)),/large/);assert.throws(()=>parseImport('{}'),/invalid/);
});
test('confirmed import preserves damaged data and validates before replacement',async()=>{
  const backend=storage(),a=store('recovery',backend);const key=saveKey('recovery','slice');
  backend.setItem(key,'damaged original');await a.acquire('slice');
  assert.throws(()=>a.replace('slice',{}),/Invalid/);assert.equal(backend.getItem(key),'damaged original');
  a.replace('slice',new GameState());assert.equal(backend.getItem(key+':recovery'),'damaged original');
  assert.equal(a.load('slice').state.character,'egg');a.dispose();
});
test('Web Locks hold ownership until release and permit later acquisition',async()=>{
  const held=new Set();const locks={async request(key,options,callback){
    if(held.has(key))return callback(null);
    held.add(key);try{await callback({name:key});}finally{held.delete(key);}
  }};
  const backend=storage(),a=new SaveStore('weblocks',{storage:backend,locks}),b=new SaveStore('weblocks',{storage:backend,locks});
  assert.equal(await a.acquire('default'),true);assert.equal(await b.acquire('default'),false);
  a.release('default');await new Promise(resolve=>setTimeout(resolve,0));
  assert.equal(await b.acquire('default'),true);b.dispose();
});

function asynchronousLocks(){
  const held=new Set();
  return {async request(key,options,callback){
    if(held.has(key))return callback(null);
    held.add(key);
    try{return await callback({name:key});}
    finally{await new Promise(resolve=>setImmediate(resolve));held.delete(key);}
  }};
}
test('same store can immediately reacquire a released Web Lock without waiting on an active lock',async()=>{
  const backend=storage(),a=new SaveStore('immediate-weblock',{storage:backend,locks:asynchronousLocks()});
  assert.equal(await a.acquire('slice'),true);
  assert.equal(await a.acquire('slice'),true);
  a.release('slice');
  assert.equal(await a.acquire('slice'),true);
  a.load('slice');a.save('slice',new GameState());
  a.release('slice');
  assert.equal(await a.acquire('slice'),true);a.dispose();
});
test('same family import can unload, replace, release and mount with asynchronous Web Locks',async()=>{
  globalThis.HTMLElement=class{};globalThis.customElements={get:()=>true};
  const {LilGotchi}=await import('../lilgotchi.js');
  const backend=storage(),a=new SaveStore('import-weblock',{storage:backend,locks:asynchronousLocks()});
  await a.acquire('slice');a.load('slice');const previous=new GameState();a.save('slice',previous);
  const original=a.raw('slice'),imported=new GameState();imported.hunger=3;
  const nodes={'.import':{hidden:false},'#save-text':{value:'backup'}};
  let mounted=false,focused=false;
  const widget={family:'slice',allowed:['slice'],importData:{family:'slice',state:imported},store:a,
    serial:callback=>callback(),unload:async()=>{a.release('slice');},
    mount:async()=>{assert.equal(await a.acquire('slice'),true);assert.equal(a.load('slice').state.hunger,3);mounted=true;},
    rememberDeath:()=>{},renderHistory:()=>{},updateLauncher:()=>{},
    select:{focus:()=>focused=true},shadowRoot:{querySelector:selector=>nodes[selector]}
  };
  try{
    await LilGotchi.prototype.confirmImport.call(widget);
    assert.equal(mounted,true);assert.equal(focused,true);
    assert.equal(backend.getItem(saveKey('import-weblock','slice')+':recovery'),original);
  }finally{a.dispose();}
});
