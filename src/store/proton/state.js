let protonStorage;
try { protonStorage = JSON.parse(window.localStorage.getItem(process.env.LOCAL_CHAIN ? 'proton-local-' + process.env.LOCAL_CHAIN_ID : 'daoscape-xpr-v1')); } catch { protonStorage = null; }
let sessionStorage = protonStorage?.proton?.session || null
let accountNameStorage = protonStorage?.proton?.accountName || null
let activeNetworkStorage = process.env.LOCAL_CHAIN ? 'local' : process.env.PROD ? 'proton' : (['proton', 'protonTest'].includes(protonStorage?.proton?.activeNetwork) ? protonStorage.proton.activeNetwork : 'proton')

export default {
  accountName: accountNameStorage,
  permission: "",
  accountData: undefined,
  showLoginModal: false,
  isTransacting: false,
  signingOverlay: {
    show: false,
    status: "", //0=wait for sig, 1=success, 2=error
    msg: "",
  },
  session: sessionStorage,
  link: null,

  activeNetwork: activeNetworkStorage,

  networks: {
    ...(process.env.LOCAL_CHAIN ? { local: { config: {
      chainId: process.env.LOCAL_CHAIN_ID,
      rpcEndpoints: [{ protocol: 'http', host: '127.0.0.1', port: '8888' }]
    } } } : {}),
    protonTest: {
      config: {
        chainId:
          "71ee83bcf52142d61019d95f9cc5427ba6a0d7ff8accd9e2088ae2abeaf3d3dd",
        rpcEndpoints: [
          {
            protocol: "https",
            host: "test.proton.eosusa.io",
            port: "443",
          },
          {
            protocol: "https",
            host: "tn1.protonnz.com",
            port: "443",
          },
          {
            protocol: "https",
            host: "protontestnet.greymass.com",
            port: "443"
          }
        ],
      },
    },
    proton: {
      config: {
        chainId:
          "384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0",
        rpcEndpoints: [
          {
            protocol: "https",
            host: "proton.eosusa.io",
            port: "443",
          },
          {
            protocol: "https",
            host: "api.protonnz.com",
            port: "443",
          },
        ],
      },
    },
  },
};
