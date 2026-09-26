export function getShouldRenderLoginModal(state) {
  return state.showLoginModal;
}
export function getSigningOverlay(state) {
  return state.signingOverlay;
}
export function getIsTransacting(state) {
  return state.isTransacting;
}
export function getSession(state) {
  return state.session;
}
export function getAccountName(state) {
  return state.accountName;
}
export function getActiveNetwork(state) {
  let network = state.activeNetwork;
  return network;
}
export function getRpcEndpoints(state, getters) {
  let rpcobjs = state.networks[getters.getActiveNetwork].config.rpcEndpoints;
  return rpcobjs.map((rpcobj) => {
    const port = rpcobj.port && !((rpcobj.protocol === 'https' && rpcobj.port === '443') || (rpcobj.protocol === 'http' && rpcobj.port === '80')) ? ':' + rpcobj.port : '';
    return rpcobj.protocol + "://" + rpcobj.host + port;
  });
}
export function getChainId(state, getters) {
  return state.networks[getters.getActiveNetwork].config.chainId;
}
