<template>
  <div class="creation-flow dao-page">
    <ol class="creation-steps" aria-label="Creation progress">
      <li v-for="(label, index) in ['Choose a name', 'Fund & create', 'Activate DAO']" :key="label" :class="{ current: currentStage === index + 1, complete: currentStage > index + 1 }" :aria-current="currentStage === index + 1 ? 'step' : undefined"><span><q-icon v-if="currentStage > index + 1" name="check" /><template v-else>{{ index + 1 }}</template></span>{{ label }}</li>
    </ol>
    <div class="creation-grid">
      <section class="creation-panel" aria-live="polite" :aria-busy="busy">
        <div v-if="error" class="creation-error" role="alert"><q-icon name="error_outline" /> {{ error }}</div>
        <template v-if="step === 'intro'">
          <span class="creation-icon"><q-icon name="public" /></span>
          <h2>A place for your people.</h2>
          <p>Bring your community together with shared decisions, a treasury, and governance on XPR Network.</p>
          <div class="creation-checklist"><div><q-icon name="check_circle_outline" /><span><strong>A name that’s yours</strong>Choose a unique, permanent account name for your DAO.</span></div><div><q-icon name="account_balance_wallet" /><span><strong>Your XPR wallet</strong>Fund the account and approve its creation with your wallet.</span></div><div><q-icon name="tune" /><span><strong>Room to make it your own</strong>Set up your community and governance after activation.</span></div></div>
          <q-btn v-if="isValidWallet" unelevated color="primary" label="Get started" icon-right="arrow_forward" @click="step = 'request_account_name'" />
          <q-btn v-else unelevated color="primary" label="Connect wallet to begin" icon-right="arrow_forward" :to="{ path: '/login', query: { redirect: $route.fullPath } }" />
          <p class="creation-caption">Three steps. You review each transaction in your wallet.</p>
        </template>
        <template v-else-if="!isValidWallet && !busy && step !== 'group_created'">
          <h2>Reconnect your wallet.</h2><p>Connect your wallet to continue creating your DAO.</p><q-btn unelevated color="primary" label="Connect wallet" :to="{ path: '/login', query: { redirect: $route.fullPath } }" />
        </template>
        <template v-else-if="step === 'request_account_name'">
          <p class="creation-eyebrow">Step 01 · Identity</p><h2>Give your DAO a name.</h2><p>This is your permanent account on XPR Network. You can add a display name and description later.</p>
          <q-input ref="accountinput" v-model="new_group_account_name" outlined :dark="false" label="DAO account name" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="12" counter :rules="[isavailableAccountNameWrapper]" :hint="account_name_validated ? 'This account name is available.' : '4–12 characters: lowercase a–z and numbers 1–5.'" @update:model-value="account_name_validated = false"><template #prepend><q-icon name="public" /></template><template #append><q-icon v-if="account_name_validated" name="check_circle" color="positive" /></template></q-input>
          <div class="creation-actions"><q-btn flat label="Back" @click="step = 'intro'" /><q-btn unelevated color="primary" label="Continue" icon-right="arrow_forward" :disable="!account_name_validated" @click="next('')" /></div>
          <div v-if="unfinishedGroups.length" class="creation-resume"><h3>Pick up where you left off</h3><p>These accounts are ready for activation.</p><q-btn v-for="group in unfinishedGroups" :key="group.groupname" outline color="primary" :label="group.groupname" icon-right="arrow_forward" @click="next(group.groupname)" /></div>
        </template>
        <template v-else-if="step === 'create_account'">
          <p class="creation-eyebrow">Step 02 · Resources</p><h2>Give your DAO a home.</h2><p>Your deposit funds the account’s on-chain storage. Review the current estimate and your hub balance before creating it.</p>
          <div class="creation-account"><q-icon name="public" /><strong>{{ new_group_account_name }}</strong><q-btn flat round icon="edit" aria-label="Edit DAO account name" @click="step = 'request_account_name'" /></div>
          <div class="creation-funding-note"><q-icon name="info_outline" /><span>Account creation uses <strong>all your existing {{ getAppConfig.system_token.symbol }} hub deposits</strong>. Any excess buys additional RAM for this DAO.</span></div>
          <hub-deposit-wallet v-if="artifactsReady && getResourceEstimation" :default_input_value="Math.max(0, Number((getRamPricePerByte * required_bytes - parseFloat(hubDeposits)).toFixed(4)))" />
          <p v-if="has_enough_deposits" class="creation-ready"><q-icon name="check_circle_outline" /> Your deposit covers the current estimate.</p>
          <div class="creation-actions"><q-btn flat label="Back" @click="step = 'request_account_name'" /><q-btn unelevated color="primary" label="Create account" icon-right="arrow_forward" :disable="!account_name_validated || !has_enough_deposits || !artifactsReady || busy" @click="createGroup" /></div>
        </template>
        <template v-else-if="step === 'request_activation'">
          <span class="creation-icon"><q-icon name="check" /></span><p class="creation-eyebrow">Step 03 · Activation</p><h2>One last step.</h2><p>Your account <strong>{{ new_group_account_name }}</strong> is created. Activate it to install the DAO contract and open your community workspace.</p><div class="creation-funding-note"><q-icon name="verified_user" /><span>Your wallet will request approval to deploy the contract and activate your DAO.</span></div><q-btn unelevated color="primary" label="Activate DAO" icon-right="arrow_forward" :disable="!artifactsReady || busy" @click="activateGroup" /><p class="creation-caption">You can return later and resume activation with the same wallet.</p>
        </template>
        <template v-else-if="step === 'request_signature'">
          <div class="creation-pending" role="status"><q-spinner color="primary" size="48px" /><h2>Over to your wallet.</h2><p>{{ pendingStage === 3 ? 'Approve activation' : 'Approve account creation' }} for <strong>{{ new_group_account_name }}</strong>.<br />Keep this page open while the transaction is confirmed.</p><span class="creation-caption">Declining the request will return you to the previous step.</span></div>
        </template>
        <template v-else-if="step === 'group_created'">
          <span class="creation-icon"><q-icon name="celebration" /></span><p class="creation-eyebrow">Ready for what’s next</p><h2>Your community starts here.</h2><p><strong>{{ new_group_account_name }}</strong> is active. Add your community’s details, invite members, and start making decisions together.</p><q-btn unelevated color="primary" label="Open your DAO" icon-right="arrow_forward" :to="`/manage/${new_group_account_name}`" />
        </template>
      </section>
      <aside class="creation-summary" aria-label="Setup details"><div class="creation-summary-art" role="img" aria-label="Green and ivory marble sculpture" /><div class="creation-summary-body"><p class="creation-eyebrow">Built for a more open world</p><h3>A shared future.<br />On your terms.</h3><dl><div><dt>Network</dt><dd>XPR Network</dd></div><div v-if="getAccountName"><dt>Creator</dt><dd>{{ getAccountName }}</dd></div><div><dt>Estimated resources</dt><dd>{{ getResourceEstimation || 'Estimate unavailable' }}</dd></div><div v-if="getAccountName"><dt>Hub deposit</dt><dd>{{ hubDeposits }}</dd></div></dl><p class="creation-caption">The estimate follows the current RAM price and may change before you sign.</p><q-btn v-if="!getResourceEstimation" flat color="primary" label="Refresh estimate" icon="refresh" @click="refreshEstimate" /><p v-if="preparing" class="creation-caption" role="status"><q-spinner size="16px" /> Preparing the DAO contract…</p><div v-if="preparationError" class="creation-error" role="alert">{{ preparationError }}<q-btn flat label="Retry" @click="get_wasm_and_abi_from_github" /></div></div></aside>
    </div>
    <wasmCompiler ref="wasm_compiler" />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { defineComponent } from "vue";

