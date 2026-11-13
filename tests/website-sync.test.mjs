import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm,access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {syncWebsite} from '../scripts/sync-website.mjs';

test('publishing updates the site but preserves existing installs and previews',async()=>{
  const root=await mkdtemp(join(tmpdir(),'lilgotchi-publish-'));
  try {
    const build=join(root,'build'),site=join(root,'site');
    await mkdir(build); await mkdir(join(site,'pr-preview','pr-1'),{recursive:true});
    await writeFile(join(build,'version.json'),JSON.stringify({version:'1.2.3'}));
    await writeFile(join(build,'index.html'),'first');
    await writeFile(join(site,'pr-preview','pr-1','index.html'),'preview');
    await writeFile(join(site,'CNAME'),'example.com');
    await writeFile(join(site,'obsolete.js'),'old');
    await syncWebsite(build,site);
    await writeFile(join(build,'index.html'),'new');
    await syncWebsite(build,site);
    assert.equal(await readFile(join(site,'index.html'),'utf8'),'new');
    assert.equal(await readFile(join(site,'releases','1.2.3','index.html'),'utf8'),'first');
    assert.equal(await readFile(join(site,'pr-preview','pr-1','index.html'),'utf8'),'preview');
    assert.equal(await readFile(join(site,'CNAME'),'utf8'),'example.com');
    await assert.rejects(access(join(site,'obsolete.js')));
    await assert.rejects(syncWebsite(build,build));
    await writeFile(join(build,'version.json'),JSON.stringify({version:'../../bad'}));
    await assert.rejects(syncWebsite(build,site));
    assert.equal(await readFile(join(site,'index.html'),'utf8'),'new');
  } finally {await rm(root,{recursive:true,force:true});}
});
