import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.HTMLElement=class {};
globalThis.customElements={get:()=>true};
globalThis.Option=class {constructor(text,value){this.text=text;this.value=value;}};
const {LilGotchi}=await import('../lilgotchi.js');

test('setup preview changes families without starting pets or writing preferences',async()=>{
  const pet=Object.create(LilGotchi.prototype);
  pet.family='slice';pet.panel={open:false};pet.select={replaceChildren(...options){this.options=options;}};
  pet.serial=fn=>fn();pet.unload=async()=>{};pet.updateLauncher=()=>{};pet.setAttribute=()=>{};
  pet.mount=()=>assert.fail('a closed preview must not start a pet');
  pet.store={preference:()=>assert.fail('preview must not overwrite visitor preferences')};
  const options={characters:'cyberpunk,lilgotchi',character:'cyberpunk',launcher:'pet',notifications:'off',appearance:'light',placement:'bottom-left'};
  await pet.preview(options);
  assert.equal(pet.family,'cyberpunk');
  assert.deepEqual(pet.allowed,['cyberpunk','lilgotchi']);
  assert.deepEqual(pet.select.options.map(option=>option.value),pet.allowed);
  assert.deepEqual(pet.launcherPreferences(),{brand:false,notifications:false});
  assert.throws(()=>pet.preview({...options,characters:''}));
  assert.equal(pet.family,'cyberpunk');
});
