import test from 'node:test';
import assert from 'node:assert/strict';
import {trapOverlayTab} from '../pets/focus.js';
function fixture(){
 let focused=null,prevented=0;
 const control=options=>({...options,focus(){focused=this;},getClientRects:()=>[{}],closest:()=>null});
 const hidden=control({hidden:true}),disabled=control({disabled:true}),first=control(),middle=control(),last=control();
 const overlay={querySelectorAll:()=>[hidden,first,disabled,middle,last]};
 const press=(active,shiftKey=false,key='Tab')=>{prevented=0;focused=null;trapOverlayTab({key,shiftKey,preventDefault(){prevented++;}},overlay,active);return {focused,prevented};};
 return {overlay,hidden,disabled,first,middle,last,press};
}
test('Tab from the dialog root enters the first control and Shift Tab enters the last',()=>{
 const f=fixture();assert.deepEqual(f.press(f.overlay),{focused:f.first,prevented:1});assert.deepEqual(f.press(f.overlay,true),{focused:f.last,prevented:1});
});
test('tab trapping wraps enabled visible controls but leaves interior navigation alone',()=>{
 const f=fixture();assert.equal(f.press(f.first,true).focused,f.last);assert.equal(f.press(f.last).focused,f.first);
 assert.equal(f.press(f.middle).prevented,0);assert.equal(f.press(f.middle,true).prevented,0);assert.equal(f.press(f.first,false,'ArrowRight').prevented,0);
});
test('focus left on a hidden or disabled button recovers into the active controls',()=>{
 const f=fixture();assert.equal(f.press(f.hidden).focused,f.first);assert.equal(f.press(f.disabled,true).focused,f.last);
});
