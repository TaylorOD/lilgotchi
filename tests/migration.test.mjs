import test from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../pets/engine.js';
import { SaveStore, saveKey } from '../widget/save-store.js';
let id=0;
function setup(){
  const values=new Map();
  const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  const instance=`migration-${++id}`;
  const store=new SaveStore(instance,{storage,locks:null});
  return {values,storage,store,key:saveKey(instance,'default'),old:'taylor-pocket-pets-p1-v1-classic'};
}
test('legacy copy maps every family, preserves source and simplified saves, and runs only explicitly',async()=>{
  const {store,storage}=setup();
  storage.setItem('taylor-pocket-pets-v1','simplified');
  for(const [family,type] of [['default','classic'],['slice','pizza'],['cyberpunk','cyberpunk']]){
    const source=`taylor-pocket-pets-p1-v1-${type}`,raw=JSON.stringify(new GameState());
    storage.setItem(source,raw);
    assert.equal(store.load(family),null);
    assert.throws(()=>store.migrateLegacy(family),/another window/);
    await store.acquire(family);
    assert.equal(store.migrateLegacy(family),true);
    const saved=store.load(family);
    assert.deepEqual(saved.state,JSON.parse(raw));assert.equal(saved.family,family);
    assert.equal(storage.getItem(source),raw);
    assert.ok(storage.getItem(saveKey(store.instance,family)+':migration'));
    saved.state.weight=8;store.save(family,saved.state);
    assert.equal(store.migrateLegacy(family),false);
    assert.equal(store.load(family).state.weight,8);
  }
  assert.equal(storage.getItem('taylor-pocket-pets-v1'),'simplified');store.dispose();
});
test('missing source is harmless and any destination bytes take precedence',async()=>{
  const {store,storage,key,old}=setup();await store.acquire('default');
  assert.equal(store.migrateLegacy('default'),false);
  storage.setItem(old,JSON.stringify(new GameState()));
  for(const raw of ['', 'broken', JSON.stringify({schema:99})]){
    storage.setItem(key,raw);assert.equal(store.migrateLegacy('default'),false);assert.equal(storage.getItem(key),raw);
  }
  store.dispose();
});
test('invalid identities, malformed state and future clocks never create a destination or receipt',async()=>{
  const {store,storage,key,old}=setup();await store.acquire('default');
  for(const raw of ['broken','{}',JSON.stringify({...new GameState(),character:'mametchi'}),JSON.stringify({...new GameState(),lastProcessed:Date.now()+86400000})]){
    storage.setItem(old,raw);assert.throws(()=>store.migrateLegacy('default'));
    assert.equal(storage.getItem(key),null);assert.equal(storage.getItem(key+':migration'),null);assert.equal(storage.getItem(old),raw);
  }
  store.dispose();
});
test('quota failure leaves no session shadow and retries successfully after storage recovers',async()=>{
  const {store,storage,key,old}=setup();await store.acquire('default');
  storage.setItem(old,JSON.stringify(new GameState()));
  const write=storage.setItem;storage.setItem=(name,value)=>{if(name===key)throw new Error('quota');write(name,value);};
  assert.throws(()=>store.migrateLegacy('default'),/quota/);assert.equal(store.load('default'),null);
  assert.equal(storage.getItem(key+':migration'),null);
  storage.setItem=write;assert.equal(store.migrateLegacy('default'),true);store.dispose();
});
test('competing owners cannot migrate and later owners preserve the first copy',async()=>{
  const {store,storage,key,old}=setup();storage.setItem(old,JSON.stringify(new GameState()));
  const other=new SaveStore(store.instance,{storage,locks:null});
  assert.deepEqual(await Promise.all([store.acquire('default'),other.acquire('default')]),[true,false]);
  assert.throws(()=>other.migrateLegacy('default'),/another window/);
  store.migrateLegacy('default');const raw=storage.getItem(key);store.dispose();
  assert.equal(await other.acquire('default'),true);assert.equal(other.migrateLegacy('default'),false);
  assert.equal(storage.getItem(key),raw);other.dispose();
});
test('receipt failure cannot repeat or roll back a durable migration',async()=>{
  const {store,storage,key,old}=setup();await store.acquire('default');storage.setItem(old,JSON.stringify(new GameState()));
  const write=storage.setItem;storage.setItem=(name,value)=>{if(name.endsWith(':migration'))throw new Error('quota');write(name,value);};
  assert.equal(store.migrateLegacy('default'),true);assert.equal(store.migrateLegacy('default'),false);
  assert.equal(store.load('default').revision,1);assert.equal(storage.getItem(key+':migration'),null);store.dispose();
});
test('empty damaged destination and unsupported schema remain recoverable without replacement',async()=>{
  const {store,storage,key,old}=setup();await store.acquire('default');storage.setItem(old,JSON.stringify(new GameState()));
  for(const raw of ['',JSON.stringify({schema:2})]){
    storage.setItem(key,raw);assert.equal(store.migrateLegacy('default'),false);
    assert.throws(()=>store.load('default'),/damaged|recovery/);
    assert.throws(()=>store.save('default',new GameState()),/recovery|Newer/);
    assert.equal(storage.getItem(key),raw);
  }
  storage.setItem(key,'');store.replace('default',new GameState());
  assert.equal(storage.getItem(key+':recovery'),'');
  store.dispose();
});
test('blocked storage allows session play without marking an old pet migrated',async()=>{
  const store=new SaveStore('migration-blocked',{locks:null,storage:{getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');}}});
  await store.acquire('default');assert.equal(store.migrateLegacy('default'),false);assert.equal(store.load('default'),null);
  store.save('default',new GameState());assert.equal(store.persistent,false);
  assert.equal(store.migrateLegacy('default'),false);assert.equal(store.load('default').state.character,'egg');store.dispose();
});
