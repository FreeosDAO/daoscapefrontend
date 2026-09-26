<template>
  <article class="dao-card">
    <div class="dao-card-banner">
      <img class="dao-card-art" src="~assets/dao-card-art.png" alt="" loading="lazy" />
      <img v-if="group.ui && group.ui.logo && !logoFailed" :src="group.ui.logo" :alt="`${group.groupname} logo`" class="dao-card-logo" @error="logoFailed = true" />
      <button class="dao-favourite" :class="{ saved: isFavourite }" :aria-label="`${isFavourite ? 'Remove' : 'Save'} ${group.groupname} ${isFavourite ? 'from' : 'to'} favourites`" :aria-pressed="isFavourite" @click="$store.commit('user/setFavouriteGroups', group.groupname)"><q-icon :name="isFavourite ? 'star' : 'star_border'" /></button>
    </div>
    <div class="dao-card-content">
      <h2>{{ group.groupname }}</h2>
      <p class="dao-card-description">{{ description }}</p>
      <div class="dao-card-stats">
        <span :title="members === null ? 'Member count unavailable' : 'Registered members'"><q-icon name="group" />{{ members === null ? '— members' : `${members} ${members === 1 ? 'member' : 'members'}` }}</span>
        <span title="Active, executed and cancelled proposals"><q-icon name="description" />{{ proposals === null ? '— proposals' : `${proposals}${moreProposals ? '+' : ''} ${proposals === 1 && !moreProposals ? 'proposal' : 'proposals'}` }}</span>
        <span><landing-icon name="globe" />{{ networkLabel }}</span>
      </div>
      <div class="dao-card-actions">
        <button class="dao-details-button" @click="detailsOpen = true">View Details</button>
        <router-link v-if="!customUrl" class="dao-visit-button" :to="`/manage/${group.groupname}`">Visit Group <landing-icon name="arrow" /></router-link>
        <a v-else class="dao-visit-button" :href="customUrl" target="_blank" rel="noopener noreferrer">Visit Group <landing-icon name="arrow" /></a>
      </div>
    </div>
    <q-dialog v-model="detailsOpen">
      <q-card class="dao-details-dialog">
        <div class="dao-details-heading"><div><p>Community details</p><h2>{{ group.groupname }}</h2></div><q-btn flat round icon="close" aria-label="Close community details" v-close-popup /></div>
        <h3 v-if="group.meta && group.meta.title">{{ group.meta.title }}</h3>
        <p class="dao-details-description">{{ description }}</p>
        <dl><div><dt>Network</dt><dd>{{ networkLabel }}</dd></div><div><dt>Created by</dt><dd>{{ group.creator }}</dd></div><div><dt>Members</dt><dd>{{ members === null ? 'Unavailable' : members }}</dd></div><div><dt>Proposals</dt><dd>{{ proposals === null ? 'Unavailable' : `${proposals}${moreProposals ? '+' : ''}` }}</dd></div></dl>
        <div v-if="group.tags && group.tags.length" class="dao-detail-tags"><span v-for="tag in group.tags" :key="tag">{{ tag }}</span></div>
        <router-link v-if="!customUrl" class="dao-visit-button" :to="`/manage/${group.groupname}`" @click="detailsOpen = false">Visit Group <landing-icon name="arrow" /></router-link>
        <a v-else class="dao-visit-button" :href="customUrl" target="_blank" rel="noopener noreferrer">Visit Group <landing-icon name="arrow" /></a>
      </q-card>
    </q-dialog>
  </article>
</template>
<script>
import { mapGetters } from 'vuex';
import LandingIcon from 'components/home/landing-icon.vue';

export default {
  name: 'GroupCard',
  components: { LandingIcon },
  props: { group: { type: Object, required: true } },
  data: () => ({ detailsOpen: false, members: null, proposals: null, moreProposals: false, logoFailed: false }),
  computed: {
    ...mapGetters({ favourites: 'user/getFavouriteGroups', activeNetwork: 'proton/getActiveNetwork' }),
    isFavourite() { return this.favourites.includes(this.group.groupname); },
    description() { return this.group.meta?.about || 'A community building its future together. Explore the group to learn more.'; },
    networkLabel() { return { local: 'Local', proton: 'XPR Network', protonTest: 'XPR Testnet' }[this.activeNetwork] || this.activeNetwork; },
    customUrl() {
      const url = this.group.ui?.custom_ui_url;
      if (!url) return null;
      try { const parsed = new URL(url.includes('://') ? url : `https://${url}`); return ['https:', 'http:'].includes(parsed.protocol) ? parsed.href : null; }
      catch (error) { return null; }
    },
  },
  async mounted() {
    const code = this.group.groupname;
    const query = (table, scope = code) => this.$eos.api.rpc.get_table_rows({ json: true, code, scope, table, limit: table === 'corestate' ? 1 : 1000 });
    const [state, ...proposalResults] = await Promise.allSettled([query('corestate'), ...[code, 'executed', 'cancelled'].map(scope => query('proposals', scope))]);
    if (state.status === 'fulfilled') this.members = state.value.rows[0]?.state?.member_count ?? null;
    if (proposalResults.every(result => result.status === 'fulfilled')) {
      this.proposals = proposalResults.reduce((total, result) => total + result.value.rows.length, 0);
      this.moreProposals = proposalResults.some(result => !!result.value.more);
    }
  },
};
</script>
<style scoped src="../css/dao-card.scss" lang="scss"></style>
