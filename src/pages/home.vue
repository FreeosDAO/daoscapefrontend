<template>
  <q-page class="landing-page">
    <section class="landing-hero" aria-labelledby="landing-title">
      <img class="hero-art" src="~assets/daoscape-hero.png" alt="" fetchpriority="high" />
      <header class="landing-header">
        <router-link to="/" class="brand-link" aria-label="The DAO Scape home"><landing-brand /></router-link>
        <nav class="desktop-navigation" aria-label="Main navigation">
          <router-link to="/browse">Explore</router-link><router-link to="/create">Create</router-link><router-link to="/documentation">Learn</router-link>
          <a :href="social.twitter" target="_blank" rel="noopener noreferrer">Community</a>
        </nav>
        <div class="header-actions">
          <router-link class="icon-button search-button" to="/browse" aria-label="Find a DAO"><landing-icon name="search" /></router-link>
          <button class="wallet-button" @click="connectWallet">
            {{ accountName ? `${isLocal ? 'Local · ' : ''}${accountName}` : 'Connect Wallet' }}
            <q-menu v-if="accountName" class="landing-menu">
              <q-list style="min-width: 200px">
                <q-item><q-item-section><q-item-label>{{ accountName }}</q-item-label><q-item-label caption>{{ isLocal ? 'Local development chain' : activeNetwork }}</q-item-label></q-item-section></q-item>
                <q-separator />
                <q-item clickable v-close-popup @click="$store.dispatch('proton/logout')"><q-item-section>Disconnect wallet</q-item-section></q-item>
              </q-list>
            </q-menu>
          </button>
          <button class="icon-button menu-button" aria-label="Open navigation menu">
            <landing-icon name="menu" />
            <q-menu class="landing-menu" anchor="bottom right" self="top right">
              <q-list style="min-width: 210px">
                <q-item clickable v-close-popup to="/browse"><q-item-section>Explore DAOs</q-item-section></q-item>
                <q-item clickable v-close-popup to="/create"><q-item-section>Create a community</q-item-section></q-item>
                <q-item clickable v-close-popup to="/documentation"><q-item-section>Learn about DAOScape</q-item-section></q-item>
                <q-item clickable v-close-popup :href="social.twitter" target="_blank" rel="noopener noreferrer"><q-item-section>Community</q-item-section></q-item>
              </q-list>
            </q-menu>
          </button>
        </div>
      </header>
      <div class="hero-content">
        <div class="eyebrow">A more open tomorrow <span class="eyebrow-rule" /></div>
        <h1 id="landing-title">Enter the<br />DAO Scape</h1>
        <p class="hero-description">Create, explore, and govern decentralized<br class="desktop-break" /> communities — on your terms.</p>
        <div class="hero-actions">
          <router-link class="landing-button primary-button" to="/create">Start As Group <landing-icon name="arrow" /></router-link>
          <router-link class="landing-button secondary-button" to="/browse">Explore DAOs</router-link>
        </div>
        <div class="hero-principles">
          <div><landing-icon name="database" /><span>Decentralized<br />by design</span></div>
          <div><landing-icon name="globe" /><span>Global<br />communities</span></div>
          <div><landing-icon name="shield" /><span>Censorship<br />resistant</span></div>
        </div>
      </div>
      <p class="hero-annotation annotation-top">People<br />Ideas<br />Governance<br />A brighter<br />tomorrow<span /></p>
      <p class="hero-annotation annotation-bottom">Real<br />people<br />Real<br />ownership<span /></p>
    </section>
    <section class="landing-comparison" aria-labelledby="comparison-title">
      <div class="comparison-intro">
        <div class="eyebrow">Built for a more open world <span class="eyebrow-rule" /></div>
        <h2 id="comparison-title">Empowerment of Decentralized Communities</h2>
        <p>A new generation of DAOs. More freedom. More possibilities.</p>
      </div>
      <div class="comparison-scroll" tabindex="0" role="region" aria-label="DAO platform comparison">
        <table class="landing-comparison-table">
          <caption class="sr-only">DAOScape features compared with other DAO platforms, whose features vary.</caption>
          <colgroup><col class="feature-column" /><col class="daoscape-column" /><col /></colgroup>
          <thead><tr>
            <td />
            <th scope="col" class="daoscape-cell"><landing-brand /><span class="table-subtitle">Democratic · no tokens required*</span></th>
            <th scope="col"><span class="other-dao-title"><landing-icon name="database" />Other DAOs</span><span class="table-subtitle">Often based on token-weighted voting</span></th>
          </tr></thead>
          <tbody>
            <tr v-for="feature in features" :key="feature.label">
              <th scope="row">{{ feature.label }}</th>
              <td class="daoscape-cell"><landing-icon :name="feature.included ? 'check' : 'close'" :class="{ 'muted-icon': !feature.included }" /><span class="sr-only">{{ feature.included ? 'Yes' : 'No' }}</span></td>
              <td class="other-dao-value">{{ feature.other }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="comparison-footnote">*If desired, DAOs may use token-weighted voting, but this is not required, nor the default state for the DAO. Other platforms’ features vary.</p>
    </section>
    <section class="landing-facts" aria-label="Built for community governance">
      <div class="fact"><span class="fact-number">100<span>%</span></span><span>On-chain governance</span></div>
      <div class="fact"><span class="fact-number">0</span><span>Tokens required to vote</span></div>
      <div class="fact"><span class="fact-number">3</span><span>Governance modules</span></div>
      <div class="fact"><span class="fact-number">∞</span><span>Possibilities, together</span></div>
      <div class="facts-note"><span />Communities<br />create a brighter<br />tomorrow</div>
    </section>
    <footer class="landing-footer">
      <div class="footer-main">
        <router-link to="/" class="brand-link" aria-label="The DAO Scape home"><landing-brand /></router-link>
        <nav class="footer-navigation" aria-label="Footer navigation">
          <router-link to="/documentation">Docs</router-link><router-link to="/browse">Explore</router-link>
          <a :href="social.twitter" target="_blank" rel="noopener noreferrer">Community</a>
          <a :href="social.github" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://github.com/FreeosDAO/daoscapefrontend/issues" target="_blank" rel="noopener noreferrer">Support</a>
        </nav>
        <div class="footer-social">
          <a :href="social.twitter" target="_blank" rel="noopener noreferrer" aria-label="DAOScape on Twitter"><q-icon name="mdi-twitter" /></a>
          <a :href="social.github" target="_blank" rel="noopener noreferrer" aria-label="DAOScape on GitHub"><q-icon class="github-icon" name="img:statics/vectors/social/027-github.svg" /></a>
          <router-link to="/browse" aria-label="Explore communities"><landing-icon name="globe" /></router-link>
        </div>
        <p class="footer-tagline">Open governance<br />for a more human internet.</p>
      </div>
      <div class="footer-bottom"><p>© {{ year }} TheDAOScape by FreeDAO. Open source. For a more decentralized future.</p><span>Built for all of us.</span></div>
    </footer>
  </q-page>
</template>
<script>
import { mapGetters } from 'vuex';
import LandingBrand from 'components/home/landing-brand.vue';
import LandingIcon from 'components/home/landing-icon.vue';
export default {
  name: 'PageIndex',
  components: { LandingBrand, LandingIcon },
  data() {
    return {
      year: new Date().getFullYear(),
      features: [
        { label: 'Token-free voting', included: true, other: 'Not always' },
        { label: 'Modular', included: true, other: 'Varies' },
        { label: '100% on chain', included: true, other: 'Varies' },
        { label: 'Centralized API required', included: false, other: 'Varies' },
        { label: 'Trustless & permissionless', included: true, other: 'Varies' },
        { label: 'Censorship resistance', included: true, other: 'Varies' },
      ],
    };
  },
  computed: {
    ...mapGetters({ accountName: 'proton/getAccountName', activeNetwork: 'proton/getActiveNetwork', appConfig: 'app/getAppConfig' }),
    isLocal() { return this.activeNetwork === 'local'; },
    social() { return this.appConfig.social; },
  },
  methods: {
    connectWallet() {
      if (!this.accountName) this.$store.dispatch('proton/login');
    },
  },
};
</script>
<style scoped src="../css/landing.scss" lang="scss"></style>
<style>
.landing-menu { background: #f8f7f4; color: #18251c; border: 1px solid #d9ded5; border-radius: 12px; }
</style>
