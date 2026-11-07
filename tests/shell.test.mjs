import test from 'node:test';
import assert from 'node:assert/strict';
import { lockPage, unlockPage } from '../widget/scroll-lock.js';

test('modal scroll ownership survives duplicate opens and multiple instances',()=>{
  const root={style:{overflow:'clip'}},a={},b={};
  lockPage(a,root);lockPage(a,root);lockPage(b,root);
  assert.equal(root.style.overflow,'hidden');
  unlockPage(a,root);assert.equal(root.style.overflow,'hidden');
  unlockPage(a,root);assert.equal(root.style.overflow,'hidden');
  unlockPage(b,root);assert.equal(root.style.overflow,'clip');
});

globalThis.HTMLElement=class{};
globalThis.customElements={get:()=>true};
const { LilGotchi }=await import('../lilgotchi.js');
test('resize messages accept only bounded integers from the current family',()=>{
  const widget={family:'slice',frame:{style:{height:'340px'}}};
  for(const height of [-1,0,99,1201,Infinity,'400',400.5])LilGotchi.prototype.receive.call(widget,{type:'resize',height},'slice');
  assert.equal(widget.frame.style.height,'340px');
  LilGotchi.prototype.receive.call(widget,{type:'resize',height:500},'default');
  assert.equal(widget.frame.style.height,'340px');
  LilGotchi.prototype.receive.call(widget,{type:'resize',height:456},'slice');
  assert.equal(widget.frame.style.height,'456px');
});
test('closing waits for snapshot before tearing down the active frame',async()=>{
  const events=[];
  let saved;
  const widget={family:'slice',snapshot:()=>new Promise(resolve=>{saved=resolve}),detachFrame:()=>events.push('detach'),store:{release:family=>events.push(family)}};
  const closing=LilGotchi.prototype.unload.call(widget);
  assert.deepEqual(events,[]);
  saved();await closing;
  assert.deepEqual(events,['detach','slice']);
});
test('closing a drawer saves and suspends presentation without unloading its live pet',async()=>{
  globalThis.document={documentElement:{style:{overflow:''}}};
  const events=[];
  const widget={serial:fn=>fn(),snapshot:async closing=>events.push(['save',closing]),port:{postMessage:value=>events.push(value)},inline:false,panel:{close:()=>events.push('close')},shadowRoot:{querySelector:()=>({focus(){}})},emit:name=>events.push(name)};
  await LilGotchi.prototype.close.call(widget);
  assert.deepEqual(events,[['save',true],{type:'visibility',visible:false},'close','close']);
});
test('frame scroll rejects nonnumeric and excessive requests',()=>{
  const scrolls=[];
  const widget={family:'slice',inline:false,panel:{scrollBy:(x,y)=>scrolls.push(y)}};
  for(const delta of [Infinity,NaN,'30',1001,-1001])LilGotchi.prototype.receive.call(widget,{type:'scroll',delta},'slice');
  LilGotchi.prototype.receive.call(widget,{type:'scroll',delta:45},'slice');
  assert.deepEqual(scrolls,[45]);
});

test('closed save disclosure exposes its summary only to the focus loop',async()=>{
  const { visibleControl }=await import('../widget/focus.js');
  const details={};
  const node={disabled:false,getClientRects:()=>[{}],closest:()=>details,parentElement:details};
  assert.equal(visibleControl({...node,tagName:'SUMMARY'}),true);
  assert.equal(visibleControl({...node,tagName:'BUTTON'}),false);
  assert.equal(visibleControl({...node,tagName:'A'}),false);
  assert.equal(visibleControl({...node,tagName:'BUTTON',closest:()=>null}),true);
  assert.equal(visibleControl({...node,tagName:'BUTTON',closest:()=>null,disabled:true}),false);
});
