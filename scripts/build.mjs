import { mkdir, copyFile, readdir, cp, rm, lstat, writeFile, readFile } from 'node:fs/promises';
import { resolve, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { withSiteVersion } from './site-version.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const out=resolve(root,'dist');
if(relative(root,out)!=='dist' || !out.startsWith(root+sep))throw new Error('Unsafe output directory');
const existing=await lstat(out).catch(error=>{if(error.code!=='ENOENT')throw error;});
if(existing?.isSymbolicLink())throw new Error('Build output must not be a link');
await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
for(const name of ['lilgotchi.js','embed.js','index.html','README.md','LICENSE.md'])await copyFile(resolve(root,name),resolve(out,name));
for(const folder of ['widget','pets']){
  await mkdir(resolve(out,folder),{recursive:true});
  for(const item of await readdir(resolve(root,folder),{withFileTypes:true})){
    if(item.isFile() && /\.(js|css|html|md|svg)$/.test(item.name) && !['widget.js','widget.css','panel.js'].includes(item.name))await copyFile(resolve(root,folder,item.name),resolve(out,folder,item.name));
  }
}
await cp(resolve(root,'pets/minigames'),resolve(out,'pets/minigames'),{recursive:true});
await cp(resolve(root,'docs'),resolve(out,'docs'),{recursive:true});
await cp(resolve(root,'design/games'),resolve(out,'design/games'),{recursive:true});
await cp(resolve(root,'design/evolution'),resolve(out,'design/evolution'),{recursive:true});
await cp(resolve(root,'examples'),resolve(out,'examples'),{recursive:true});
await mkdir(resolve(out,'reference'));
await copyFile(resolve(root,'reference/source.json'),resolve(out,'reference/source.json'));
const {name,version}=JSON.parse(await readFile(resolve(root,'package.json'),'utf8'));
for(const file of ['index.html','widget/install-snippet.js','widget/configurator.js','README.md']) {
  const path=resolve(out,file);
  await writeFile(path,withSiteVersion(await readFile(path,'utf8'),version));
}
await writeFile(resolve(out,'version.json'),JSON.stringify({name,version,schema:1},null,2)+'\n');
console.log(`Static ${name} ${version} ready in dist. Copy the whole folder to your site.`);
