// Read-only readiness checks; never signs or submits a transaction.
const config = require('../src/statics/config/app.config.json').proton;
const endpoints = ['https://proton.eosusa.io', 'https://api.protonnz.com'];
const chainId = '384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0';
async function request(url, body) {
  const response = await fetch(url, {
    ...(body ? { method: 'POST', body: JSON.stringify(body) } : {}),
    headers: { 'Content-Type': 'application/json', Origin: 'http://127.0.0.1:8080' },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  if (!response.headers.get('access-control-allow-origin')) throw new Error(`${url}: missing browser CORS header`);
  return response.json();
}
(async () => {
  for (const endpoint of endpoints) {
    const info = await request(endpoint + '/v1/chain/get_info', {});
    if (info.chain_id !== chainId) throw new Error(`${endpoint}: wrong chain`);
    const age = Date.now() - Date.parse(info.head_block_time + 'Z');
    if (age > 60000 || age < -60000) throw new Error(`${endpoint}: chain head is not current`);
    console.log(`PASS ${endpoint}: XPR mainnet, current head, browser access enabled`);
  }
  const rpc = (method, data) => request(endpoints[0] + '/v1/chain/' + method, data);
  const registry = await rpc('get_table_rows', { json: true, code: config.groups_contract, scope: config.groups_contract, table: 'groups', limit: 100 });
  console.log(`PASS ${config.groups_contract}: ${registry.rows.length} DAOs readable`);
  const abi = await rpc('get_abi', { account_name: config.groups_contract });
  if (!abi.abi?.actions?.length) throw new Error('Hub ABI is unavailable');
  const assets = await request(config.nft.api + '/atomicassets/v1/assets?owner=freedaocore&limit=1');
  if (!assets.success || !Array.isArray(assets.data)) throw new Error('NFT API returned an unexpected response');
  console.log(`PASS ${config.nft.api}: NFT API available`);
})().catch(error => { console.error(error.message); process.exitCode = 1; });
