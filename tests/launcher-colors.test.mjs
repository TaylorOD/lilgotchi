import test from 'node:test';
import assert from 'node:assert/strict';
import { launcherArt, launcherIcon } from '../widget/launcher.js';

test('launcher shells distinguish the four families while retaining saved pet art',()=>{
  const families=[
    ['default','#e8d5c4','#c4cfa1'],
    ['slice','#594632','#29231c'],
    ['cyberpunk','#304e59','#0b1c24'],
    ['lilgotchi','#fff0cc','#20281d'],
  ];
  for(const [family,shell,screen] of families){
    const icon=launcherIcon(family,{character:'egg'});
    assert.ok(icon.includes(`fill="${shell}"`),`${family} shell`);
    assert.ok(icon.includes(`<path fill="${screen}" d="M6 8h12v14H6z"`),`${family} screen`);
    assert.notEqual(icon,launcherIcon(family,{character:'mametchi'}));
  }
  assert.ok(launcherIcon('mametchi').includes('fill="#e8d5c4"'));
  assert.equal(launcherIcon('unknown'),launcherIcon('default'));
});

test('original launchers match the active LCD and e ink colors',()=>{
  const original=launcherIcon('mametchi');
  assert.ok(original.includes('fill="#0f380f"'));
  const eink=launcherIcon('mametchi',null,{eink:true});
  for(const color of ['#d8d8d8','#f5f5f5','#f0f0f0','#111'])assert.ok(eink.includes(`fill="${color}"`));
  assert.equal(launcherIcon('slice',null,{eink:true}),launcherIcon('slice'));
});

test('without a shell the launcher shows the pet and its label',()=>{
  const state={character:'mametchi'};
  assert.equal(launcherIcon('slice',state,{shell:false}),`${launcherArt('slice',state)}<span class="launcher-label">lilgotchi</span>`);
  assert.ok(!launcherArt('slice',state).includes('<path'));
});
