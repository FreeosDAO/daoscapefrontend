<template>
  <q-page class="group-overview">
    <template v-if="getActiveGroupConfig">
      <section class="group-hero" aria-labelledby="group-title">
        <img class="group-hero-art" src="~assets/group-marble-hero.png" alt="" />
        <div class="group-avatar"><img v-if="getActiveGroupConfig.ui.logo && !logoFailed" :src="getActiveGroupConfig.ui.logo" :alt="`${getActiveGroup} logo`" @error="logoFailed = true" /><svg v-else viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="32" cy="32" r="29" /><ellipse cx="32" cy="32" rx="14" ry="29" /><path d="M32 3v58M3 32h58M7 17h50M7 47h50" /></svg></div>
        <div class="group-hero-copy">
          <p class="group-eyebrow">Group account</p>
          <h1 id="group-title">{{ getActiveGroupConfig.username || getActiveGroup }}</h1>
          <a v-if="explorerUrl" :href="explorerUrl" target="_blank" rel="noopener noreferrer" class="group-account-link"><q-icon name="link" />View @{{ getActiveGroup }}</a>
          <p class="group-hero-description">{{ about }}</p>
          <div v-if="!getIsMember && getCoreConfig && getCoreConfig.conf.userterms" class="group-terms"><router-link :to="`/manage/${getActiveGroup}/files`">Read the group’s user terms</router-link><q-checkbox v-model="agree_terms" label="I agree to the user terms" size="sm" /></div>
          <div class="group-hero-actions">
            <router-link class="overview-button overview-primary" :to="`/manage/${getActiveGroup}/proposals`">Enter Group <landing-icon name="arrow" /></router-link>
            <button v-if="memberRegistration" class="overview-button overview-secondary" :disabled="is_transacting" @click="changeMembership(!getIsMember)"><q-spinner v-if="is_transacting" size="18px" />{{ getIsMember ? 'Unregister' : 'Become a Member' }}</button>
          </div>
        </div>
        <div class="group-created"><span>Created</span><span :title="getActiveGroupConfig.creation_date">{{ createdAgo }}</span></div>
        <q-btn class="group-more" flat round dense icon="more_vert" aria-label="Group options"><q-menu><q-list style="min-width: 190px"><q-item clickable v-close-popup @click="copyText(getActiveGroup)"><q-item-section>Copy account name</q-item-section></q-item><q-item v-if="allowed_to_edit" clickable v-close-popup @click="editAboutOpen = true"><q-item-section>Edit about</q-item-section></q-item><q-item v-if="allowed_to_edit" clickable v-close-popup :to="logoEditUrl"><q-item-section>Edit group logo</q-item-section></q-item></q-list></q-menu></q-btn>
      </section>
      <section class="group-summary" aria-label="Community overview">
        <router-link v-if="memberRegistration" class="overview-stat" :to="`/manage/${getActiveGroup}/members`"><q-icon name="groups" /><div><h2>Members</h2><p>People in this DAO</p><strong>{{ getCoreState ? getCoreState.state.member_count : '—' }}</strong></div><q-icon name="chevron_right" class="stat-arrow" /></router-link>
        <router-link class="overview-stat" :to="`/manage/${getActiveGroup}/guardians`"><q-icon name="vpn_key" /><div><h2>Guardians</h2><p>Trusted signers</p><strong>{{ getNumberGuardians }}</strong></div><q-icon name="chevron_right" class="stat-arrow" /></router-link>
        <div v-if="maintainer" class="overview-stat maintainer-stat"><q-icon name="settings" /><div><h2>Maintainer Account</h2><p>Manages group settings</p><span class="maintainer-value">{{ maintainer }}</span></div><button class="copy-maintainer" aria-label="Copy maintainer account" @click="copyText(maintainer)"><q-icon name="content_copy" /></button></div>
        <router-link v-if="getElectionsState" class="overview-stat" :to="`/members/${getActiveGroup}/elections`"><q-icon name="how_to_vote" /><div><h2>Candidates</h2><p>Active election candidates</p><strong>{{ getElectionsState.active_candidate_count }}</strong></div><q-icon name="chevron_right" class="stat-arrow" /></router-link>
      </section>
      <div class="group-info-grid">
        <section class="overview-panel group-about" aria-labelledby="about-title">
          <div class="overview-panel-heading"><h2 id="about-title">About</h2><button v-if="allowed_to_edit" class="about-edit" @click="editAboutOpen = true"><q-icon name="edit" />Edit</button></div>
          <q-markdown class="group-about-copy" :src="about" :no-abbreviation="false" />
          <group-links v-if="getActiveGroupConfig.meta.links.length" :links="getActiveGroupConfig.meta.links" />
          <dl class="group-facts">
            <div><dt><q-icon name="event" />Created</dt><dd :title="getActiveGroupConfig.creation_date">{{ createdAgo }}</dd></div>
            <div><dt><landing-icon name="globe" />Group Type</dt><dd>{{ networkLabel }}</dd></div>
            <div><dt><q-icon name="description" />Proposals</dt><dd>{{ proposalCount }}</dd></div>
            <div><dt><q-icon name="sell" />Tags</dt><dd class="overview-tags"><span v-for="tag in getActiveGroupConfig.tags" :key="tag">{{ tag }}</span><small v-if="!getActiveGroupConfig.tags.length">No tags yet</small></dd></div>
            <div><dt><q-icon name="insert_drive_file" />Files</dt><dd>{{ fileCount === null ? '—' : `${fileCount}${moreFiles ? '+' : ''}` }}</dd></div>
          </dl>
        </section>
        <section class="overview-panel" aria-labelledby="actions-title">
          <div class="overview-panel-heading"><h2 id="actions-title">Quick Actions</h2></div>
          <div class="quick-actions">
            <router-link v-for="action in quickActions" :key="action.path" :to="`/manage/${getActiveGroup}/${action.path}`"><span class="quick-action-icon"><q-icon :name="action.icon" /></span><span class="quick-action-copy"><strong>{{ action.title }}</strong><small>{{ action.description }}</small></span><q-icon name="chevron_right" class="quick-action-arrow" /></router-link>
          </div>
        </section>
      </div>
      <div v-if="getElectionsContract" class="overview-panel election-panel"><new-election-timer /></div>
      <q-dialog v-model="editAboutOpen"><q-card class="about-edit-dialog"><q-card-section class="row items-center justify-between"><h2>Edit About</h2><q-btn flat round icon="close" aria-label="Close about editor" v-close-popup /></q-card-section><q-card-section><p>Changes are submitted as a proposal for your DAO to approve.</p><update-about /></q-card-section></q-card></q-dialog>
    </template>
    <div v-else class="overview-loading" role="status"><q-spinner size="32px" /><span>Loading your community...</span></div>
  </q-page>
