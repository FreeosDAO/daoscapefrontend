<template>
  <div v-if="module">

    <transition
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
      mode="out-in"
    >
      <div v-if="view == 'info'" key="info">
        <div>module name: {{ module.module_name }}</div>
        <div class="row">
          account: <explorer-link :accountname="module.slave_permission.actor" />
        </div>
        <div v-if="current_code_and_abi_hash?.abi_hash && current_code_and_abi_hash?.code_hash">
          <div>abi hash: {{ current_code_and_abi_hash.abi_hash }}</div>
          <div>code hash: {{ current_code_and_abi_hash.code_hash }}</div>
        </div>
      </div>

      <div v-else-if="view == 'update_code'" key="updatecode">
        <code-selector v-model="new_hex" @newhex="newHex" />
      </div>

      <div v-else-if="view == 'success'" key="success">
        <div class="text-subtitle1">Code Update Successfully Proposed</div>
        <p class="text-left">You can view and share the multi-signature proposal at the following URL or click the button below: <a title="View MSIG Proposal" :href="msig_transaction" target="_blank">{{ msig_transaction }}</a></p>
        <q-btn
          label="View Proposal"
          color="primary"
          :href="msig_transaction"
          target="_blank"
        />
      </div>
    </transition>

    <div class="q-mt-md">
      <div v-if="view == 'info'">
        <q-btn
          v-if="module.has_contract"
          label="update code"
          @click="view = 'update_code'"
          color="primary"
        />
      </div>
      <div v-else-if="view == 'update_code'" class="row justify-between">
        <q-btn label="back" @click="reset_view" color="primary" flat />
        <q-btn
          label="propose code update"
          @click="proposeCodeUpdate"
          color="primary"
          :disabled="!can_propose_code_update"
          :loading="is_proposing"
        />
      </div>
    </div>

  </div>
</template>

<script>
import { defineComponent } from "vue";
import { mapGetters } from "vuex";
import codeSelector from "components/deployer/code-selector";
import { getCurrentCodeHash, randomName, sha256 } from "../../imports/helpers.js";
import explorerLink from "components/explorer-link";
import { notifyError } from "../../imports/notifications.js";

