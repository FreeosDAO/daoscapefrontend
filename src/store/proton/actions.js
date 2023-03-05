import * as Proton from "../../utils/proton-sdk";
import { notifyError, notifySuccess } from "src/imports/notifications";
import { serializeActionData } from "src/imports/helpers";

export async function login({ state, commit, getters, rootGetters }) {
  commit("clear");

  let session = await Proton.login(
    getters.getRpcEndpoints,
    getters.chainId,
    rootGetters["app/getAppConfig"].groups_contract
  );

  if (session) {
    if (session.auth) {
      commit("setSession", session);
      commit("setAccountName", state.session.auth.actor.toString());
      commit("setPermission", state.session.auth.permission.toString());

      console.warn("session", session);
      notifySuccess({message: state.accountName + ' successfully logged in.'})
    }
  }
}

export async function reconnect({ state, commit, getters, rootGetters }) {
  commit("clear");

  let session = await Proton.reconnect(
    getters.getRpcEndpoints,
    getters.chainId,
    rootGetters["app/getAppConfig"].groups_contract
  );

  if (session && session.auth) {
    commit("setSession", session);
    commit("setAccountName", state.session.auth.actor.toString());
    commit("setPermission", state.session.auth.permission.toString());

    console.warn("session", session);
    notifySuccess({message: 'Welcome back ' + state.accountName + '!'})
  }
}

export async function logout({ state, commit, rootGetters }) {
  console.log("logging out");
  await Proton.logout(
    rootGetters["app/getAppConfig"].groups_contract,
    rootGetters["proton/getChainId"]
  );
  commit("clear");
  notifySuccess({message: 'Successfully logged out. See you again soon!'})
}

export async function transact({ state, dispatch, commit }, payload) {

  //check if logged in before transacting
  if (!state.session || !state.accountName) {
    dispatch("login");
    return;
  }
  // setIsTransacting
  commit("setIsTransacting", true);


  // add authorization to actions if not supplied
  let accountname = state.accountName
  let permission = state.permission || 'active';

  payload.actions.forEach((a) => {
    if (!a.authorization) {
      a.authorization = [{ actor: accountname, permission: permission }];
    }
  });
  console.log(JSON.stringify(payload.actions, null, 2));

  //sign
  try {
    console.log("trying to push trx");

    let res = await Proton.session.transact(
      { actions: payload.actions },
      { broadcast: true }
    );

    commit("setIsTransacting", false);
    console.log("receipt", res);

    let receipt = {
      'block_time': res.processed.block_time,
      'trxid': res.processed.id,
      'block_num': res.processed.block_num
    };
    return receipt;
  } 
  
  catch (e) {

    commit("setIsTransacting", false);
    const message = await dispatch("parseError", e)
    if(!message.includes('assertion failure')) notifyError({ message })
    return e.cause;
  }
}

export async function parseError({ }, error) {
  console.warn('error here', error)
  let cause = ""
  let error_code = "";
  if (error.cause) {
    cause =
      error.cause.reason ||
      error.cause.message ||
      "Report this error to enhance the UX";
    error_code = error.cause.code || error.cause.errorCode || "";
  } else{
    cause = error
  }
  return `${cause} ${error_code}`;
}

export async function proposeSystemMsig(
  { state, rootState, commit, dispatch, getters, rootGetters },
  payload
) {

  console.log(payload.actions);

  //proposalname
  let proposal_name = payload.proposal_name;

  //expiration
  let exp = new Date();
  exp.setDate(exp.getDate() + 30);
  let [expiration] = exp.toISOString().split(".");

  //requested
  let requested = payload.requested;

  //msig trx template
  let msigTrx_template = {
    expiration: payload.expiration || expiration,
    ref_block_num: 0,
    ref_block_prefix: 0,
    max_net_usage_words: 0,
    max_cpu_usage_ms: 0,
    delay_sec: payload.delay_sec || 0,
    actions: [],
    context_free_actions: [],
    transaction_extensions: [],
    signatures: [],
    context_free_data: []
  };

  //serialize action data and add to template
  for (let i = 0; i < payload.actions.length; i++) {
    let action = payload.actions[i];
    let hexdata = await serializeActionData(action, payload.vm);
    action.data = hexdata;
    msigTrx_template.actions.push(action);
  }

  //do the transaction
  let propose = {
    account: "eosio.msig",
    name: "propose",
    data: {
      proposer: state.accountName,
      proposal_name: proposal_name,
      requested: requested,
      trx: msigTrx_template
    }
  };

  if (payload.return_action) {
    return propose;
  }

  let msig_actions = [propose];

  let res = await dispatch("transact", { actions: msig_actions });
  if (res) {
    res.proposal_name = proposal_name;
  }
  return res;
}