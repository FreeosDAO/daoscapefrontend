export default {
  accountName: null,
  permission: "",
  accountData: undefined,
  showLoginModal: false,
  isTransacting: false,
  signingOverlay: {
    show: false,
    status: "", //0=wait for sig, 1=success, 2=error
    msg: "",
  },
  session: null,
  link: null,

  activeNetwork: "protonTest",

  networks: {
    protonTest: {
      config: {
        chainId:
          "71ee83bcf52142d61019d95f9cc5427ba6a0d7ff8accd9e2088ae2abeaf3d3dd",
        rpcEndpoints: [
          {
            protocol: "https",
            host: "protontestnet.greymass.com",
            port: "443"
          }/*,
          {
            protocol: "https",
            host: "test.proton.kiwi",
            port: "443",
          },
          {
            protocol: "https",
            host: "tn1.protonnz.com",
            port: "443",
          },*/
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
            host: "proton.greymass.com",
            port: "443",
          }/*,
          {
            protocol: "https",
            host: "main.proton.kiwi",
            port: "443",
          },
          {
            protocol: "https",
            host: "api.protonnz.com",
            port: "443",
          },*/
        ],
      },
    },
  },
};
