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
  console.warn("active network", network);
  return network;
}
export function getRpcEndpoints(state, getters) {
  let rpcobjs = state.networks[getters.getActiveNetwork].config.rpcEndpoints;
  return rpcobjs.map((rpcobj) => {
    return rpcobj.protocol + "://" + rpcobj.host;
  });
}
export function getChainId(state, getters) {
  return state.networks[getters.getActiveNetwork].config.chainId;
}
