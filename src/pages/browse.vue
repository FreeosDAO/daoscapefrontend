<template>
  <q-page class="dao-browser">
    <header class="browse-header">
      <div class="browse-header-inner">
        <router-link to="/" aria-label="The DAO Scape home" class="browse-brand"><landing-brand /></router-link>
        <nav class="browse-navigation" aria-label="Main navigation">
          <router-link to="/browse" aria-current="page" class="active">Browse</router-link>
          <router-link to="/create">Create</router-link>
          <router-link to="/documentation">Learn</router-link>
        </nav>
        <div class="browse-header-actions">
          <button class="header-search" aria-label="Search DAOs" @click="$refs.searchInput.focus()"><landing-icon name="search" /></button>
          <login-network-switcher :avatar="false" />
        </div>
      </div>
    </header>
    <div class="browse-body">
      <div class="browse-backdrop" aria-hidden="true" />
      <section class="browse-content" aria-label="Browse communities">
        <div class="browse-intro">
          <p class="browse-eyebrow">Browse DAOs</p>
          <h1>Find your community</h1>
          <p class="browse-subtitle">Explore, join, and help shape decentralized communities around the world.</p>
        </div>
        <div class="browse-search-row">
          <div class="browse-search-field">
            <landing-icon name="search" />
            <input ref="searchInput" v-model="searchfilter" type="search" placeholder="Find a group..." aria-label="Find a group" />
          </div>
          <button class="browse-filter-button" :class="{ selected: filtersActive }" aria-label="Filter and sort DAOs" :aria-expanded="filtersOpen" @click="filtersOpen = !filtersOpen"><q-icon name="tune" /><span v-if="filtersActive" class="filter-dot" /></button>
        </div>
        <div v-if="filtersOpen" class="browse-filters">
          <label>Sort by<select v-model="sortBy"><option value="name">Name (A–Z)</option><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label>
          <label>Community tag<select v-model="tagFilter"><option value="">All tags</option><option v-for="tag in availableTags" :key="tag" :value="tag">{{ tag }}</option></select></label>
          <button class="filter-reset" @click="resetFilters">Reset filters</button>
        </div>
        <nav class="browse-tabs" aria-label="DAO collections">
          <router-link to="/browse#all" :class="{ active: !isFavourites }" :aria-current="!isFavourites ? 'page' : undefined">All ({{ activeGroups.length }})</router-link>
          <router-link to="/browse#favourites" :class="{ active: isFavourites }" :aria-current="isFavourites ? 'page' : undefined"><q-icon name="star" /> Favourites ({{ favouriteCount }})</router-link>
        </nav>
        <div v-if="loading" class="browse-empty" role="status"><q-spinner size="28px" /><p>Loading communities...</p></div>
        <div v-else-if="loadError" class="browse-empty" role="alert"><q-icon name="cloud_off" size="32px" /><h2>Couldn’t load communities</h2><p>Check your connection and try again.</p><button class="browse-retry" @click="loadGroups">Try again</button></div>
        <div v-else-if="!filteredGroups.length" class="browse-empty" role="status">
          <q-icon :name="isFavourites && !searchfilter ? 'star_border' : 'search'" size="36px" />
          <h2>{{ isFavourites && !searchfilter ? 'Your favourites start here' : 'No communities found' }}</h2>
          <p>{{ isFavourites && !searchfilter ? 'Save a community using the star on its card.' : 'Try another name, description, or community tag.' }}</p>
          <button class="browse-retry" @click="showAll">Explore all DAOs</button>
        </div>
        <div v-else class="dao-card-grid" aria-label="DAO results">
          <group-card v-for="group in filteredGroups" :key="`${activeNetwork}:${group.groupname}`" :group="group" />
        </div>
      </section>
    </div>
    <footer class="browse-footer">
      <div class="browse-footer-inner">
        <div class="browse-footer-top">
          <router-link to="/" class="browse-brand" aria-label="The DAO Scape home"><landing-brand /></router-link>
          <nav aria-label="Footer navigation"><router-link to="/documentation">Docs</router-link><router-link to="/create">Create</router-link><a :href="appConfig.social.twitter" target="_blank" rel="noopener noreferrer">Community</a><a href="https://github.com/FreeosDAO/daoscapefrontend/issues" target="_blank" rel="noopener noreferrer">Support</a></nav>
          <div class="browse-social"><a :href="appConfig.social.twitter" target="_blank" rel="noopener noreferrer" aria-label="DAOScape on Twitter"><q-icon name="mdi-twitter" /></a><a :href="appConfig.social.github" target="_blank" rel="noopener noreferrer" aria-label="DAOScape on GitHub"><q-icon name="img:statics/vectors/social/027-github.svg" /></a></div>
          <p>Empowering decentralized communities.</p>
        </div>
        <div class="browse-footer-bottom"><span>© {{ year }} TheDAOScape by FreeDAO. Open source.</span><span>Built for all of us.</span></div>
      </div>
    </footer>
  </q-page>
