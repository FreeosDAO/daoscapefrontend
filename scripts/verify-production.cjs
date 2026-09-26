const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function verifyProduction(directory) {
  const root = path.resolve(directory);
  if (!fs.existsSync(path.join(root, 'index.html'))) throw new Error('Build is missing index.html');
  const forbidden = [
    /connectLocal|logoutLocal|local-wallet-|LOCAL_DEV_KEY|__local-contracts|__local\/explorer/,
    /127\.0\.0\.1:8888|localhost:8888|Choose local account|Alice, Bob, or Carol/,
    /\bPVT_K1_[1-9A-HJ-NP-Za-km-z]{40,}\b|\b5[HJK][1-9A-HJ-NP-Za-km-z]{49}\b/,
  ];
  const localConfig = path.resolve(__dirname, '../.local-chain.json');
  const devKey = fs.existsSync(localConfig) ? JSON.parse(fs.readFileSync(localConfig)).privateKey : null;
  const hashes = {};
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Symlink in build: ${file}`);
      if (entry.isDirectory()) { walk(file); continue; }
      const relative = path.relative(root, file).split(path.sep).join('/');
      if (relative === 'production-manifest.json') continue;
      if (/\.map$|\.local-chain|local-wallet|\.pem$|\.env(?:\.|$)/i.test(relative)) throw new Error(`Development file in build: ${relative}`);
      const bytes = fs.readFileSync(file);
      if (/\.(?:js|css|html|json|txt)$/.test(relative)) {
        const contents = bytes.toString();
        if (forbidden.some(pattern => pattern.test(contents)) || (devKey && contents.includes(devKey))) {
          throw new Error(`Local signing code, test login, or private key in ${relative}`);
        }
      }
      hashes[relative] = crypto.createHash('sha256').update(bytes).digest('hex');
    }
  }
  walk(root);
  const javascript = Object.keys(hashes).filter(file => file.endsWith('.js')).map(file => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
  for (const required of ['daoscapehub', '384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0', 'webauth.com']) {
    if (!javascript.includes(required)) throw new Error(`Missing production configuration: ${required}`);
  }
  return { network: 'XPR mainnet', authentication: 'XPR wallets only', files: hashes };
}

module.exports = { verifyProduction };
if (require.main === module) {
  const manifest = verifyProduction(process.argv[2] || path.resolve(__dirname, '../dist/spa'));
  console.log(`Production check passed: ${Object.keys(manifest.files).length} files; XPR mainnet; no local wallet or private keys.`);
}
