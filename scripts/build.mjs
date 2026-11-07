import { mkdir, copyFile, readdir, cp } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const out=resolve(root,'dist');
await mkdir(out,{recursive:true});
for(const name of ['lilgotchi.js','index.html'])await copyFile(resolve(root,name),resolve(out,name));
for(const folder of ['widget','pets']){
  await mkdir(resolve(out,folder),{recursive:true});
  for(const item of await readdir(resolve(root,folder),{withFileTypes:true})){
    if(item.isFile() && !item.name.includes('.test.') && !['widget.js','widget.css','panel.js'].includes(item.name))await copyFile(resolve(root,folder,item.name),resolve(out,folder,item.name));
  }
}
for(const folder of ['docs','reference','examples'])await cp(resolve(root,folder),resolve(out,folder),{recursive:true});
await copyFile(resolve(root,'README.md'),resolve(out,'README.md'));
console.log('Static widget ready in dist. Copy the whole folder to your site.');
