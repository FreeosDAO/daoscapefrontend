<template>
  <div class="row justify-center">
    <div class="create-group-width">
      <p class="text-h4 q-mt-lg">Create Your DAO</p>
      <!--STEP COUNTER-->
      <div class="q-mb-md text-grey-5 text-h6 text-weight-light">
        <div v-if="step === 'intro'" class="row justify-between">
          <div>CREATING A DAO</div>
        </div>
        <div v-if="step === 'request_account_name'" class="row justify-between">
          <div>CHOOSE YOUR GROUP NAME</div>
          <div>1/{{ number_of_steps }}</div>
        </div>
        <div v-if="step === 'create_account'" class="row justify-between">
          <div>CREATE ACCOUNT</div>
          <div>2/{{ number_of_steps }}</div>
        </div>
        <div v-if="step === 'request_activation'" class="row justify-between">
          <div>ACTIVATE DAO</div>
          <div>3/{{ number_of_steps }}</div>
        </div>
        <div
          v-else-if="step === 'request_signature'"
          class="row justify-between"
        >
          <div>CREATING</div>
          <div class="text-uppercase text-primary">
            {{ new_group_account_name }}
          </div>
        </div>
      </div>

      <q-carousel
        v-model="step"
        keep-alive
        :navigation="false"
        transition-prev="scale"
        transition-next="scale"
        :swipeable="false"
        animated
        control-color="primary"
        :padding="false"
        :arrows="false"
        height="auto"
        class="bg-transparent"
      >
      <q-carousel-slide name="intro" class="no-padding">
        <div>
          <p class="text-subtitle1">Things you'll need to get started:</p>
          <ul>
            <li><b>DAO Account Name:</b> Choose your DAO account name, based on the normal Proton name restrictions (a-z, 1-5, min 4 characters, max 12 characters). Once the DAO has been setup, the account name cannot be changed.</li>
            <li><b>XPR Ready:</b> As part of the setup, you'll need to send {{ getResourceEstimation }} to The DAOScape hub account, so be sure to have that ready to go!</li>
          </ul>
          <div v-if="!isValidWallet" class="text-white text-center bg-secondary q-pa-md rounded-borders">
            <p class="text-h6 text-center">Please login with Anchor</p>
            <p class="text-center">In order to create a DAO, you must login in Anchor and ensure that <br><b>"Create a session for future use with this app"</b><br> is selected. </p>
            <login-network-switcher />
          </div>
          <div v-else class="row justify-center">
            <q-btn
              color="primary"
              label="Get Started"
              @click="step = 'request_account_name'"
            />
          </div>
        </div>
        
      </q-carousel-slide>
        <!--CHOOSE GROUP NAME-->
        <q-carousel-slide :name="`request_account_name`" class="no-padding">
          <div>
            <div class="rounded-borders overflow-hidden">
              <q-input
                :dark="false"
                ref="accountinput"
                autocomplete="off"
                outlined
                no-error-icon
                counter
                maxlength="12"
                color="accent"
                bg-color="white"
                v-model="new_group_account_name"
                placeholder="Choose new group name"
                :rules="[
                  (val) => !!val || '* Required',
                  isValidAccountName,
                  (val) => val.length >= 4 || 'Group name must be min 4 chars.',
                  isavailableAccountNameWrapper,
                ]"
                @input="account_name_validated = false"
              >
                <template v-slot:prepend>
                  <q-icon name="people" />
                </template>
                <template v-slot:append>
                  <q-icon
                    v-if="account_name_validated"
                    name="check"
                    color="positive"
                  />
                </template>
                <template v-slot:hint>
                  <span class="text-grey-8 row" v-if="account_name_validated">
                    <span>Account name available!</span>
                  </span>
                  <span v-else>12 char account name</span>
                </template>
              </q-input>
              <p class="q-mt-md text-grey-6">
                <em>Please note: the group name cannot be changed once it has been created.</em>
              </p>
            </div>

            <div class="column justify-center items-center q-mt-lg">
              <q-btn
                color="primary"
                label="next"
                style="width: 150px"
                :disabled="!account_name_validated"
                @click="next('')"
              />

              <div v-if="groups_by_creator.length" class="q-mt-sm">
                <transition-group
                  appear
                  enter-active-class="animated zoomIn"
                  leave-active-class="animated zoomOut"
                  mode="out-in"
                  class="column q-gutter-sm"
                  tag="div"
                >
                  <q-btn
                    icon="mdi-alert"
                    :label="group.groupname"
                    v-for="group in groups_by_creator.filter(
                      (gbc) => gbc.state === 0
                    )"
                    :key="group.groupname"
                    color="secondary"
                    @click="next(group.groupname)"
                  >
                    <q-tooltip class="bg-secondary" :delay="500">
                      This group isn't activated yet. Proceed to activation by
                      clicking the button.
                    </q-tooltip>
                  </q-btn>
                </transition-group>
              </div>
            </div>
          </div>
        </q-carousel-slide>

        <!--CREATE ACCOUNT-->
        <q-carousel-slide name="create_account" class="no-padding">
          <div class="row justify-begin items-center text-black">
            <span class="text-uppercase">{{ new_group_account_name }}</span>
            <q-btn
              icon="edit"
              round
              flat
              size="sm"
              @click="step = 'request_account_name'"
            >
              <q-tooltip
                :delay="300"
                anchor="center right"
                self="center left"
                :offset="[10, 0]"
              >
                Edit Group Name.
              </q-tooltip>
            </q-btn>
          </div>

          <p class="text-subtitle1 q-mb-md">
            The estimated cost to create your DAO account is {{ getResourceEstimation }}.
          </p>

          <div v-if="!has_enough_deposits">
            <p class="text-grey-6">
              You don't have enough {{ getAppConfig.system_token.symbol }} deposits to start your DAO. Please make a deposit below.
      You need a minimum of {{ getResourceEstimation }} to deploy the core contract. Excess deposits will be used to buy extra RAM.
            </p>
            <hub-deposit-wallet :default_input_value="getRamPricePerByte * required_bytes" />
          </div>

          <div v-if="has_enough_deposits" class="column justify-center items-center q-mt-md">
            <p class="text-grey-6">
              Good news! You have enough deposits in The DAOScape Hub to create an account.<br>
              Clicking the below button will use all your current deposits to create a new DAO account. Excess deposits will be used to buy extra RAM.
            </p>
            <q-btn
              color="primary"
              label="Create Account"
              :disabled="!account_name_validated"
              @click="createGroup"
            />
          </div>
        </q-carousel-slide>

        <!--ACTIVATION-->
        <q-carousel-slide :name="`request_activation`" class="no-padding">
          <div class="column items-center full-height">
            <p class="text-subtitle1 text-center q-mt-sm">Your DAO account <b>{{ this.new_group_account_name }}</b> has been created.<br>The final step is to activate it!</p>
            <q-btn
              color="primary"
              label="activate"
              style="width: 150px"
              @click="activateGroup"
            />
          </div>
        </q-carousel-slide>

        <!--WAITING-->
        <q-carousel-slide :name="`request_signature`" class="no-padding">
          <div class="column items-center full-height text-grey-6 q-pt-md">
            <q-spinner
              color="primary"
              size="40px"
              @click="step = 'request_account_name'"
              class="cursor-pointer"
            />
            <div class="q-mt-md">Waiting for Signature</div>
          </div>
        </q-carousel-slide>

        <!--SUCCESS!-->
        <q-carousel-slide :name="`group_created`" class="no-padding">
          <div class="column items-center full-height q-pt-md">
            <q-icon name="mdi-check-circle-outline" color="primary" size="52px" />
            <div class="q-mt-sm text-subtitle1">Group successfully activated</div>
            <q-btn
              label="visit group"
              color="primary"
              class="q-mt-md"
              :to="`/manage/${new_group_account_name}`"
            />
          </div>
        </q-carousel-slide>
      </q-carousel>
    </div>
    <wasmCompiler ref="wasm_compiler" />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { defineComponent } from "vue";

