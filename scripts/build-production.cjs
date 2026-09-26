const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { verifyProduction } = require('./verify-production.cjs');

if (Number(process.versions.node.split('.')[0]) !== 22) throw new Error('Use Node 22 for reproducible production builds.');
const root = path.resolve(__dirname, '..');
const tests = ['verify-production.test.cjs', 'wallet-popup.test.cjs', 'governance.test.cjs'].map(file => path.join(__dirname, file));
const preflight = spawnSync(process.execPath, ['--test', ...tests], { cwd: root, stdio: 'inherit' });
if (preflight.error || preflight.status !== 0) process.exit(preflight.status || 1);
const mode = process.argv.includes('--pwa') ? 'pwa' : 'spa';
const destination = path.join(root, 'dist', mode);
// Never read the development key into the production compiler's environment.
const env = { ...process.env, NODE_ENV: 'production', DAOSCAPE_LOCAL: '0' };
for (const key of ['LOCAL_CHAIN', 'LOCAL_CHAIN_ID', 'LOCAL_DEV_KEY']) delete env[key];
fs.rmSync(destination, { recursive: true, force: true });
const result = spawnSync(process.execPath, [path.join(root, 'node_modules/@quasar/app/bin/quasar'), 'build', '-m', mode], { cwd: root, env, stdio: 'inherit' });
if (result.error || result.status !== 0) {
  fs.rmSync(destination, { recursive: true, force: true });
  process.exit(result.status || 1);
}
try {
  fs.copyFileSync(path.join(root, '_redirects'), path.join(destination, '_redirects'));
  fs.copyFileSync(path.join(root, '_headers'), path.join(destination, '_headers'));
  const manifest = verifyProduction(destination);
  fs.writeFileSync(path.join(destination, 'production-manifest.json'), JSON.stringify({ builtAt: new Date().toISOString(), ...manifest }, null, 2) + '\n');
  console.log(`Verified production build: ${destination}\nXPR mainnet; wallet authentication only.`);
} catch (error) {
  // A rejected artifact must not remain available for accidental publishing.
  fs.rmSync(destination, { recursive: true, force: true });
  throw error;
}
