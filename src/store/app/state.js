// import { app } from "firebase"

//import app_config from "../../statics/config/app.config.js"
const conf = require("../../statics/config/app.config.json");
if (process.env.LOCAL_CHAIN) {
  conf.local = {
    ...conf.proton,
    core_contract: { ...conf.proton.core_contract, raw: '/__local-contracts/' },
    api: { url: 'http://127.0.0.1:8888' },
    nft: { api: 'http://127.0.0.1:8888', url: 'http://127.0.0.1:8888' }
  };
}

export default {
  CLOCK: 0,
  config: conf,
  groups: false,
  componentRegistry: {},
  moduleRegistry: {},
  ramPricePerByte: 0
}
