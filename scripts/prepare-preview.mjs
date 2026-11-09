import {readFile,writeFile,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const number=process.argv[2];
if(!/^[1-9]\d*$/.test(number||''))throw new Error('Provide a pull request number');
const output=new URL('../dist/',import.meta.url);
const landing=new URL('index.html',output);
const html=await readFile(landing,'utf8');
if(!html.includes('storage-key="demo"'))throw new Error('Expected the landing page demo storage key');
await writeFile(landing,html.replace('storage-key="demo"',`storage-key="preview-pr-${number}"`));
// Sample pages use fixed test saves. Keep them out of the public preview.
await rm(fileURLToPath(new URL('examples/',output)),{recursive:true,force:true});
console.log(`Prepared isolated preview for PR ${number}`);