export default defineComponent({
  name: "codeDeployer",
  props: {
    module: "",
  },
  components: {
    codeSelector,
    explorerLink,
  },
  data() {
    return {
      view: "info",
      current_code_and_abi_hash: "",
      new_hex: {
        wasm: "",
        abi: "",
        abi_hash: "",
        wasm_hash: "",
      },
      is_proposing: false,
      proposal_name: '',
      msig_transaction: null
    };
  },
  computed: {
    ...mapGetters({
      getRpcEndpoints: "proton/getRpcEndpoints",
      getAccountName: "proton/getAccountName",
      getActiveGroup: "group/getActiveGroup",
      getGuardians: "group/getGuardians",
      getSelectedBlockExplorer: "user/getSelectedBlockExplorer"
    }),
    can_propose_code_update() {
      if (this.new_hex.wasm && this.new_hex.abi) {
        return true;
      }
    },
  },
  methods: {
    reset_view() {
      this.view = "info";
      this.new_hex = {
        wasm: "",
        abi: "",
        abi_hash: "",
        code_hash: "",
      };
    },

    async proposeCodeUpdate() {
      this.is_proposing = true;
      // CURRENT USER = this.getAccountName
      // CURRENT GROUP = this.module.slave_permission.actor

      try {
        // 1. Serialize the actions
        const actions = [
          {
            account: 'eosio',
            name: 'setabi',
            authorization: [{
              actor: this.module.slave_permission.actor,
              permission: 'active'
            }],
            data: {
              account: this.module.slave_permission.actor,
              abi: this.new_hex.abi,
            }
          },
          {
            account: "eosio",
            name: "setcode",
            data: {
              account: this.module.slave_permission.actor,
              vmtype: 0,
              vmversion: 0,
              code: this.new_hex.wasm,
            },
            authorization: [{
              actor: this.module.slave_permission.actor,
              permission: 'active'
            }]
          }
        ];
        
        
        let serialized_actions = []
        actions.forEach(async (action) => {
          const contract = await this.$eos.api.getContract(action.account);
          const serialized = await this.$eos.Serialize.serializeAction(contract, action.account, action.name, action.authorization, action.data)
          serialized_actions.push(serialized)
        });

        // 2. Get needed variables
        // only "alive" guardians
        let requested = this.getGuardians
        .filter(guardian => {
          return guardian.alive
        })
        .map(guardian => {
          return {
            actor: guardian.account,
            permission: 'active'
          }
        })
        console.log('requested', requested)
        
        // dates
        const now = new Date()
        let expiration = new Date( now.setDate(now.getDate() + 7) )
        expiration = expiration.toISOString().slice(0,19)

        // set proposal name
        let proposal_name = `udao${now.toLocaleString('en-US', { month: 'short' }).toLowerCase()}${this.shortHash()}`
        // check if other proposals have been made this month
        // can only make up to 6 per month
        const existingProposals = await this.$eos.api.rpc.get_table_rows({
            json: true,
            code: 'eosio.msig',
            scope: this.getAccountName,
            table: "proposal",
            limit: -1
          });
          console.log('existingProposals', existingProposals)

        if(existingProposals && existingProposals.rows){
          const daoUpgrades = existingProposals.rows.filter(proposal => {
            return proposal.proposal_name.includes(proposal_name)
          })
          // cancel if more than 6
          if(daoUpgrades.length >= 6){
            throw Error('Your account can only propose upgrading the same contract up to 6 times per month.')
          }
          // add number if greater than 1
          if(daoUpgrades.length){
            proposal_name += daoUpgrades.length
          }
        }
        this.proposal_name = proposal_name

        // 3. Proposal Input
        const proposeInput = {
          proposer: this.getAccountName,
          proposal_name,
          requested,
          trx: {
            expiration,
            ref_block_num: 0,
            ref_block_prefix: 0,
            max_net_usage_words: 0,
            max_cpu_usage_ms: 0,
            delay_sec: 0,
            context_free_actions: [],
            actions: serialized_actions,
            transaction_extensions: []
          }
        };

        // 4. Sign the transaction
        let res = await this.$store.dispatch("proton/transact", {
            actions: [{
              account: 'eosio.msig',
              name: 'propose',
              authorization: [{
                actor: this.getAccountName,
                permission: 'active',
              }],
              data: proposeInput,
            }],
            disable_signing_overlay: true,
          });
        
        // 5. throw error if response is undefined
        if(!res){
          throw new Error('User cancelled transaction')
        }

        // grab successfull transaction
        // and move to "success" screen
        this.msig_transaction = `${this.getSelectedBlockExplorer.base}msig/${this.getAccountName}/${this.proposal_name}`
        this.view = 'success'

      } catch (error) {
        console.error(error)
        let message = ("message" in error) ? error.message : "Something went wrong";
        if(message === 'User cancelled transaction') return
        notifyError({message})
      }
      finally{
        this.is_proposing = false;
        //this.reset_view();
      }
      
    },
    newHex(e){
      this.new_hex = e;
    },
    shortHash(){
      let shortHash = this.new_hex.code_hash.slice(-4)
      let replace = [
        {search: '0', replace: '1'},
        {search: '6', replace: '2'},
        {search: '7', replace: '3'},
        {search: '8', replace: '4'},
        {search: '9', replace: '5'}
      ]
      replace.forEach(item => {
        shortHash = shortHash.replace(item.search, item.replace)
      });
      return shortHash
    }
  },

  watch: {
    module: {
      immediate: true,
      handler: async function (newV, oldV) {
        if (newV && newV != oldV && newV.slave_permission) {
          if (this.current_code_and_abi_hash === "") {
            this.current_code_and_abi_hash = await getCurrentCodeHash(
              this.getRpcEndpoints,
              this.module.slave_permission.actor,
              this
            );
          }
        }
      },
    },
  },

  mounted(){
    this.msig_transaction = `${this.getSelectedBlockExplorer.base}msig/${this.getAccountName}/${this.proposal_name}`
  }
});
</script>
