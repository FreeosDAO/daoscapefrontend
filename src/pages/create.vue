<template>
  <q-page class="create-page">
    <header class="create-header">
      <router-link to="/" aria-label="The DAO Scape home"><landing-brand /></router-link>
      <nav aria-label="Main navigation"><router-link to="/browse#all">Browse</router-link><router-link to="/create" aria-current="page">Create</router-link><router-link to="/documentation">Learn</router-link></nav>
      <login-network-switcher />
    </header>
    <div class="create-main">
      <router-link to="/browse#all" class="create-back"><q-icon name="arrow_back" /> Back to Browse</router-link>
      <div class="create-intro"><p>Create a DAO</p><h1>Build something together.</h1><span>A community of your own. A future you decide.</span></div>
      <new-group :prefill="{ group_account_name: $route.params.newgroupname }" />
    </div>
    <footer class="create-footer"><landing-brand /><span>Empowering decentralized communities.</span><nav aria-label="Footer navigation"><router-link to="/documentation">Docs</router-link><a :href="appConfig.social.github" target="_blank" rel="noopener noreferrer">GitHub</a></nav><small>© {{ new Date().getFullYear() }} TheDAOScape by FreeDAO. Open source.</small></footer>
  </q-page>
</template>
<script>
import { mapGetters } from 'vuex';
import NewGroup from 'components/new-group.vue';
import LandingBrand from 'components/home/landing-brand.vue';
import LoginNetworkSwitcher from 'components/login/login-network-switcher.vue';
export default {
  name: 'CreatePage',
  components: { NewGroup, LandingBrand, LoginNetworkSwitcher },
  computed: { ...mapGetters({ appConfig: 'app/getAppConfig' }) },
  mounted() { document.body.classList.add('dao-theme'); this.$q.addressbarColor.set('#17272b'); },
  beforeUnmount() { document.body.classList.remove('dao-theme'); },
};
</script>
<style scoped src="../css/create-page.scss" lang="scss"></style>
<style src="../css/dao-workspace.scss" lang="scss"></style>
