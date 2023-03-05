export function clear(state) {
  state.session = null;
  state.accountName = "";
  state.permission = "";
}
export function setActiveNetwork(state, payload) {
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