</template>
<script>
import { mapGetters } from 'vuex';
import { copyToClipboard } from 'quasar';
import LandingIcon from 'components/home/landing-icon.vue';
import GroupLinks from 'components/group-links.vue';
import UpdateAbout from 'components/actions/update-about.vue';
import NewElectionTimer from 'components/modules/elections/new-election-timer.vue';
import { relativeTimeDelta } from 'src/imports/helpers';
import { notifyError, notifySuccess } from 'src/imports/notifications';

export default {
  name: 'GroupOverview',
  components: { LandingIcon, GroupLinks, UpdateAbout, NewElectionTimer },
  data: () => ({ agree_terms: false, is_transacting: false, editAboutOpen: false, logoFailed: false, fileCount: null, moreFiles: false }),
  computed: {
    ...mapGetters({ getAccountName: 'proton/getAccountName', activeNetwork: 'proton/getActiveNetwork', appConfig: 'app/getAppConfig', getActiveGroup: 'group/getActiveGroup', getActiveGroupConfig: 'group/getActiveGroupConfig', getCoreConfig: 'group/getCoreConfig', getCoreState: 'group/getCoreState', getNumberGuardians: 'group/getNumberGuardians', getSelectedBlockExplorer: 'user/getSelectedBlockExplorer', getElectionsContract: 'elections/getElectionsContract', getElectionsState: 'elections/getElectionsState', getIsGuardian: 'group/getIsGuardian', getIsMember: 'user/getIsMember', getLatestUserterms: 'group/getLatestUserterms', proposals: 'group/getProposals' }),
    allowed_to_edit() { return !!this.getIsGuardian(this.getAccountName); },
    memberRegistration() { return !!this.getCoreConfig?.conf?.member_registration; },
    about() { return this.getActiveGroupConfig?.meta?.about || 'A community building its future together.'; },
    createdAgo() { const value = this.getActiveGroupConfig?.creation_date; return value ? relativeTimeDelta(Date.parse(value.endsWith('Z') ? value : `${value}Z`)) : '—'; },
    explorerUrl() { const explorer = this.getSelectedBlockExplorer; return explorer ? `${explorer.base}${explorer.account}${this.getActiveGroup}` : ''; },
    maintainer() { const account = this.getCoreConfig?.conf?.maintainer_account; return account?.actor ? `${account.actor}@${account.permission}` : ''; },
    networkLabel() { return { local: 'Local (testing)', proton: 'XPR Network', protonTest: 'XPR Testnet' }[this.activeNetwork] || this.activeNetwork; },
    proposalCount() { const lists = Object.values(this.proposals || {}); return lists.length && lists.every(Array.isArray) ? lists.reduce((count, list) => count + list.length, 0) : '—'; },
    logoEditUrl() { return { path: `/manage/${this.getActiveGroup}/new-proposal`, query: { action: 'updatelogo', contract: this.appConfig.groups_contract, groupname: this.getActiveGroup } }; },
    quickActions() {
      const actions = [{ path: 'new-proposal', title: 'Create a Proposal', description: 'Start a new discussion or decision', icon: 'description' }];
      if (this.allowed_to_edit) actions.push({ path: 'treasury', title: 'View Treasury', description: 'See assets and transactions', icon: 'account_balance_wallet' });
      actions.push({ path: 'members', title: this.allowed_to_edit ? 'Manage Members' : 'View Members', description: this.allowed_to_edit ? 'Invite, remove or assign roles' : 'Meet the people in this DAO', icon: 'group' });
      if (this.allowed_to_edit) actions.push({ path: 'modules', title: 'Configure Group', description: 'Thresholds, permissions and settings', icon: 'settings' });
      return actions;
    },
  },
  watch: {
    getActiveGroupConfig: { immediate: true, handler(config) { if (config?.groupname) this.loadFileCount(config.groupname); } },
  },
  methods: {
    async loadFileCount(group) {
      this.fileCount = null;
      try { const result = await this.$eos.api.rpc.get_table_by_scope({ code: group, table: 'dacfiles', limit: 1000 }); if (group === this.getActiveGroup) { this.fileCount = result.rows.reduce((sum, scope) => sum + Number(scope.count), 0); this.moreFiles = !!result.more; } }
      catch (error) { this.fileCount = null; }
    },
    async copyText(text) {
      try { await copyToClipboard(text); notifySuccess({ message: 'Copied to clipboard' }); }
      catch (error) { notifyError({ message: 'Could not copy to clipboard.' }); }
    },
    async changeMembership(register) {
      if (!this.getAccountName) { this.$store.dispatch('proton/login'); return; }
      const needsTerms = !!this.getCoreConfig?.conf?.userterms;
      if (register && needsTerms && !this.agree_terms) { notifyError({ message: 'Please agree to the terms to become a member.' }); return; }
      const actions = [{ account: this.getActiveGroup, name: register ? 'regmember' : 'unregmember', data: { actor: this.getAccountName } }];
      if (register && needsTerms) actions.push({ account: this.getActiveGroup, name: 'signuserterm', data: { member: this.getAccountName, agree_terms: this.agree_terms } });
      this.is_transacting = true;
      try {
        const result = await this.$store.dispatch('proton/transact', { actions, disable_signing_overlay: true });
        if (result?.trxid) this.$store.commit('user/setIsMember', register ? { account: this.getAccountName, member_since: result.block_time, agreed_userterms_version: this.agree_terms ? this.getLatestUserterms?.id || 0 : 0 } : false);
      } catch (error) { notifyError({ message: error.message || 'Could not update membership.' }); }
      finally { this.is_transacting = false; }
    },
  },
};
</script>
<style scoped src="../../css/group-overview.scss" lang="scss"></style>
