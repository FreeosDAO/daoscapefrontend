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
      <div v-else class="row justify-between">
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
    };
  },
  computed: {
    ...mapGetters({
      getRpcEndpoints: "proton/getRpcEndpoints",
      getAccountName: "proton/getAccountName",
      getActiveGroup: "group/getActiveGroup",
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
      console.log(">>> Start of proposeCodeUpdate");
      this.is_proposing = true;
      // let PROPOSAL_NAME = 'Update Core Contract';

      // START OF ORIGINAL CODE BLOCK 1
      // let setcode = {
      //   account: "eosio",
      //   name: "setcode",
      //   data: {
      //     account: this.module.slave_permission.actor,
      //     vmtype: 0,
      //     vmversion: 0,
      //     code: this.new_hex.wasm,
      //   },

      //   authorization: [this.module.slave_permission],
      // };
      // let setabi = {
      //   account: "eosio",
      //   name: "setabi",
      //   data: {
      //     account: this.module.slave_permission.actor,
      //     abi: this.new_hex.abi,
      //   },

      //   authorization: [this.module.slave_permission],
      // };
      // END OF ORIGINAL CODE BLOCK 1


      // START OF COMMENTED MULTISIG CODE
      let system_propose_options = {
        return_action: true,
        actions: [setcode, setabi], 
        requested: [{ actor: this.getActiveGroup, permission: "owner" }],
        proposal_name: PROPOSAL_NAME,
        vm: this,
      };

      console.log(">>> proposeCodeUpdate 1");
      
      let system_propose_action = await this.$store.dispatch(
        "proton/proposeSystemMsig",
        system_propose_options
      );
      
      console.log(">>> proposeCodeUpdate 2");

      let proposal_hash = await this.$eos.api.serializeTransaction(
        system_propose_action.data.trx
      );
      proposal_hash = sha256(proposal_hash);
     

      let approve_and_execute = [
        {
          account: "eosio.msig",
          name: "approve",
          data: {
            proposer: this.getAccountName,
            proposal_name: PROPOSAL_NAME,
            level: { actor: this.getActiveGroup, permission: "owner" },
            proposal_hash: proposal_hash,
          },
          authorization: [{ actor: this.getActiveGroup, permission: "owner" }],
        },
        {
          account: "eosio.msig",
          name: "exec",
          data: {
            proposer: this.getAccountName,
            proposal_name: PROPOSAL_NAME,
            executer: this.getActiveGroup,
          },
          authorization: [{ actor: this.getActiveGroup, permission: "owner" }],
        },
      ];
      console.log(">>> proposeCodeUpdate 3");
      // END OF COMMENTED MULTISIG CODE
      

      // START OF ORIGINAL CODE BLOCK 2
/* 
      let group_propose_options = {
        return_action: true,
        title: `Code update for "${this.module.module_name}"`,
        description: `Updating "${this.module.module_name}" contract code. New wasm hash: ${this.new_hex.code_hash}. New abi hash: ${this.new_hex.abi_hash}.`,
        actions: [setcode, setabi],
      };

      try {
        let group_propose_action = await this.$store.dispatch("group/propose", {
          data: group_propose_options,
          vm: this,
        });

        let res = await this.$store.dispatch("proton/transact", {
          actions: [group_propose_action],
          disable_signing_overlay: true,
        });

        if (res && res.trxid) {
          setTimeout(() => {
            this.$store.dispatch("group/fetchProposals", {
              groupname: this.getActiveGroup,
              scope: this.getActiveGroup,
            });
          }, 1500);
        }

      } catch (error) {
        console.warn(error)
        notifyError({message:`Uh oh! Something went wrong: ${error}`});
        
      }
*/
    console.log(">>> proposeCodeUpdate 4");

      this.is_proposing = false;
      this.reset_view();
    console.log(">>> proposeCodeUpdate 5");
    },
    newHex(e){
      this.new_hex = e;
    }

    
  },
  // END OF ORIGINAL CODE BLOCK 2

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
  }
});
</script>