</template>
<script>
import { mapGetters } from 'vuex';
import GroupCard from 'components/group-card.vue';
import LandingBrand from 'components/home/landing-brand.vue';
import LandingIcon from 'components/home/landing-icon.vue';
import LoginNetworkSwitcher from 'components/login/login-network-switcher.vue';

export default {
  name: 'BrowseDaos',
  components: { GroupCard, LandingBrand, LandingIcon, LoginNetworkSwitcher },
  data: () => ({ searchfilter: '', filtersOpen: false, sortBy: 'name', tagFilter: '', loading: true, loadError: false, year: new Date().getFullYear() }),
  computed: {
    ...mapGetters({ groups: 'app/getGroups', favourites: 'user/getFavouriteGroups', activeNetwork: 'proton/getActiveNetwork', appConfig: 'app/getAppConfig' }),
    activeGroups() { return (this.groups || []).filter(group => group.state > 0); },
    favouriteCount() { return this.activeGroups.filter(group => this.favourites.includes(group.groupname)).length; },
    isFavourites() { return this.$route.hash === '#favourites'; },
    availableTags() { return [...new Set(this.activeGroups.flatMap(group => group.tags || []))].sort(); },
    filtersActive() { return this.sortBy !== 'name' || !!this.tagFilter; },
    filteredGroups() {
      const query = this.searchfilter.trim().toLocaleLowerCase();
      return this.activeGroups.filter(group => {
        if (this.isFavourites && !this.favourites.includes(group.groupname)) return false;
        if (this.tagFilter && !(group.tags || []).includes(this.tagFilter)) return false;
        return [group.groupname, group.meta?.title, group.meta?.about, ...(group.tags || [])].some(value => (value || '').toLocaleLowerCase().includes(query));
      }).sort((a, b) => {
        if (this.sortBy === 'name') return a.groupname.localeCompare(b.groupname);
        const order = (a.creation_date || '').localeCompare(b.creation_date || '');
        return this.sortBy === 'newest' ? -order : order;
      });
    },
  },
  methods: {
    resetFilters() { this.sortBy = 'name'; this.tagFilter = ''; },
    showAll() { this.searchfilter = ''; this.resetFilters(); this.$router.push('/browse#all'); },
    async loadGroups() {
      this.loading = true; this.loadError = false;
      try { await this.$store.dispatch('app/fetchGroups', { vm: this }); }
      catch (error) { this.loadError = true; }
      finally { this.loading = false; }
    },
  },
  watch: { activeNetwork: { immediate: true, handler() { this.loadGroups(); } } },
  mounted() { if (!['#all', '#favourites'].includes(this.$route.hash)) this.$router.replace('/browse#all'); },
};
</script>
<style scoped src="../css/browse.scss" lang="scss"></style>
