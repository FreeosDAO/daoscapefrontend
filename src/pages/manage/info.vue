<template>
  <q-page padding class="constrain-page-width">
    <transition-group
      v-if="getActiveGroupConfig"
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
      mode="out-in"
      class="row q-col-gutter-md"
      tag="div"
    >
      <div class="col-xs-12" key="header_info">
        <q-card class="relative-position">
          <q-card-section>

            <div class="row justify-between">
              <div class="col-xs-12 col-md-4 q-col-gutter-md">
                <update-logo :show_edit="allowed_to_edit" class="q-mb-md" />
              </div>

              <div class="col-xs-12 col-md-8 q-col-gutter-md column items-start">
                <div class="row justify-between full-width">
                  <q-item class="no-padding q-mr-sm">
                    <q-item-section>
                      <q-item-label>Group Account</q-item-label>
                      <q-item-label class="text-h4">{{getActiveGroupConfig.groupname}}</q-item-label>
                      <q-item-label caption>
                        <explorer-link :accountname="getActiveGroupConfig.groupname" accountnameText="View on explorer" />
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption class="text-right">Created</q-item-label>
                      <q-item-label
                        ><date-string :date="getActiveGroupConfig.creation_date"
                      /></q-item-label>
                    </q-item-section>
                  </q-item>
                </div>
                
                <div v-if="getActiveGroupConfig.meta.about" class="q-mt-md full-width">
                  <div>About</div>
                  <q-markdown
                    class="text-caption text-weight-light"
                    :src="getActiveGroupConfig.meta.about"
                    :no-abbreviation="false"
                  >
                  </q-markdown>
                </div>

                <div v-if="getActiveGroupConfig.meta.links.length" class="text-weight-light row justify-between items-center full-width">
                  <div>
                    <groupLinks :links="getActiveGroupConfig.meta.links" />
                  </div>
                  <q-item class="no-padding">
                    <q-item-section>
                      <q-item-label>
                        <group-tags
                          :tags="getActiveGroupConfig.tags"
                          content-class="bg-primary text-white"
                        />
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </div>

                <div class="column full-width q-mt-auto justify-end">
                  <div
                    v-if="getCoreConfig && getCoreConfig.conf.userterms"
                    class="row justify-end q-mt-sm text-weight-light"
                  >
                    <q-checkbox
                      v-model="agree_terms"
                      left-label
                      label="I have read and I agree to the user terms."
                    />
                  </div>
                  <div class="row justify-end full-width">
                    <q-btn
                      v-if="!getIsMember"
                      label="Become A Member"
                      color="primary"
                      icon="add"
                      @click="regmember"
                      :loading="is_transacting"
                    />
                    <q-btn
                      v-else
                      label="unregister"
                      color="primary"
                      outline
                      @click="unregmember"
                      :loading="is_transacting"
                    />
                  </div>
                </div>
              </div>
            </div>
            

          </q-card-section>
        </q-card>
      </div>

      <!--<div class="col-xs-12" key="clap_info">
        <q-card>
          <div class="row justify-between items-center">
            <clap-for-group />
          </div>
        </q-card>
      </div>-->

      <div class="col-xs-12 col-sm-6 col-lg-4" key="guardians_info">
        <q-card class="primary-hover-list">
          <q-item clickable :to="`/manage/${getActiveGroup}/guardians`">
            <q-item-section avatar>
              <q-icon name="mdi-account-key" color="primary" size="xl" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-light text-h5 text-grey-7"
                >Guardians</q-item-label
              >
            </q-item-section>
            <q-item-section side>
              <q-item-label class="text-h5 text-grey-7">{{
                getNumberGuardians
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-card>
      </div>

      <div
        v-if="getElectionsState"
        class="col-xs-12 col-sm-6 col-lg-4"
        key="candidates_info"
      >
        <q-card class="primary-hover-list">
          <q-item clickable :to="`/members/${getActiveGroup}/elections`">
            <q-item-section avatar>
              <q-icon name="mdi-account-card-details" color="primary" size="xl" />
              <q-tooltip
                class="bg-secondary"
                :delay="500"
                anchor="center right"
                self="center left"
                :offset="[10, 10]"
              >
                <div>
                  Active Candidates: {{ getElectionsState.active_candidate_count }}
                </div>
                <div>
                  Inactive Candidates: {{ getElectionsState.inactive_candidate_count }}
                </div>
              </q-tooltip>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-light text-h5 text-grey-7"
                >Candidates</q-item-label
              >
            </q-item-section>
            <q-item-section side>
              <q-item-label class="text-h5 text-grey-7">{{
                getElectionsState.active_candidate_count
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-card>
      </div>

      <div
        v-if="getCoreConfig && getCoreConfig.conf.member_registration"
        class="col-xs-12 col-sm-6 col-lg-4"
        key="members_info"
      >
        <q-card class="primary-hover-list">
          <q-item clickable :to="`/manage/${getActiveGroup}/members`">
            <q-item-section avatar>
              <q-icon name="mdi-account-multiple-check" color="primary" size="xl" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-light text-h5 text-grey-7"
                >Members</q-item-label
              >
            </q-item-section>
            <q-item-section side>
              <q-item-label v-if="getCoreState" class="text-h5 text-grey-7">{{
                getCoreState.state.member_count
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-card>
      </div>

      <div
        v-if="getCoreConfig && getCoreConfig.conf.maintainer_account.actor"
        class="col-xs-12 col-sm-6 col-lg-4"
        key="maintainer_account"
      >
        <q-card class="primary-hover-list">
          <q-item clickable>
            <q-item-section avatar>
              <q-icon name="mdi-settings-transfer" color="primary" size="xl" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-light text-h5 text-grey-7"
                >Maintainer Account</q-item-label
              >
              <q-item-label caption
                >{{ getCoreConfig.conf.maintainer_account.actor }}@{{
                  getCoreConfig.conf.maintainer_account.permission
                }}</q-item-label
              >
            </q-item-section>
          </q-item>
        </q-card>
      </div>

      <div
        v-if="getElectionsContract"
        class="col-xs-12 col-sm-6 col-lg-8"
        key="new_election"
      >
        <q-card class="primary-hover-list">
          <new-election-timer />
        </q-card>
      </div>
    </transition-group>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { mapGetters } from "vuex";
import { openURL } from "quasar";
import updateLogo from "components/meta/update-logo";
import groupTags from "components/group-tags";
import groupLinks from "components/group-links";
import clapForGroup from "components/clap-for-group";
import groupNotificationManager from "components/group-notification-manager";
import dateString from "components/date-string";
import explorerLink from "components/explorer-link";
import newElectionTimer from "components/modules/elections/new-election-timer";
import { notifyError } from "src/imports/notifications";

export default defineComponent({
  name: "PageIndex",
  components: {
    updateLogo,
    groupTags,
    groupLinks,
    clapForGroup,
    groupNotificationManager,
    newElectionTimer,
    dateString,
    explorerLink,
  },
  data() {
    return {
      agree_terms: false,
      is_transacting: false,
    };
  },
  computed: {
    ...mapGetters({
      getAccountName: "proton/getAccountName",
      getActiveGroup: "group/getActiveGroup",
      getActiveGroupConfig: "group/getActiveGroupConfig",
      getCoreConfig: "group/getCoreConfig",
      getCoreState: "group/getCoreState",
      getNumberGuardians: "group/getNumberGuardians",
      getSelectedBlockExplorer: "user/getSelectedBlockExplorer",
      getElectionsContract: "elections/getElectionsContract",
      getElectionsState: "elections/getElectionsState",
      getIsGuardian: "group/getIsGuardian",
      getIsMember: "user/getIsMember",
    }),
    allowed_to_edit() {
      if (this.getIsGuardian(this.getAccountName)) {
        return true;
      } else {
        return false;
      }
    }
  },
  methods: {
    openURL,
    async regmember() {

      // check if terms required
      // if required & terms not agreed, exit
      if(this.getCoreConfig.conf.userterms && !this.agree_terms){
        notifyError({"message": "Please agree to the terms to become a member."})
        return
      }

      let regmember = {
        account: this.getActiveGroup,
        name: "regmember",
        data: {
          actor: this.getAccountName,
        },
      };

      let sign = {
        account: this.getActiveGroup,
        name: "signuserterm",
        data: {
          member: this.getAccountName,
          agree_terms: this.agree_terms,
        },
      };
      let actions = [regmember];
      if (this.getCoreConfig.conf.userterms) {
        actions.push(sign);
      }
      this.is_transacting = true;
      let res = await this.$store.dispatch("proton/transact", {
        actions: actions,
        disable_signing_overlay: true,
      });
      if (res && res.trxid) {
        let termsv =
          this.getLatestUserterms && this.getLatestUserterms.id && this.agree_terms
            ? this.getLatestUserterms.id
            : 0;
        this.$store.commit("user/setIsMember", {
          account: this.getAccountName,
          member_since: res.block_time,
          agreed_userterms_version: termsv,
        });
      }
      this.is_transacting = false;
    },
    async unregmember() {
      let action = {
        account: this.getActiveGroup,
        name: "unregmember",
        data: {
          actor: this.getAccountName,
        },
      };
      this.is_transacting = true;
      let res = await this.$store.dispatch("proton/transact", {
        actions: [action],
        disable_signing_overlay: true,
      });
      if (res && res.trxid) {
        this.$store.commit("user/setIsMember", false);
      }
      this.is_transacting = false;
    },
  },
});
</script>
