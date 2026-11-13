import test from 'node:test';
import assert from 'node:assert/strict';
import { configurationActionId, validConfiguration, mountSettings } from '../widget/settings.js';

function fixture(){
  const doc={createElement:tag=>({tag,children:[],attrs:{},handlers:{},append(...nodes){this.children.push(...nodes);},setAttribute(name,value){this.attrs[name]=value;},addEventListener(name,callback){this.handlers[name]=callback;}})};
  const container=doc.createElement('div');container.ownerDocument=doc;
  const sent=[];
  const controls=mountSettings(container,action=>sent.push(action));
  const rows=container.children;
  const buttons=rows.map(row=>row.children.find(child=>child.tag==='button'));
  return {container,rows,buttons,sent,controls};
}
const configuration={vacation:false,scanlines:false,eink:false,muted:true,classic:true};

test('configuration commands only map known controls and restrict E ink to originals',()=>{
  assert.equal(configurationActionId('vacation'),'vacation-toggle');
  assert.equal(configurationActionId('reset'),'reset-game-btn');
  assert.equal(configurationActionId('eink',false),null);
  for(const action of ['constructor','toString','__proto__','feed','',null,{},1])assert.equal(configurationActionId(action),null);
});

test('settings wait for ready configuration and show actual state without optimistic toggles',()=>{
  const {buttons,sent,controls}=fixture();
  controls.setReady(true);assert.ok(buttons.every(button=>button.disabled));
  controls.update(configuration);assert.ok(buttons.every(button=>!button.disabled));
  buttons[0].handlers.click();assert.deepEqual(sent,['vacation']);assert.equal(buttons[0].attrs['aria-checked'],'false');
  controls.update({...configuration,vacation:true,muted:false});
  assert.equal(buttons[0].attrs['aria-checked'],'true');assert.equal(buttons[2].attrs['aria-checked'],'true');
  assert.equal(buttons[2].children[0].textContent,'On');
  buttons[2].handlers.click();buttons[4].handlers.click();assert.deepEqual(sent,['vacation','mute','reset']);
});

test('changing pets clears settings and rejects malformed or unavailable controls',()=>{
  const {rows,buttons,sent,controls}=fixture();
  controls.setReady(true);controls.update(configuration);
  controls.setReady(false);assert.ok(buttons.every(button=>button.disabled));buttons[0].handlers.click();assert.deepEqual(sent,[]);
  controls.setReady(true);assert.ok(buttons.every(button=>button.disabled));
  controls.update({...configuration,classic:false});assert.equal(rows[1].hidden,true);
  buttons[1].handlers.click();assert.deepEqual(sent,[]);
  controls.update({...configuration,vacation:'yes'});assert.equal(buttons[0].attrs['aria-checked'],'false');
  assert.equal(validConfiguration(null),false);assert.equal(validConfiguration({}),false);assert.equal(validConfiguration(configuration),true);
});
