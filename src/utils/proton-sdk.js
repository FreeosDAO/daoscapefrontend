import ProtonWebSDK from '@proton/web-sdk';
// import { JsonRpc } from '@proton/js';

export let link;
export let session;

// const REQUEST_ACCOUNT = 'fdachub'
// const CHAIN_ID = (process.env.DEV) ? '71ee83bcf52142d61019d95f9cc5427ba6a0d7ff8accd9e2088ae2abeaf3d3dd' : '384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0';

// const ENDPOINTS = ['https://proton.greymass.com']
// const rpc = new JsonRpc(ENDPOINTS)

export const createLink = async (ENDPOINTS, CHAIN_ID, REQUEST_ACCOUNT, restoreSession = false) => {
  const { link: localLink, session: localSession } = await ProtonWebSDK({
    linkOptions: {
      endpoints: ENDPOINTS,
      chainId: CHAIN_ID,
      restoreSession,
    },
    transportOptions: {
      requestAccount: REQUEST_ACCOUNT
    },
    selectorOptions: {
      appName: 'The DAOScape',
    },
  });
  link = localLink;
  session = localSession;
};

export const login = async (ENDPOINTS, CHAIN_ID, REQUEST_ACCOUNT) => {
  await createLink(ENDPOINTS, CHAIN_ID, REQUEST_ACCOUNT);
  if (session) {
    return session;
  }
};

export const transact = async (
  actions,
  broadcast
) => {
  if (session) {
    return session.transact(
      {
        transaction: {
          actions,
        },
      },
      { broadcast }
    );
  } else {
    throw new Error('No Session');
  }
};

export const logout = async (REQUEST_ACCOUNT, CHAIN_ID) => {
  if (link && session) {
    await link.removeSession(REQUEST_ACCOUNT, session.auth, CHAIN_ID);
  }
  session = undefined;
  link = undefined;
};

export const reconnect = async (ENDPOINTS, CHAIN_ID, REQUEST_ACCOUNT) => {
  if (!session) {
    await createLink(ENDPOINTS, CHAIN_ID, REQUEST_ACCOUNT, true);
  }

  if (session) {
    return session;
  }
};

export const transfer = async ({ to, amount }) => {
  if (!session) {
    throw new Error('No Session');
  }

  return await session.transact({
    actions: [{
      /**
       * The token contract, precision and symbol for tokens can be seen at protonscan.io/tokens
       */

      // Token contract
      account: "eosio.token",

      // Action name
      name: "transfer",
      
      // Action parameters
      data: {
        // Sender
        from: session.auth.actor,

        // Receiver
        to: to,

        // 4 is precision, XPR is symbol
        quantity: `${(+amount).toFixed(4)} XPR`,

        // Optional memo
        memo: ""
      },
      authorization: [session.auth]
    }]
  }, {
    broadcast: true
  })
}

export async function getProtonAvatar (account) {
  try {
    const result = await rpc.get_table_rows({
      code: 'eosio.proton',
      scope: 'eosio.proton',
      table: 'usersinfo',
      key_type: 'i64',
      lower_bound: account,
      index_position: 1,
      limit: 1
    })

    if (result.rows.length > 0 && result.rows[0].acc === account) {
      return result.rows[0]
    }
  } catch (e) {
    console.error('getProtonAvatar error', e)
  }

  return undefined
}

export default {
  login,
  transact,
  logout,
  reconnect,
  transfer
};