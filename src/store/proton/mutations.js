export function clear(state) {
  state.session = null;
  state.accountName = "";
  state.permission = "";
}
export function setActiveNetwork(state, payload) {
  if (process.env.LOCAL_CHAIN && payload !== 'local') throw new Error('Local development is isolated from public networks.');
  if (!process.env.LOCAL_CHAIN && !['proton', 'protonTest'].includes(payload)) throw new Error('Unknown network.');
  if (process.env.PROD && payload !== 'proton') throw new Error('This deployment connects to XPR mainnet.');
  state.activeNetwork = payload;
}
export function setSession(state, payload){
    state.session = payload
}
export function setAccountName(state, payload){
    state.accountName = payload
}
export function setPermission(state, payload){
    state.permission = payload
}
export function setIsTransacting(state, payload){
  state.isTransacting = payload
}
