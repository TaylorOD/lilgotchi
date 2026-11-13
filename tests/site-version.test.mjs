import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {withSiteVersion} from '../scripts/site-version.mjs';

test('a future package version updates the label, release link and install code together',async()=>{
  const root=new URL('../',import.meta.url);
  const page=withSiteVersion(await readFile(new URL('index.html',root),'utf8'),'9.8.7');
  assert.match(page,/aria-label="Release v9\.8\.7">v9\.8\.7<\/a>/);
  assert.match(page,/releases\/tag\/v9\.8\.7/);
  const snippet=withSiteVersion(await readFile(new URL('widget/install-snippet.js',root),'utf8'),'9.8.7');
  assert.match(snippet,/releases\/9\.8\.7\/embed\.js/);
  const configurator=withSiteVersion(await readFile(new URL('widget/configurator.js',root),'utf8'),'9.8.7');
  assert.match(configurator,/install-snippet\.js\?v=9\.8\.7/);
});