import wasmCompiler from "components/wasm-compiler";
import loginNetworkSwitcher from 'src/components/login/login-network-switcher';
import hubDepositWallet from "./hub-deposit-wallet";

import {
  isValidAccountName,
  isAvailableAccountName,
} from "../imports/validators";
import { notifySuccess } from "src/imports/notifications";

export default defineComponent({
  name: "newGroup",
  components: {
    wasmCompiler,
    loginNetworkSwitcher,
    hubDepositWallet
  },
  props: {
    prefill: {
      type: Object,
      default: () => {
        return {
          group_account_name: "",
        };
      },
    },
  },
  data() {
    return {
      number_of_steps: 3,
      step: "intro", //intro, request_account_name, create_account, request_signature, group_created
      new_group_account_name: "",
      account_name_validated: false,
      voice_only: false,
      wasmhex: "",
      abihex: "",
      groups_by_creator: [],
      required_bytes: 1600000 * 1.2,
    };
  },
  computed: {
    ...mapGetters({
      getAccountName: "proton/getAccountName",
      getAppConfig: "app/getAppConfig",
      getHubDeposits: "user/getHubDeposits",
      getRamPricePerByte: "app/getRamPricePerByte",
      getSession: "proton/getSession"
    }),
    getResourceEstimation() {
      if (this.getRamPricePerByte) {
        return (
          `${(this.getRamPricePerByte * this.required_bytes).toFixed(4)} ${this.getAppConfig.system_token.symbol}`
        );
      }
    },
    has_enough_deposits() {
      let res = false;
      if (this.getResourceEstimation && this.getHubDeposits.length) {
        let eos_deposit = this.getHubDeposits.find(
          (d) => d.symbol == this.getAppConfig.system_token.symbol
        ).quantity;
        if (eos_deposit) {
          return (
            parseFloat(this.getResourceEstimation) <= parseFloat(eos_deposit)
          );
        }
      }
      return res;
    },
    hubDeposits(){
      return this.getHubDeposits.length ?
      `${this.getHubDeposits.find((d) => d.symbol == this.getAppConfig.system_token.symbol).quantity}`
      : `0 ${this.getAppConfig.system_token.symbol}`
    },
    isValidWallet(){
      return (this.getSession) ? this.getSession.link.walletType == 'anchor' && this.getSession.type == 'channel' : false
    },
    isWebAuth(){
      return (this.getSession) ? this.getSession.link.walletType == 'proton' : false
    }
  },

  async mounted() {
    this.$store.dispatch("app/fetchRamPricePerByte", { vm: this });

    await this.get_wasm_and_abi_from_github();

    if (this.prefill.group_account_name) {
      this.new_group_account_name = this.prefill.group_account_name;
    }
  },
  watch: {
    getAccountName: {
      immediate: true,
      handler: function (newV, oldV) {
        if (this.getAccountName) {
          this.getGroupsByCreator();
        }
      },
    },
  },
  methods: {
    isValidAccountName,
    isAvailableAccountName,
    async isavailableAccountNameWrapper(v) {
      const test = await isAvailableAccountName({ v: v, vm: this });
      if (test === true) {
        this.account_name_validated = true;
        return true;
      } else {
        this.account_name_validated = false;
        return test;
      }
    },
    async activateGroup() {
      this.deploycontract(this.new_group_account_name);
    },
    async createGroup() {
      // if (!this.has_enough_deposits) {
      //   this.openHubWallet();
      //   return;
      // }

      try {
        await this.$store.dispatch("app/fetchRamPricePerByte", { vm: this });

        this.step = "request_signature";

        let create_group = {
          account: this.getAppConfig.groups_contract,
          name: "creategroup",
          data: {
            groupname: this.new_group_account_name,
            creator: this.getAccountName,
            resource_estimation: this.getResourceEstimation,
          },
        };

        let res = await this.$store.dispatch("proton/transact", {
          actions: [create_group],
          disable_signing_overlay: true,
        });

        setTimeout(() => {
          this.$store.dispatch("user/fetchHubDeposits", {
            accountname: this.getAccountName,
            vm: this,
          });
        }, 2000);

        if (res && res.trxid) {
          notifySuccess({message: `"${this.new_group_account_name}" has been created.`})
          this.step = "request_activation";
        } else {
          this.step = "create_account";
          return false;
        }
      } catch (error) {
        console.warn(error);
      }
    },
    async deploycontract(new_group) {
      this.step = "request_signature";

      let setcode = {
        account: "eosio",
        name: "setcode",
        data: {
          account: new_group,
          vmtype: 0,
          vmversion: 0,
          code: this.wasmhex,
        },
        authorization: [
          { actor: this.getAccountName, permission: "active" },
          { actor: new_group, permission: "active" },
        ],
      };

      let setabi = {
        account: "eosio",
        name: "setabi",
        data: {
          account: new_group,
          abi: this.abihex,
        },
        authorization: [
          { actor: this.getAccountName, permission: "active" },
          { actor: new_group, permission: "active" },
        ],
      };

      let activate = {
        account: this.getAppConfig.groups_contract,
        name: "activate",
        data: {
          groupname: new_group,
          creator: this.getAccountName,
        },
      };

      let res = await this.$store.dispatch("proton/transact", {
        actions: [setabi, setcode, activate],
        disable_signing_overlay: true,
      });

      setTimeout(() => {
        this.$store.dispatch("user/fetchHubDeposits", {
          accountname: this.getAccountName,
          vm: this,
        });
      }, 1000);

      if (res && res.trxid) {
        notifySuccess({message: `"${this.new_group_account_name}" has been activated.`})
        this.step = "group_created";
        return true;
      } else {
        this.step = "request_activation";
        return false;
      }
    },
    openHubWallet() {
      let msg = `You don't have enough ${this.getAppConfig.system_token.symbol} deposits to start your DAO.
      You need a minimum of ${this.getResourceEstimation} to deploy the core contract. Excess deposits will be used to buy extra RAM.
      Once you have deposited the required amount, please close this pop-up and click "Create Account" again.`;
      this.emitter.emit("showHubDeposits", msg);
    },
    async next(resume_account_name = "") {
      if (resume_account_name != "") {
        this.step = "request_activation";
        this.new_group_account_name = resume_account_name;
        this.account_name_validated = true;
      } else {
        this.step = "create_account";
        // if (!this.has_enough_deposits) {
        //   this.openHubWallet();
        // }
      }
    },
    async get_wasm_and_abi_from_github() {
      console.log("retrieving code from github");
      let wasm = await this.$refs.wasm_compiler.loadRemoteWasm(
        `${this.getAppConfig.core_contract.raw}${this.getAppConfig.core_contract.wasm}`
      );
      let abi = await this.$refs.wasm_compiler.loadRemoteAbi(
        `${this.getAppConfig.core_contract.raw}${this.getAppConfig.core_contract.abi}`
      );

      this.wasmhex = wasm.wasm;
      this.abihex = abi.abi;
    },

    async get_wasm_and_abi_from_block(query) {
      let blocks = [];
      blocks.push(this.$eos.api.rpc.get_block(query.wasm[0]));
      if (query.wasm[0] != query.abi[0]) {
        blocks.push(this.$eos.api.rpc.get_block(query.abi[0]));
      }
      let [wasmblock, abiblock] = await Promise.all(blocks);
      abiblock = abiblock || wasmblock;

      let wasmhex = wasmblock.transactions
        .find((trx) => trx.trx.id == query.wasm[1])
        .trx.transaction.actions.find((a) => a.name == "setcode").data.code;
      let abihex = abiblock.transactions
        .find((trx) => trx.trx.id == query.abi[1])
        .trx.transaction.actions.find((a) => a.name == "setabi").data.abi;
      this.wasmhex = wasmhex;
      this.abihex = abihex;
      //return {wasmhex: wasmhex, abihex: abihex};
    },
    async getGroupsByCreator() {
      let groups_by_creator = await this.$eos.api.rpc.get_table_rows({
        json: true,
        code: this.getAppConfig.groups_contract,
        scope: this.getAppConfig.groups_contract,
        table: "groups",
        key_type: "name",
        index_position: 3,
        lower_bound: this.getAccountName,
        upper_bound: this.getAccountName,
        limit: -1,
      });

      if (
        groups_by_creator &&
        groups_by_creator.rows.length &&
        groups_by_creator.rows[0].creator == this.getAccountName
      ) {
        groups_by_creator = groups_by_creator.rows;
      } else {
        groups_by_creator = [];
      }
      console.log("fetched groups by creator", groups_by_creator);
      //this.groups_by_creator = [{groupname:"test", state:0}, {groupname:"test1", state:0}];
      this.groups_by_creator = groups_by_creator;
    },
  },
});
</script>
<style>
.create-group-width {
  width: 600px;
}
.bg-transparent {
  background: transparent;
}
</style>
