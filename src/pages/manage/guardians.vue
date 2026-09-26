<template>
  <q-page padding class="text-black constrain-page-width dao-page dao-guardians">
    <!-- content -->
    <page-header title="Guardians" eyebrow="Community workspace" description="Meet the trusted signers who review proposals and help govern your DAO." />

    <div class="dao-search-row">
      <q-input placeholder="Find a guardian" aria-label="Search guardians" outlined clearable v-model="filter"><template #prepend><q-icon name="search" /></template></q-input>
      <q-btn v-if="getIsGuardian(getAccountName)" outline color="primary" icon="person_add" label="Invite" @click="new_cust_dialog = true" />
      <q-btn flat round icon="more_horiz" aria-label="Guardian options"><q-menu><q-list>
        <q-item v-if="getIsGuardian(getAccountName)" clickable v-close-popup @click="rem_cust_dialog = true"><q-item-section>Remove guardian</q-item-section></q-item>
        <q-item clickable v-close-popup @click="$store.commit('user/setMinifyGuardians', !getMinifyGuardians)"><q-item-section>{{ getMinifyGuardians ? 'Show details' : 'Compact view' }}</q-item-section></q-item>
      </q-list></q-menu></q-btn>
    </div>
    <p class="text-grey-7 q-mb-lg">{{ getFilteredGuardians.length }} {{ getFilteredGuardians.length === 1 ? 'guardian' : 'guardians' }}</p>
    <div v-if="!getFilteredGuardians.length" class="dao-empty"><q-icon name="mdi-account-key-outline" /><h2>No guardians found</h2><p>Try a different account name.</p></div>
    <transition-group
      appear
      enter-active-class="animated zoomIn"
      leave-active-class="animated zoomOut"
      class="row q-col-gutter-md"
      tag="div"
    >
      <guardian-card
        v-for="guardian in getFilteredGuardians"
        :guardian="guardian"
        :key="guardian.account"
        class="col-xs-12 col-sm-6 col-lg-4"
        :minify="getMinifyGuardians"
      />
    </transition-group>

    <!-- <pre>{{getGuardians}}</pre> -->

    <q-dialog v-model="new_cust_dialog">
      <q-card style="width: 100%; max-width: 350px">
        <q-card-section class="row justify-between items-center">
          <div class="text-grey-5 text-weight-light text-h5">Invite Guardian</div>
          <q-btn icon="close" aria-label="Close dialog" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-input
            outlined
            placeholder="Account"
            bottom-slots
            v-model="new_cust_name"
            maxlength="12"
            :debounce="700"
            :rules="[
              (val) => !!val || '* Required',
              isValidAccountName,
              isExistingAccountNameWrapper,
            ]"
            @update:model-value="account_name_validated = false"
          >
            <template v-slot:hint>
              <span class="text-grey-8 row" v-if="account_name_validated">
                <!-- <q-icon name="check"/> -->
                <span>Account name found!</span>
              </span>
              <span v-else>Input account name</span>
            </template>
          </q-input>
        </q-card-section>
        <q-card-section class="row justify-end">
          <q-btn
            :disabled="!account_name_validated"
            label="propose"
            color="primary"
            @click="inviteGuardian"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="rem_cust_dialog">
      <q-card style="width: 100%; max-width: 350px">
        <q-card-section class="row justify-between items-center">
          <div class="text-grey-5 text-weight-light text-h5">Remove Guardian</div>
          <q-btn icon="close" aria-label="Close dialog" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-input
            outlined
            placeholder="Account"
            bottom-slots
            v-model="rem_cust_name"
            maxlength="12"
            :debounce="700"
            :rules="[(val) => !!val || '* Required', isValidAccountName, isGuardian]"
            @update:model-value="rem_cust_validated = false"
          >
            <template v-slot:hint>
              <span class="text-grey-8 row" v-if="rem_cust_validated">
                <!-- <q-icon name="check"/> -->
                <span>Account is guardian!</span>
              </span>
              <span v-else>Input account name</span>
            </template>
          </q-input>
        </q-card-section>
        <q-card-section class="row justify-end">
          <q-btn
            :disabled="!rem_cust_validated"
            label="propose"
            color="primary"
            @click="removeGuardian"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { mapGetters } from "vuex";
import pageHeader from "components/page-header";
import guardianCard from "components/guardian-card";

import { isValidAccountName, isExistingAccountName } from "../../imports/validators";

export default defineComponent({
  // name: 'LayoutName',
  components: {
    pageHeader,
    guardianCard,
  },
  data() {
    return {
      filter: "",
      tabfilter: "all",
      menu_visible: false,

      new_cust_dialog: false,
      new_cust_name: "",
      account_name_validated: false,

      rem_cust_dialog: false,
      rem_cust_name: "",
      rem_cust_validated: false,
    };
  },
  computed: {
    ...mapGetters({
      getAccountName: "proton/getAccountName",
      getGuardians: "group/getGuardians",
      getIsGuardian: "group/getIsGuardian",
      getActiveGroup: "group/getActiveGroup",
      getMinifyGuardians: "user/getMinifyGuardians",
    }),
    getFilteredGuardians() {
      const term = (this.filter || '').trim().toLowerCase();
      return this.getGuardians.filter(c => c.account.includes(term));
    },
  },
  methods: {
    isValidAccountName,
    isExistingAccountName,
    async inviteGuardian() {
      let action = {
        account: this.getActiveGroup,
        name: "invitecust",
        data: {
          account: this.new_cust_name,
        },
      };

      const title = `Invite new guardian`;
      const description = `This proposal is to invite a new guardian ${action.data.account}`;

      let res = await this.$store.dispatch("group/propose", {
        data: {
          actions: [action],
          description: description,
          title: title,
        },
        vm: this,
      });
      this.new_cust_name = "";
      this.new_cust_dialog = false;
    },
    async removeGuardian() {
      let action = {
        account: this.getActiveGroup,
        name: "removecust",
        data: {
          account: this.rem_cust_name,
        },
      };

      const title = `Remove guardian`;
      const description = `This proposal is to remove guardian ${action.data.account}`;

      await this.$store.dispatch("group/propose", {
        data: {
          actions: [action],
          description: description,
          title: title,
        },
        vm: this,
      });
      this.rem_cust_name = "";
      this.rem_cust_dialog = false;
    },
    async isExistingAccountNameWrapper(v) {
      this.account_name_validated = false;
      if (this.getIsGuardian(v)) {
        return "Already guardian.";
      } else {
        let t = await isExistingAccountName({ value: v, vm: this });
        if (t === true && v === this.new_cust_name) {
          this.account_name_validated = true;
        }
        return t;
      }
    },
    isGuardian(v) {
      this.rem_cust_validated = false;
      if (this.getIsGuardian(v)) {
        this.rem_cust_validated = true;
        return true;
      } else {
        return "Account is not a guardian.";
      }
    },
  },
});
</script>
