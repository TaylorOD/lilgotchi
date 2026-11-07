import test from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../pets/engine.js';
import { getCharacter } from '../pets/catalog.js';
globalThis.HTMLElement=class{};
globalThis.customElements={get:()=>true};
const { LilGotchi }=await import('../lilgotchi.js');
function backup(family='slice'){
  return JSON.stringify({schema:1,instance:'source',family,revision:1,savedAt:Date.now(),state:new GameState(getCharacter(family))});
}
function host(){
  const message={textContent:''},button={focus(){this.focused=true;}},file={value:'old.json'};
  const preview={hidden:true,querySelector:selector=>selector==='p'?message:button};
  const errors=[];
  const widget={allowed:['slice','cyberpunk'],shadowRoot:{querySelector:selector=>selector==='.file'?file:preview},fail:error=>errors.push(error.message),unload:()=>assert.fail('Preview must not unload a pet')};
  widget.previewImportText=text=>LilGotchi.prototype.previewImportText.call(widget,text);
  return {widget,preview,message,button,file,errors};
}
test('pasted backup previews safely and invalid replacements clear stale confirmation',()=>{
  const {widget,preview,message,button,errors}=host();
  widget.previewImportText(backup());
  assert.equal(widget.importData.family,'slice');assert.equal(preview.hidden,false);assert.equal(button.focused,true);assert.match(message.textContent,/Replace Slice/);
  for(const text of ['bad json','x'.repeat(32769),backup('mametchi')]){
    widget.previewImportText(text);assert.equal(widget.importData,null);assert.equal(preview.hidden,true);
  }
  assert.equal(errors.length,3);
});
test('slow file reads cannot replace a newer pasted preview',async()=>{
  const {widget,file}=host();let finish;
  const pending=LilGotchi.prototype.previewImport.call(widget,{size:100,text:()=>new Promise(resolve=>finish=resolve)});
  widget.previewImportText(backup('cyberpunk'));
  finish(backup('slice'));await pending;
  assert.equal(widget.importData.family,'cyberpunk');assert.equal(file.value,'');
});
test('canceling an in flight file leaves no confirmation',async()=>{
  const {widget,preview}=host();let finish;
  const pending=LilGotchi.prototype.previewImport.call(widget,{size:100,text:()=>new Promise(resolve=>finish=resolve)});
  widget.importPreviewId++;
  finish(backup());await pending;
  assert.equal(widget.importData,null);assert.equal(preview.hidden,true);
});
