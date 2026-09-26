<template>
  <q-page class="login-page">
    <header class="login-header">
      <router-link to="/" aria-label="The DAO Scape home"><landing-brand /></router-link>
      <nav aria-label="Main navigation"><router-link to="/browse#all">Explore DAOs</router-link><router-link to="/documentation">Learn</router-link></nav>
    </header>
    <div class="login-main">
      <section class="login-content" aria-labelledby="login-title">
        <router-link to="/browse#all" class="login-back"><q-icon name="arrow_back" /> Back to Browse</router-link>
        <div class="login-form">
          <p class="login-eyebrow">A more open tomorrow</p>
          <h1 id="login-title">Welcome back.</h1>
          <p class="login-intro">Your community. Your voice.<br />Connect to help shape what comes next.</p>
          <div class="login-connect-card">
            <div class="login-network"><span class="login-network-icon"><q-icon :name="isLocal ? 'computer' : 'account_balance_wallet'" /></span><div><strong>{{ networkLabel }}</strong><span>{{ isLocal ? 'Your local development workspace' : 'Connect with your XPR Network wallet' }}</span></div><span class="login-network-dot" aria-hidden="true" /></div>
            <template v-if="accountName">
              <p class="login-account">Signed in as <strong>{{ accountName }}</strong></p>
              <q-btn class="login-connect" unelevated color="primary" :label="`Continue as ${accountName}`" icon-right="arrow_forward" :to="destination" />
              <button class="login-switch" :disabled="connecting" @click="connect">Use another account</button>
            </template>
            <template v-else>
              <q-select v-if="!isLocal && networkOptions.length > 1" :model-value="network" :options="networkOptions" emit-value map-options outlined label="Network" class="q-mb-lg" @update:model-value="selectNetwork" />
              <q-btn class="login-connect" unelevated color="primary" :label="connectLabel" :loading="connecting" icon-right="arrow_forward" @click="connect" />
            </template>
            <p class="login-helper">{{ loginHelper }}</p>
            <p v-if="connectionError" class="login-error" role="alert">{{ connectionError }}</p>
          </div>
          <div class="login-note"><q-icon name="mdi-shield-check-outline" /><span>{{ isLocal ? 'Test accounts connect only to your private local chain.' : 'You stay in control. Your wallet asks you to approve each transaction.' }}</span></div>
        </div>
      </section>
      <aside class="login-art" aria-label="Empowering decentralized communities">
        <img src="~assets/group-marble-hero.png" alt="Sculptural green and ivory marble forms" />
        <div class="login-art-copy"><p>Built for a more open world</p><h2>Good things happen<br />when we build together.</h2><span>People. Ideas. Collective possibility.</span></div>
      </aside>
    </div>
    <footer class="login-footer"><span>© {{ new Date().getFullYear() }} TheDAOScape by FreeDAO.</span><span>Open source. Open governance.</span><a :href="appConfig.social.github" target="_blank" rel="noopener noreferrer">GitHub <q-icon name="north_east" /></a></footer>
  </q-page>
</template>
<script>
import { mapGetters } from 'vuex';
import LandingBrand from 'components/home/landing-brand.vue';
export default {
  name: 'LoginPage',
  components: { LandingBrand },
  data: () => ({ connecting: false, connectionError: '', networkOptions: [{ label: 'XPR Network', value: 'proton' }, ...(!process.env.PROD ? [{ label: 'XPR Testnet', value: 'protonTest' }] : [])] }),
  computed: {
    ...mapGetters({ accountName: 'proton/getAccountName', network: 'proton/getActiveNetwork', endpoints: 'proton/getRpcEndpoints', appConfig: 'app/getAppConfig' }),
    isLocal() { return process.env.LOCAL_CHAIN && this.network === 'local'; },
    loginHelper() { return process.env.LOCAL_CHAIN ? 'Sign in with Alice, Bob, or Carol to explore and test your DAO.' : 'Your wallet is your identity. No separate password is needed.'; },
    connectLabel() { return process.env.LOCAL_CHAIN ? 'Choose local account' : 'Connect wallet'; },
    networkLabel() { return this.isLocal ? 'Local network' : this.network === 'protonTest' ? 'XPR Testnet' : 'XPR Network'; },
    destination() {
      const redirect = this.$route.query.redirect;
      return typeof redirect === 'string' && /^\/(manage|members|browse|create)(\/|\?|#|$)/.test(redirect) ? redirect : '/browse#all';
    },
  },
  mounted() { document.body.classList.add('dao-theme'); this.$q.addressbarColor.set('#faf9f7'); },
  beforeUnmount() { document.body.classList.remove('dao-theme'); },
  methods: {
    selectNetwork(value) { this.$store.commit('proton/setActiveNetwork', value); this.$eos.build(this.endpoints); },
    async connect() {
      if (this.connecting) return;
      this.connecting = true; this.connectionError = '';
      try {
        await this.$store.dispatch('proton/login');
        if (this.accountName) await this.$router.replace(this.destination);
      } catch (error) { this.connectionError = /pop-ups|window closed/i.test(error?.message || '') ? error.message : 'Wallet connection was not completed. Please try again.'; }
      finally { this.connecting = false; }
    },
  },
};
</script>
<style scoped src="../css/login.scss" lang="scss"></style>
<style src="../css/dao-workspace.scss" lang="scss"></style>
