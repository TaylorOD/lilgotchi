import {cp, mkdir, readdir, readFile, rm, writeFile, lstat} from 'node:fs/promises';
import {resolve, sep} from 'node:path';
import {pathToFileURL} from 'node:url';

export async function syncWebsite(source, destination) {
  source=resolve(source); destination=resolve(destination);
  if (source===destination || source.startsWith(destination+sep) || destination.startsWith(source+sep)) throw new Error('Build and website must be separate folders');
  const {version}=JSON.parse(await readFile(resolve(source,'version.json'),'utf8'));
  if (!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version)) throw new Error('Invalid release version');
  await readFile(resolve(source,'index.html'));
  await mkdir(destination,{recursive:true});
  const retained=new Set(['.git','.nojekyll','CNAME','releases','pr-preview','pr-screenshots']);
  const entries=await readdir(source);
  if(entries.some(name=>retained.has(name))) throw new Error('Build contains reserved website paths');
  for(const name of await readdir(destination)) {
    if(!retained.has(name)) await rm(resolve(destination,name),{recursive:true,force:true});
  }
  for(const name of entries) await cp(resolve(source,name),resolve(destination,name),{recursive:true});
  const releases=resolve(destination,'releases');
  const info=await lstat(releases).catch(error=>{if(error.code!=='ENOENT')throw error;});
  if(info?.isSymbolicLink()) throw new Error('Release directory must not be a link');
  await mkdir(releases,{recursive:true});
  const release=resolve(releases,version);
  const existing=await lstat(release).catch(error=>{if(error.code!=='ENOENT')throw error;});
  // Previously published installs keep their original files, even after site changes.
  if(!existing) await cp(source,release,{recursive:true});
  await writeFile(resolve(destination,'.nojekyll'),'');
  return version;
}

if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  if(process.argv.length!==4) throw new Error('Usage: node scripts/sync-website.mjs BUILD WEBSITE');
  console.log(`Website updated to ${await syncWebsite(process.argv[2],process.argv[3])}`);
}
