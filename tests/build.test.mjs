import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir,writeFile,readFile,readdir,access } from 'node:fs/promises';
import { resolve,dirname } from 'node:path';
const root=resolve(import.meta.dirname,'..'),dist=resolve(root,'dist');
async function files(dir){return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(async item=>item.isDirectory()?files(resolve(dir,item.name)):[resolve(dir,item.name)]))).flat();}
test('release rebuild removes stale files and contains all local runtime imports and assets',async()=>{
  await mkdir(resolve(dist,'pets'),{recursive:true});await writeFile(resolve(dist,'pets/panel.js'),'stale');await writeFile(resolve(dist,'stale.txt'),'stale');
  execFileSync(process.execPath,['scripts/build.mjs'],{cwd:root});
  const output=await files(dist);
  assert.ok(output.length>30);
  assert.equal(output.some(file=>/[/\\](qa|tests|server-example)[/\\]|\.test\.|[/\\](panel|widget)\.(js|css)$|stale\.txt$/.test(file)),false);
  const version=JSON.parse(await readFile(resolve(dist,'version.json')));assert.equal(version.version,JSON.parse(await readFile(resolve(root,'package.json'))).version);
  await access(resolve(dist,'LICENSE.md'));await access(resolve(dist,'examples/install.html'));
  for(const file of output.filter(name=>/\.(js|css|html)$/.test(name))){
    const text=await readFile(file,'utf8');
    const paths=[...text.matchAll(/(?:from\s*|import\s*|import\(|new URL\(|asset\()\s*['"](\.[^'"]+)['"]|(?:src|href)=["']([^"'#]+)["']|url\(['"]?([^)'"\s]+)['"]?\)/g)];
    for(const match of paths){
      const path=match[1]||match[2]||match[3];
      if(path.includes('${') || /^(https?:|data:|\/)/.test(path))continue;
      const target=resolve(dirname(file),path.split('?')[0].split('#')[0]);
      await assert.doesNotReject(access(target),`${file} points at missing ${path}`);
    }
  }
});
