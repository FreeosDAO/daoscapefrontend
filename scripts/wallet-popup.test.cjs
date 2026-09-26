const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Exercise the installed SDK's patched popup adapter without a real wallet,
// credentials, network calls, or signed transactions.
function fixture() {
  const source = fs.readFileSync(path.resolve(__dirname, '../node_modules/@proton/web-sdk/lib/proton-web-sdk.m.js'), 'utf8');
  const adapter = source.slice(source.indexOf('function __awaiter'), source.indexOf('class Storage'));
  let opened;
  const window = { addEventListener() {}, open() { opened = { closed: false, close() { this.closed = true; } }; return opened; } };
  const Link = vm.runInNewContext(adapter + '\nProtonWebLink', { window, URL, setInterval() {}, console: { error() {} }, JsonRpc: class {}, JsonRpcPulseVM: class {} });
  return { window, create: () => new Link({ chainId: 'mainnet', scheme: 'proton', storage: { write() {} }, client: {} }) };
}

test('closing a browser wallet rejects login and allows a separate retry', async () => {
  const f = fixture();
  const first = f.create();
  const result = first.login();
  first.childWindow.closed = true;
  first.closeChild();
  await assert.rejects(result, /window closed/);
  const second = f.create();
  const retry = second.login();
  assert.ok(second.childWindow);
  assert.equal(first.childWindow, null);
  second.childWindow.closed = true;
  second.closeChild();
  await assert.rejects(retry, /window closed/);
});

test('blocked popups reject promptly', async () => {
  const f = fixture();
  f.window.open = () => null;
  await assert.rejects(f.create().login(), /Allow pop-ups/);
});

test('wallet messages require the exact origin and the opened popup', async () => {
  const f = fixture();
  const link = f.create();
  const pending = link.login();
  const child = link.childWindow;
  const data = JSON.stringify({ type: 'loginSuccess', data: { actor: 'test', permission: 'active' } });
  for (const origin of ['https://webauth.com.example.org', 'https://testnet.webauth.com', 'http://127.0.0.1:8080']) {
    await link.onEvent({ origin, source: child, data });
    assert.ok(link.deferredLogin);
  }
  await link.onEvent({ origin: 'https://webauth.com', source: {}, data });
  assert.ok(link.deferredLogin);
  await link.onEvent({ origin: 'https://webauth.com', source: child, data });
  assert.equal((await pending).session.auth.actor, 'test');
});
