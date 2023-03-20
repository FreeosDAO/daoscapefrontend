<template>
  <!--<ual ref="ual-component" />-->
  <router-view />

  <q-dialog v-model="show_hub_deposit_wallet">
    <q-card class="overflow-hidden" style="min-width: 300px; max-width: 350px">
      <q-card-section>
        <page-header title="The DAOScape hub deposits" class="q-pr-lg q-mb-sm" />
        <p class="text-grey-7 text-caption">{{ customHubWalletMessage }}</p>
        <q-btn
          icon="close"
          flat
          round
          dense
          v-close-popup
          class="q-ma-md absolute-top-right"
        />
        <div>
          <hub-deposit-wallet />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script>
import { defineComponent } from "vue";

//import ual from "components/ual/ual";
import hubDepositWallet from "components/hub-deposit-wallet";
import pageHeader from "./components/page-header";

import { mapActions, mapGetters } from "vuex";
import { notifyError, notifySuccess } from "./imports/notifications.js";

export default defineComponent({
  name: "App",
  components: { hubDepositWallet, pageHeader },
  data() {
    return {
      show_hub_deposit_wallet: false,
      customHubWalletMessage: "",
    };
  },
  computed: {
    ...mapGetters({
      getActiveGroup: "group/getActiveGroup",
      getAccountName: "proton/getAccountName",
      getSession: "proton/getSession",
      getIsDark: "user/getIsDark",
    }),
  },
  async mounted() {
    if(this.getSession){
      await this.reconnect();
    }
    this.$store.dispatch("app/initRoutine", { vm: this });
  },
  methods: {
    ...mapActions({
      reconnect: 'proton/reconnect'
    }),
    showHubWallet(e) {
      this.customHubWalletMessage =
        e ||
        "The DAOScape Hub Wallet holds your funds to perform certain actions on the hub contract. e.g. creating new groups etc...";
      this.show_hub_deposit_wallet = true;
    },
  },
  created() {
    this.emitter.on('showHubDeposits', (e)=>{this.showHubWallet(e) } );

    if (this.$messaging) {
      this.$messaging.onMessage((payload) => {
        //messsage handling when app focused
        console.log(payload);
        if (
          (payload.data.type =
            "propose" && !payload.notification.body.includes(this.getAccountName))
        ) {
          this.$store.dispatch("group/fetchProposals", {
            groupname: this.getActiveGroup,
            scope: this.getActiveGroup,
          });
          notifySuccess({ message: `${payload.notification.body}` });
        }
        // ...
      });
    }
  },


  watch: {
    getAccountName: {
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal) {
          console.log(`call logged in routine for ${newVal}`);
          this.$store.dispatch("user/loggedInRoutine", {
            accountname: this.getAccountName,
            vm: this
          });
        } else {
          this.$store.dispatch("user/loggedOutRoutine");
        }
      },
    },
    getIsDark: {
      immediate: true,
      handler(newVal, oldVal) {
        // console.log("night mode", this.getIsDark);
        if (newVal !== undefined && newVal != oldVal) {
          this.$q.dark.set(newVal);
        }
      },
    },
  },
});
</script>
