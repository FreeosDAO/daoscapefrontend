const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { verifyProduction } = require('./verify-production.cjs');

test('release gate rejects test signing, key material and source maps', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'daoscape-release-'));
  const main = 'daoscapehub 384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0 webauth.com';
  try {
    fs.writeFileSync(path.join(dir, 'index.html'), '<html></html>');
    fs.writeFileSync(path.join(dir, 'app.js'), main);
    assert.equal(verifyProduction(dir).network, 'XPR mainnet');
    for (const unsafe of ['connectLocal()', 'http://127.0.0.1:8888', 'Alice, Bob, or Carol', 'PVT_K1_' + 'a'.repeat(50)]) {
      fs.writeFileSync(path.join(dir, 'app.js'), main + '\n' + unsafe);
      assert.throws(() => verifyProduction(dir), /Local signing code/);
    }
    fs.writeFileSync(path.join(dir, 'app.js'), main);
    fs.writeFileSync(path.join(dir, 'app.js.map'), '{}');
    assert.throws(() => verifyProduction(dir), /Development file/);
    fs.unlinkSync(path.join(dir, 'app.js.map'));
    fs.writeFileSync(path.join(dir, 'app.js'), 'webauth.com');
    assert.throws(() => verifyProduction(dir), /Missing production configuration/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