import wasmCompiler from "components/wasm-compiler";

import hubDepositWallet from "./hub-deposit-wallet";

import { notifySuccess } from "src/imports/notifications";

export default defineComponent({
  name: "newGroup",
  components: {
    wasmCompiler,

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
      busy: false,
      error: "",
      preparing: false,
      preparationError: "",
      pendingStage: 2,
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
      return !!this.getResourceEstimation && parseFloat(this.hubDeposits) >= parseFloat(this.getResourceEstimation);
    },
    hubDeposits() {
      const token = this.getAppConfig.system_token;
      return (Array.isArray(this.getHubDeposits) ? this.getHubDeposits : []).find(d => d.symbol === token.symbol && d.contract === token.contract)?.quantity || `0 ${token.symbol}`;
    },
    isValidWallet() { return !!this.getSession && !!this.getAccountName; },
    artifactsReady() { return !!this.wasmhex && !!this.abihex; },
    currentStage() {
      return this.step === 'group_created' ? 4 : this.step === 'request_signature' ? this.pendingStage : this.step === 'request_activation' ? 3 : this.step === 'create_account' ? 2 : 1;
    },
    unfinishedGroups() { return this.groups_by_creator.filter(group => group.state === 0); },
  },

  async mounted() {
    this.refreshEstimate();

    await this.get_wasm_and_abi_from_github();

    if (this.prefill.group_account_name) {
      this.new_group_account_name = this.prefill.group_account_name;
    }
  },
  watch: {
    getAccountName: {
      immediate: true,
      handler: function (newV, oldV) {
        this.groups_by_creator = [];
        if (this.getAccountName) this.getGroupsByCreator();
      },
    },
  },
  methods: {
    async refreshEstimate() {
      try { await this.$store.dispatch("app/fetchRamPricePerByte", { vm: this }); }
      catch (_) { this.error = 'Unable to load the resource estimate. Check your connection and retry.'; }
    },
    async isavailableAccountNameWrapper(value) {
      this.account_name_validated = false;
      if (!/^[a-z1-5]{4,12}$/.test(value)) return 'Use 4–12 lowercase letters a–z or numbers 1–5.';
      try {
        await this.$eos.api.rpc.get_account(value);
        return 'This account name is already taken.';
      } catch (error) {
        const details = JSON.stringify(error?.json || error?.message || '');
        if (!/unknown key|account.*(not found|does not exist)|unknown account/i.test(details)) return 'Could not check availability. Please try again.';
        if (value !== this.new_group_account_name) return false;
        this.account_name_validated = true;
        return true;
      }
    },
    async activateGroup() {
      if (this.busy || !this.artifactsReady || !this.isValidWallet) return;
      this.busy = true; this.error = ''; this.pendingStage = 3;
      try { await this.deploycontract(this.new_group_account_name); }
      catch (_) { this.step = 'request_activation'; this.error = 'Activation was not confirmed. Check your wallet and account status before retrying.'; }
      finally { this.busy = false; }
    },
    async createGroup() {
      if (this.busy || !this.account_name_validated || !this.artifactsReady || !this.isValidWallet) return;
      this.busy = true; this.error = ''; this.pendingStage = 2;
      try {
        await this.$store.dispatch("app/fetchRamPricePerByte", { vm: this });

        if (!this.has_enough_deposits) { this.error = "The resource estimate changed. Please review your deposit."; return; }
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
          this.error = "Account creation was not confirmed. Check your wallet and account status before retrying.";
          return false;
        }
      } catch (error) {
        this.step = 'create_account';
        this.error = 'Account creation was not confirmed. Check your connection and wallet before retrying.';
      } finally { this.busy = false; }
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
        this.error = "Activation was not confirmed. You can retry after checking your wallet.";
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
      this.preparing = true; this.preparationError = '';
      try {
      let wasm = await this.$refs.wasm_compiler.loadRemoteWasm(
        `${this.getAppConfig.core_contract.raw}${this.getAppConfig.core_contract.wasm}`
      );
      let abi = await this.$refs.wasm_compiler.loadRemoteAbi(
        `${this.getAppConfig.core_contract.raw}${this.getAppConfig.core_contract.abi}`
      );

      this.wasmhex = wasm.wasm;
      this.abihex = abi.abi;
      } catch (_) { this.preparationError = 'Could not load the DAO contract. Retry before funding or activating your DAO.'; }
      finally { this.preparing = false; }
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
      const creator = this.getAccountName;
      try {
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
      if (creator === this.getAccountName) this.groups_by_creator = groups_by_creator;
      } catch (_) { /* Existing groups can be reloaded after reconnecting. */ }
    },
  },
});
</script>

<style scoped src="../css/create-flow.scss" lang="scss"></style>
