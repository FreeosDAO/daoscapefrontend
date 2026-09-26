import { Api, JsonRpc, JsSignatureProvider } from '@proton/js';
import { Dialog } from 'quasar';

const accounts = ['alice', 'bob', 'carol'];
const storageKey = 'local-wallet-' + process.env.LOCAL_CHAIN_ID;

export async function connectLocal(restore) {
  if (!process.env.DEV || !process.env.LOCAL_CHAIN) throw new Error('Local signing is development-only.');
  let actor = restore ? window.localStorage.getItem(storageKey) : null;
  if (!accounts.includes(actor)) {
    if (restore) return undefined;
    actor = await new Promise(resolve => {
      Dialog.create({
        title: 'Choose your account',
        message: 'These test accounts sign transactions only on your private local chain.',
        options: { type: 'radio', model: 'alice', items: accounts.map(value => ({ label: value, value })) },
        cancel: { label: 'Cancel', flat: true, color: 'primary' },
        ok: { label: 'Continue', unelevated: true, color: 'primary' },
        persistent: true
      }).onOk(resolve).onCancel(() => resolve(null));
    });
  }
  if (!actor) return undefined;
  const rpc = new JsonRpc(['http://127.0.0.1:8888']);
  rpc.get_block_info = blockNum => rpc.get_block(blockNum);
  const checkChain = async () => {
    const info = await rpc.get_info();
    if (!process.env.LOCAL_CHAIN_ID || info.chain_id !== process.env.LOCAL_CHAIN_ID) throw new Error('Local chain identity mismatch. Restart after bootstrapping.');
  };
  await checkChain();
  const api = new Api({ rpc, signatureProvider: new JsSignatureProvider([process.env.LOCAL_DEV_KEY]), textEncoder: new TextEncoder(), textDecoder: new TextDecoder() });
  window.localStorage.setItem(storageKey, actor);
  return {
    auth: { actor, permission: 'active' },
    async transact(payload, options = {}) {
      await checkChain();
      return api.transact(payload.transaction || payload, { blocksBehind: 1, expireSeconds: 60, broadcast: options.broadcast !== false });
    }
  };
}

export async function logoutLocal() {
  window.localStorage.removeItem(storageKey);
}
