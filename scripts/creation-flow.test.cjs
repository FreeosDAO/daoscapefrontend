const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Exercise the actual component methods with a wallet/RPC double. No signatures
// or mainnet writes are performed by these regression tests.
function component(file) {
  const source = fs.readFileSync(path.join(__dirname, '../src/components', file), 'utf8').split('<script>')[1].split('</script>')[0];
  const script = source.replace(/import[\s\S]*?from\s+['"][^'"]+['"];?/g, '').replace('export default ', 'const component = ');
  return vm.runInNewContext(`${script}\ncomponent`, { defineComponent: x => x, mapGetters: () => ({}), wasmCompiler: {}, hubDepositWallet: {}, notifySuccess() {}, setTimeout() {}, console });
}
function fixture(file, overrides = {}) {
  const c = component(file);
  const instance = { ...c.data(), getAccountName: 'creator', getSession: { auth: { actor: 'creator' } }, getAppConfig: { groups_contract: 'daoscapehub', system_token: { contract: 'eosio.token', symbol: 'XPR', precision: 4 } }, getHubDeposits: [], getRamPricePerByte: 0.0022, ...overrides };
  for (const [key, method] of Object.entries(c.methods)) instance[key] = method.bind(instance);
  for (const [key, getter] of Object.entries(c.computed)) Object.defineProperty(instance, key, { get: () => getter.call(instance) });
  return instance;
}

test('name checks reject network failures and stale responses, and only accept unknown accounts', async () => {
  let reject;
  const f = fixture('new-group.vue', { new_group_account_name: 'newdao', $eos: { api: { rpc: { get_account: () => new Promise((_, fail) => { reject = fail; }) } } } });
  let pending = f.isavailableAccountNameWrapper('newdao');
  reject(new Error('Network unavailable'));
  assert.match(await pending, /Could not check/);
  assert.equal(f.account_name_validated, false);
  pending = f.isavailableAccountNameWrapper('newdao');
  f.new_group_account_name = 'different'; reject(new Error('unknown key'));
  assert.equal(await pending, false);
  assert.equal(f.account_name_validated, false);
  f.new_group_account_name = 'newdao'; pending = f.isavailableAccountNameWrapper('newdao'); reject(new Error('unknown key'));
  assert.equal(await pending, true);
  assert.equal(f.account_name_validated, true);
  assert.match(await f.isavailableAccountNameWrapper('UpperCase'), /lowercase/);
});

test('creation and activation rejection restore their step and clear pending state', async () => {
  const f = fixture('new-group.vue', { wasmhex: '00', abihex: '00', account_name_validated: true, step: 'create_account', getHubDeposits: [{ contract: 'eosio.token', symbol: 'XPR', quantity: '5000.0000 XPR' }], $store: { dispatch: async action => { if (action === 'proton/transact') throw new Error('Wallet rejected'); } } });
  await f.createGroup();
  assert.equal(f.step, 'create_account'); assert.equal(f.busy, false); assert.match(f.error, /not confirmed/);
  await f.activateGroup();
  assert.equal(f.step, 'request_activation'); assert.equal(f.busy, false); assert.match(f.error, /not confirmed/);
});

test('resource price change blocks account creation before wallet submission', async () => {
  let transactions = 0;
  const f = fixture('new-group.vue', { wasmhex: '00', abihex: '00', account_name_validated: true, getHubDeposits: [{ contract: 'eosio.token', symbol: 'XPR', quantity: '4300.0000 XPR' }], $store: { dispatch: async action => { if (action === 'proton/transact') transactions++; else f.getRamPricePerByte = 0.01; } } });
  await f.createGroup(); assert.equal(transactions, 0); assert.equal(f.busy, false); assert.match(f.error, /estimate changed/);
});

test('funding uses the configured token, blocks invalid amounts and handles thrown wallet errors', async () => {
  const calls = [];
  const f = fixture('hub-deposit-wallet.vue', { getHubDeposits: [{ contract: 'different', symbol: 'OTHER', quantity: '999.0000 OTHER' }], $store: { dispatch: async (action, payload) => { calls.push(payload); throw new Error('Rejected'); } } });
  for (const amount of ['', -1, 0, Infinity, 'NaN', 1.12345]) { f.input_value = amount; await f.deposit(); }
  assert.equal(calls.length, 0);
  f.input_value = '1.2500'; await f.deposit();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].actions[1].account, 'eosio.token');
  assert.equal(calls[0].actions[1].data.quantity, '1.2500 XPR');
  assert.equal(calls[0].actions[0].name, 'opendeposit');
  assert.equal(f.is_transfering, false); assert.match(f.error, /not confirmed/);
  await f.withdraw(); assert.equal(calls.length, 1);
});

test('non-receipt wallet results do not mark a deposit successful', async () => {
  const f = fixture('hub-deposit-wallet.vue', { input_value: '5', $store: { dispatch: async () => ({ message: 'rejected' }) } });
  await f.deposit(); assert.equal(f.input_value, '5'); assert.equal(f.is_transfering, false); assert.match(f.error, /not confirmed/);
});

test('unloaded deposit state is treated as zero without crashing the wizard or funding dialog', () => {
  const create = fixture('new-group.vue', { getHubDeposits: false });
  assert.equal(create.hubDeposits, '0 XPR'); assert.equal(create.has_enough_deposits, false);
  const wallet = fixture('hub-deposit-wallet.vue', { getHubDeposits: false });
  assert.equal(wallet.balance, 0);
});
