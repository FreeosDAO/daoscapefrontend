
export default {
  activeGroup:'',
  grantPolicy: null,
  guardians:[],
  proposals:{
    active:false,
    executed:false,
    cancelled:false,
    expired:false
  },

  thresholds:[],
  thresholdLinks:[],
  groupWallet:[],
  groupAccount: false,
  activeGroupConfig: false,
  coreState: false,
  coreConfig: false,
  newCoreConfig: false, //!! used for detecting config changes
  modules: false,
  avatars: [],
  profiles: [],
  myOldProfile: false,
  latestUserterms: false,
  active_period: {
    local: (60 * 61) * 1000, // safely above the core’s one-hour proposal minimum
    proton: (60 * 60 * 24 * 30) * 1000, // 30 days
    protonTest: (60 * 61 ) * 1000 // 61 minutes
  }
}
