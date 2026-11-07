import test from 'node:test';
import assert from 'node:assert/strict';
import { overlayContentHeight } from '../pets/overlay-size.js';

function item(height, css = {}, visible = true) {
  return { css, getClientRects: () => visible ? [{}] : [], getBoundingClientRect: () => ({ height }) };
}
const styleFor = node => node.css;

test('overlay size includes every visible flex gap, padding, margins and borders', () => {
  const overlay = {
    css: { rowGap:'12px', paddingTop:'20px', paddingBottom:'20px', borderTopWidth:'1px', borderBottomWidth:'1px' },
    children: [item(44), item(86.5,{marginBottom:'6px'}), item(44,{marginTop:'8px'})],
  };
  assert.equal(overlayContentHeight(overlay,styleFor),255);
});

test('hidden settings rows contribute neither margins nor a gap', () => {
  const overlay = {
    css: { rowGap:'12px', paddingTop:'20px', paddingBottom:'20px' },
    children: [item(44),item(0,{marginTop:'4px',marginBottom:'4px'},false),item(44)],
  };
  assert.equal(overlayContentHeight(overlay,styleFor),140);
});

test('wrapped text grows the frame and normal CSS values remain finite', () => {
  const text=item(100,{marginTop:'auto',marginBottom:'0px'});
  const overlay={css:{rowGap:'normal'},children:[text,item(44)]};
  assert.equal(overlayContentHeight(overlay,styleFor),144);
  text.getBoundingClientRect=()=>({height:200.2});
  assert.equal(overlayContentHeight(overlay,styleFor),245);
});
