import test from 'node:test';
import assert from 'node:assert/strict';
import {launcherPreferences} from '../widget/launcher-settings.js';
import {SaveStore} from '../widget/save-store.js';

test('visitor launcher choices persist across stores without changing site defaults or other instances',()=>{
  const values=new Map();
  const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
  const store=new SaveStore('visitor',{storage});
  assert.deepEqual(launcherPreferences(store,'brand','off'),{brand:true,notifications:false});
  store.preference('brand-launcher',false);store.preference('notifications',true);
  assert.deepEqual(launcherPreferences(new SaveStore('visitor',{storage}),'brand','off'),{brand:false,notifications:true});
  assert.deepEqual(launcherPreferences(new SaveStore('other',{storage}),'brand','off'),{brand:true,notifications:false});
  store.preference('brand-launcher',true);store.preference('notifications',false);
  assert.deepEqual(launcherPreferences(store,'shell','on'),{brand:true,notifications:false});
});
