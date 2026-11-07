import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
const source=(await readFile(new URL('../embed.js',import.meta.url),'utf8')).replace('import(loader)','load(loader)');
function setup({loading=false,inline=false,fail=false,head=false}={}){
  const mounted=[],events=[],attrs={'data-character':'cyberpunk','data-storage-key':'test','data-onclick':'unsafe'};
  if(inline)attrs['data-mode']='inline';
  let ready,loaded;
  const script={src:'https://assets.example/pets/0.2.0/embed.js',hasAttribute:k=>k in attrs,getAttribute:k=>attrs[k],after:pet=>mounted.push(['inline',pet]),dispatchEvent:event=>events.push(event)};
  const document={currentScript:script,readyState:loading?'loading':'complete',addEventListener:(name,callback)=>{assert.equal(name,'DOMContentLoaded');ready=callback;},body:{contains:()=>!head,append:pet=>mounted.push(['body',pet])},createElement:name=>({name,attrs:{},setAttribute(k,v){this.attrs[k]=v;},getAttribute(k){return this.attrs[k];},hasAttribute(k){return k in this.attrs;}})};
  runInNewContext(source,{document,URL,Promise,CustomEvent:class{constructor(type){this.type=type;}},console:{error(){}},load:async url=>{loaded=url;if(fail)throw Error('network');}});
  return {mounted,events,document,ready:()=>ready(),loaded:()=>loaded};
}
const settle=()=>new Promise(resolve=>setImmediate(resolve));
test('one script waits for the body and captures its own URL and allowed settings',async()=>{
  const state=setup({loading:true});state.document.currentScript=null;
  await settle();assert.equal(state.mounted.length,0);state.ready();await settle();
  assert.equal(state.loaded(),'https://assets.example/pets/0.2.0/lilgotchi.js');
  assert.equal(state.mounted.length,1);assert.equal(state.mounted[0][1].attrs.character,'cyberpunk');
  assert.equal(state.mounted[0][1].attrs['storage-key'],'test');assert.equal('onclick' in state.mounted[0][1].attrs,false);
});
test('inline embeds follow their script or fall back to the body for head scripts',async()=>{
  const body=setup({inline:true}),head=setup({inline:true,head:true});await settle();
  assert.equal(body.mounted[0][0],'inline');assert.equal(head.mounted[0][0],'body');
});
test('failed imports do not mount a broken widget and report a load error',async()=>{
  const state=setup({fail:true});await settle();assert.equal(state.mounted.length,0);assert.equal(state.events[0].type,'lilgotchi:loaderror');
});
