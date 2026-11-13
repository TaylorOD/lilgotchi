import test from 'node:test';
import assert from 'node:assert/strict';
import {applyPetColors,cleanColorMap,resolvedColors,screenInk} from '../pets/colors.js';
import {installSnippet} from '../widget/install-snippet.js';
import {launcherIcon} from '../widget/launcher.js';
test('color settings reject CSS and attribute injection',()=>{
  const colors=cleanColorMap({default:{shell:"red' onload='bad",screen:'#ABCDEF'},unknown:{shell:'#123456'}});
  assert.deepEqual(colors,{default:{screen:'#abcdef'}});
  const snippet=installSnippet({colors});assert.ok(snippet.includes(`data-colors='{"default":{"screen":"#abcdef"}}'`));assert.ok(!snippet.includes('onload'));
});
test('every family supports both colors and clearing restores its defaults',()=>{
  for(const family of ['default','original2','slice','cyberpunk','lilgotchi']){
    const styles=new Map(),root={classList:{contains:()=>false},style:{setProperty:(k,v)=>styles.set(k,v),removeProperty:k=>styles.delete(k)}};
    applyPetColors(root,family,{shell:'#123456',screen:'#ffffff'});
    assert.ok(styles.get('--device-bg').includes('#284a6c'));assert.equal(styles.get('--lcd-bg'),'#ffffff');assert.equal(styles.get('--lcd-fg'),'#142019');
    assert.ok(launcherIcon(family,null,{colors:{screen:'#ffffff'}}).includes('fill="#ffffff"'));
    applyPetColors(root,family,{});
    assert.equal(styles.get('--lcd-bg'),['default','original2'].includes(family)?resolvedColors(family).screen:undefined);
  }
  assert.notDeepEqual(resolvedColors('default'),resolvedColors('original2'));
});
test('screen contrast and e ink remain readable',()=>{
  assert.equal(screenInk('#000000'),'#f4f7ee');assert.equal(screenInk('#ffffff'),'#142019');
  const styles=new Map([['--lcd-bg','#123456']]);
  applyPetColors({classList:{contains:()=>true},style:{removeProperty:k=>styles.delete(k),setProperty:(k,v)=>styles.set(k,v)}},'default',{screen:'#000000'});
  assert.equal(styles.size,0);
});
globalThis.HTMLElement=class{};globalThis.customElements={get:()=>true};
const {LilGotchi}=await import('../lilgotchi.js');
test('saved family colors override install colors and reset stays reset',()=>{
  let saved=null;
  const host={store:{preference:()=>saved},getAttribute:()=>'{"slice":{"shell":"#123456"}}'};
  assert.deepEqual(LilGotchi.prototype.colorsFor.call(host,'slice'),{shell:'#123456'});
  saved='{"screen":"#abcdef"}';assert.deepEqual(LilGotchi.prototype.colorsFor.call(host,'slice'),{screen:'#abcdef'});
  saved='{}';assert.deepEqual(LilGotchi.prototype.colorsFor.call(host,'slice'),{});
});
