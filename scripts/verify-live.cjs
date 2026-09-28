// Compare the existing ICP deployment with the locally verified production build.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { verifyProduction } = require('./verify-production.cjs');
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist/spa');
const origin = 'https://5hce3-liaaa-aaaao-qqfba-cai.icp0.io';
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
async function main() {
  const [stateHash, output] = process.argv.slice(2);
  assert(/^[a-f0-9]{64}$/.test(stateHash || ''), 'Supply the state hash reported by ICP deploy');
  assert(output, 'Supply the evidence output file');
  const manifestBytes = fs.readFileSync(path.join(dist, 'production-manifest.json'));
  const manifest = JSON.parse(manifestBytes);
  assert.deepEqual(verifyProduction(dist).files, manifest.files, 'Build differs from production manifest');
  const expected = { ...manifest.files, 'production-manifest.json': sha(manifestBytes) };
  const queue = Object.entries(expected).filter(([file]) => !['_headers', '_redirects'].includes(file));
  const results = [];
  async function check(file, digest) {
    const response = await fetch(origin + '/' + file, { signal: AbortSignal.timeout(30000), headers: { 'cache-control': 'no-cache' } });
    assert.equal(response.status, 200, file);
    const actual = sha(Buffer.from(await response.arrayBuffer()));
    assert.equal(actual, digest, file + ' differs from local build');
    assert(response.headers.get('ic-certificate'), file + ' missing IC certification header');
    return { file, sha256: actual, status: response.status, certificationHeader: true };
  }
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (queue.length) { const [file, digest] = queue.shift(); results.push(await check(file, digest)); }
  }));
  const routes = [];
  for (const route of ['', 'browse', 'create', 'manage/freedaocore/proposals', 'manage/freedaocore/modules', 'manage/freedaocore/member-governance', 'login?redirect=/manage/freedaocore/proposals']) {
    routes.push(await check(route, manifest.files['index.html']));
  }
  const evidence = { checkedAt: new Date().toISOString(), url: origin, stateHash, stateHashSource: 'ICP deploy output', build: manifest.builtAt, network: manifest.network, authentication: manifest.authentication, manifestSha256: sha(manifestBytes), assets: results.sort((a, b) => a.file.localeCompare(b.file)), routes, note: 'HTTP byte hashes and certification header presence checked; IC gateway handles certification validation. No wallet signatures submitted by this check.' };
  fs.writeFileSync(path.resolve(output), JSON.stringify(evidence, null, 2) + '\n');
  console.log(`Verified ${results.length} assets and ${routes.length} deep links; production exclusion gate passed.`);
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
