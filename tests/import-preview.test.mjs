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
  const retry={hidden:false};
  const widget={allowed:['slice','cyberpunk'],status(text){this.statusText=text;this.statusError=false;},shadowRoot:{querySelector:selector=>selector==='.file'?file:selector==='.retry'?retry:preview},fail:error=>{errors.push(error.message);widget.statusError=true;retry.hidden=false;},unload:()=>assert.fail('Preview must not unload a pet')};
  widget.prepareFileImport=text=>LilGotchi.prototype.prepareFileImport.call(widget,text);
  return {widget,preview,message,button,file,errors,retry};
}
test('file backups preview safely and invalid replacements clear stale confirmation',async()=>{
  const {widget,preview,message,button,errors}=host();
  await LilGotchi.prototype.previewImport.call(widget,{size:100,text:async()=>backup()});
  assert.equal(widget.importData.family,'slice');assert.equal(preview.hidden,false);assert.equal(button.focused,true);assert.match(message.textContent,/Replace Slice/);
  for(const text of ['bad json','x'.repeat(32769),backup('mametchi')]){
    await LilGotchi.prototype.previewImport.call(widget,{size:text.length,text:async()=>text});assert.equal(widget.importData,null);assert.equal(preview.hidden,true);
  }
  assert.equal(errors.length,3);
  await LilGotchi.prototype.previewImport.call(widget,{size:100,text:async()=>backup()});
  assert.equal(widget.statusError,false);assert.match(widget.statusText,/Review/);
  assert.equal(widget.shadowRoot.querySelector('.retry').hidden,true);
});
test('slow file reads cannot replace a newer selected file',async()=>{
  const {widget,file}=host();let finish;
  const pending=LilGotchi.prototype.previewImport.call(widget,{size:100,text:()=>new Promise(resolve=>finish=resolve)});
  await LilGotchi.prototype.previewImport.call(widget,{size:100,text:async()=>backup('cyberpunk')});
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

test('cancel focus returns to its visible import trigger or the character picker',()=>{
  const calls=[];
  const trigger={getClientRects:()=>[{}],closest:()=>null,focus:()=>calls.push('trigger')};
  const widget={importFocus:trigger,select:{focus:()=>calls.push('picker')}};
  LilGotchi.prototype.restoreImportFocus.call(widget);
  assert.deepEqual(calls,['trigger']);assert.equal(widget.importFocus,null);
  widget.importFocus={...trigger,getClientRects:()=>[]};
  LilGotchi.prototype.restoreImportFocus.call(widget);
  assert.deepEqual(calls,['trigger','picker']);
});
test('import remembers a different target pet before replacement and restores visible focus',async()=>{
  const target={...new GameState(getCharacter('cyberpunk')),isDead:true,stage:'dead',bornAt:1000};
  const replacement=new GameState(getCharacter('cyberpunk'));
  const calls=[],nodes={'.import':{hidden:false}};
  const widget={
    family:'slice',allowed:['slice','cyberpunk'],importData:{family:'cyberpunk',state:replacement},
    serial:callback=>callback(),unload:async()=>calls.push('unload'),mount:async()=>calls.push('mount'),
    store:{acquire:async()=>true,raw:()=>JSON.stringify({state:target}),replace:()=>calls.push('replace'),preference:()=>{},release:()=>calls.push('release')},
    rememberDeath:(family,state)=>{assert.equal(family,'cyberpunk');calls.push(state.bornAt===1000?'remember old target':'remember replacement');},
    renderHistory:()=>{},updateLauncher:()=>{},select:{focus:()=>calls.push('focus picker')},
    shadowRoot:{querySelector:selector=>nodes[selector]}
  };
  await LilGotchi.prototype.confirmImport.call(widget);
  assert.deepEqual(calls,['unload','remember old target','replace','remember replacement','release','mount','focus picker']);
  assert.equal(widget.family,'cyberpunk');assert.equal(widget.importData,null);
});
