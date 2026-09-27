<template>
  <q-layout view="lHh Lpr lFf" class="group-workspace">
    <q-header class="group-topbar">
      <q-toolbar class="group-toolbar">
        <q-btn class="group-menu-toggle" flat round dense icon="menu" aria-label="Toggle group navigation" @click="leftDrawer = !leftDrawer" />
        <router-link to="/browse#all" class="group-back"><q-icon name="arrow_back" /> Back to Browse</router-link>
        <q-space />
        <router-link to="/browse#all" class="group-search" aria-label="Search communities"><landing-icon name="search" /></router-link>
        <login-network-switcher :avatar="false" />
      </q-toolbar>
    </q-header>
    <q-drawer v-model="leftDrawer" :width="260" :breakpoint="1023" :behavior="$q.screen.width <= 1023 ? 'mobile' : 'desktop'" show-if-above class="group-drawer">
      <div class="group-sidebar">
        <router-link to="/" class="sidebar-brand" aria-label="The DAO Scape home"><landing-brand /></router-link>
        <router-link :to="`/manage/${getActiveGroup}`" class="sidebar-group"><landing-icon name="globe" /><span>{{ getActiveGroup || $route.params.groupname }}</span></router-link>
        <div class="sidebar-scroll">
          <management-menu v-if="!isMemberArea" />
          <template v-else>
            <router-link :to="`/manage/${getActiveGroup}`" class="member-management-link"><q-icon name="arrow_back" /> Group management</router-link>
            <members-menu />
          </template>
          <button class="group-reload" @click="loadGroup(getActiveGroup)" :disabled="group_is_loading"><q-spinner v-if="group_is_loading" size="22px" /><q-icon v-else name="refresh" />Reload Group</button>
        </div>
        <router-link v-if="getAccountName" :to="`/members/${getActiveGroup}/profile/${getAccountName}`" class="sidebar-profile">
          <span class="profile-monogram">{{ getAccountName.slice(0, 1).toUpperCase() }}</span><span><strong>{{ getAccountName }}</strong><small>@{{ getAccountName }}{{ activeNetwork === 'local' ? '.local' : '' }}</small></span><q-icon name="chevron_right" />
        </router-link>
        <button v-else class="sidebar-signin" @click="$store.dispatch('proton/login')">Connect wallet</button>
      </div>
    </q-drawer>
    <q-page-container class="group-page-container">
      <router-view />
      <footer class="group-footer">
        <div class="group-footer-top">
          <router-link to="/" aria-label="The DAO Scape home"><landing-brand /></router-link>
          <p>Empowering decentralized communities.</p>
          <nav aria-label="Footer navigation"><router-link to="/documentation">Docs</router-link><router-link to="/browse">Explore</router-link><a :href="appConfig.social.twitter" target="_blank" rel="noopener noreferrer">Community</a><a href="https://github.com/FreeosDAO/daoscapefrontend/issues" target="_blank" rel="noopener noreferrer">Support</a></nav>
          <div class="group-footer-social"><a :href="appConfig.social.twitter" target="_blank" rel="noopener noreferrer" aria-label="DAOScape on Twitter"><q-icon name="mdi-twitter" /></a><a :href="appConfig.social.github" target="_blank" rel="noopener noreferrer" aria-label="DAOScape on GitHub"><q-icon name="img:statics/vectors/social/027-github.svg" /></a></div>
        </div>
        <p class="group-copyright">© {{ new Date().getFullYear() }} TheDAOScape by FreeDAO. Open source.</p>
      </footer>
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapGetters } from 'vuex';
import LoginNetworkSwitcher from 'components/login/login-network-switcher.vue';
import ManagementMenu from 'components/menus/management-menu.vue';
import MembersMenu from 'components/menus/members-menu.vue';
import LandingBrand from 'components/home/landing-brand.vue';
import LandingIcon from 'components/home/landing-icon.vue';
import { notifyError } from 'src/imports/notifications';

export default {
  name: 'GroupLayout',
  components: { LoginNetworkSwitcher, ManagementMenu, MembersMenu, LandingBrand, LandingIcon },
  data() { return { leftDrawer: this.$q.screen.width > 1023, group_is_loading: false, unsubscribeTransactions: null, policyTimer: null }; },
  computed: {
    ...mapGetters({ getAccountName: 'proton/getAccountName', activeNetwork: 'proton/getActiveNetwork', appConfig: 'app/getAppConfig', getActiveGroup: 'group/getActiveGroup' }),
    isMemberArea() { return this.$route.path.startsWith('/members/'); },
  },
  mounted() {
    document.body.classList.add("dao-theme");
    this.policyTimer=setInterval(()=>{
      if(document.hidden || !this.getActiveGroup || this.group_is_loading || this.$store.getters['proton/getIsTransacting'])return;
      const payload={groupname:this.getActiveGroup,scope:this.getActiveGroup,vm:this};
      Promise.allSettled(['fetchGuardians','fetchProposals'].map(action=>this.$store.dispatch('group/'+action,payload)));
    },15000);
    this.unsubscribeTransactions = this.$store.subscribeAction({ after: action => {
      if (action.type === 'proton/transact' && this.getActiveGroup) this.loadGroup(this.getActiveGroup);
    } });
  },
  beforeUnmount() { clearInterval(this.policyTimer); document.body.classList.remove("dao-theme"); if (this.unsubscribeTransactions) this.unsubscribeTransactions(); },
  watch: {
    getAccountName() { if(this.getActiveGroup)this.loadGroup(this.getActiveGroup); },
    '$q.screen.width'(width, previous) { if (width <= 1023 && previous > 1023) this.leftDrawer = false; },
    '$route.path'() { if (this.$q.screen.width <= 1023) this.leftDrawer = false; },
    '$route.params.groupname': { immediate: true, handler(group, previous) { if (group && group !== previous) this.loadGroup(group); } },
  },
  methods: {
    async loadGroup(groupname) {
      if (!groupname) return;
      this.group_is_loading = true;
      try {
        await this.$store.dispatch('group/loadGroupRoutine', { groupname, vm: this });
        this.$q.addressbarColor.set('#f8f7f4');
      } catch (error) { notifyError({ message: 'Could not reload this group. Please try again.' }); }
      finally { this.group_is_loading = false; }
    },
  },
};
</script>

<style scoped src="../css/group-workspace.scss" lang="scss"></style>

<style src="../css/dao-workspace.scss" lang="scss"></style>
