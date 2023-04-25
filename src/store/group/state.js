
export default {
  activeGroup:'',
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
    proton: (60 * 60 * 24 * 30) * 1000, // 30 days
    protonTest: (60 * 10 ) * 1000 // 10 minutes
  }
}
