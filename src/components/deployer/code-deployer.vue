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

      // ***************
      // 1. Serialize the actions

      console.log("proposeCodeUpdate 1");

      const actions = [
        {
          account: 'eosio',
          name: 'setabi',
          authorization: [this.module.slave_permission],
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

          authorization: [this.module.slave_permission],
        }
      ];

      (async () => {
        const serialized_actions = await api.serializeActions(actions)
      })

      // 2. Proposal Input
      console.log("proposeCodeUpdate 2");

      const proposeInput = {
        proposer: this.module.slave_permission.actor,
        proposal_name: 'upgradedao',
        requested: [
          {
            actor: 'bigverndao',
            permission: 'active'
          }
        ],
        trx: {
          expiration: '2023-09-14T16:39:15',
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

      // 3. Propose
      console.log("proposeCodeUpdate 3");
      
      await api.transact({
        actions: [{
          account: 'eosio.msig',
          name: 'propose',
          authorization: [{
            actor: this.module.slave_permission.actor,
            permission: 'active',
          }],
          data: proposeInput,
        }]
      }, {
        blocksBehind: 3,
        expireSeconds: 30,
        broadcast: true,
        sign: true
      });
    },
    newHex(e){
      this.new_hex = e;
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
  }
});
</script>