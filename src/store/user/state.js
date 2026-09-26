export default {
  //
  favouriteGroups: [],
  account: false,
  resourceWarningLevels:{
    ram: 90,
    cpu: 80,
    net: 10
  },
  selectedBlockExplorer: {
    ...(process.env.LOCAL_CHAIN ? { local: { base: '/__local/explorer.html?', trx: 'transaction=', account: 'account=' } } : {}),
    proton:{
      base: 'https://protonscan.io/',
      trx: 'transaction/',
      account: 'account/'
    },
    protonTest:{
      base: 'https://testnet.protonscan.io/',
      trx: 'transaction/',
      account: 'account/'
    }
  },

  minifyGuardians: false,
  isDark: false,
  isMember: false,
  hubDeposits: false,
  miniState: false,

  currentFCMToken:'',
  topicSubscriptions:[]
}
