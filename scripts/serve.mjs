import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { withSiteVersion } from './site-version.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const portArg = process.argv.indexOf('--port');
const port = Number(portArg >= 0 ? process.argv[portArg + 1] : process.env.PORT || 4176);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.md': 'text/plain', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };

createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let path = resolve(root, '.' + pathname);
    if (path !== root && !path.startsWith(root + sep)) throw new Error('outside root');
    if (pathname.split('/').some(part => part.startsWith('.'))) throw new Error('hidden path');
    if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    let body = await readFile(path);
    if (['index.html','widget/install-snippet.js','widget/configurator.js'].some(file => path === resolve(root,file))) {
      const {version}=JSON.parse(await readFile(resolve(root,'package.json'),'utf8'));
      body=withSiteVersion(body.toString('utf8'),version);
    }
    res.writeHead(200, { 'Content-Type': (types[extname(path)] || 'application/octet-stream') + '; charset=utf-8', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin':'*' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`lilgotchi: http://localhost:${port}`));
