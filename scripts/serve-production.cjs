const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { verifyProduction } = require('./verify-production.cjs');
const root = path.resolve(__dirname, '../dist/spa');
verifyProduction(root);
const port = Number(process.env.PORT || 8080);
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.wasm': 'application/wasm' };
http.createServer((req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
  let requested;
  try { requested = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); res.end(); return; }
  let file = path.resolve(root, '.' + requested);
  if (!file.startsWith(root + path.sep) && file !== root) { res.writeHead(403); res.end(); return; }
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    if (path.extname(requested)) { res.writeHead(404); res.end(); return; }
    file = path.join(root, 'index.html');
  }
  if (!fs.existsSync(file)) { res.writeHead(503, { 'Retry-After': '5' }); res.end('Build in progress. Please refresh shortly.'); return; }
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' });
  if (req.method === 'HEAD') { res.end(); return; }
  fs.createReadStream(file).on('error', () => res.destroy()).pipe(res);
}).listen(port, '127.0.0.1', () => console.log(`Verified production frontend: http://127.0.0.1:${port}/login\nConnected to live XPR mainnet. Wallet approval is required to sign in and transact.`));
