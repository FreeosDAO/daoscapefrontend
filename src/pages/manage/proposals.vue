<template>
  <q-page class="dao-page dao-proposals">
    <page-header title="Proposals" eyebrow="Community workspace" description="Review proposals, see guardian approvals, and follow each decision.">
      <q-btn unelevated color="primary" icon="add" label="Create proposal" :to="`/manage/${getActiveGroup}/new-proposal`" />
    </page-header>
    <div class="dao-stat-strip">
      <div class="dao-stat"><span>Awaiting a decision</span><strong>{{ count('active') }}</strong></div>
      <div class="dao-stat"><span>Executed by the DAO</span><strong>{{ count('executed') }}</strong></div>
      <div class="dao-stat"><span>Archived decisions</span><strong>{{ archiveCount }}</strong></div>
    </div>
    <div class="dao-search-row"><q-input outlined v-model="filter" clearable placeholder="Search by title, proposer, or action" aria-label="Search proposals"><template #prepend><q-icon name="search" /></template></q-input></div>
    <q-tabs v-model="tabfilter" align="left" no-caps outside-arrows mobile-arrows>
      <q-tab v-for="state in states" :key="state" :name="state" :label="`${state.charAt(0).toUpperCase() + state.slice(1)} (${count(state)})`" />
    </q-tabs>
    <q-separator />
    <div v-if="loading" class="dao-empty q-mt-lg" role="status"><q-spinner size="36px" color="primary" /><p>Loading proposals…</p></div>
    <div v-else-if="!filteredProposals.length" class="dao-empty q-mt-lg">
      <q-icon name="mdi-file-document-outline" /><h2>{{ filter ? 'No matching proposals' : `No ${tabfilter} proposals yet` }}</h2>
      <p>{{ filter ? 'Try a different title, account, or action name.' : 'Every decision starts with an idea. Create a proposal for your community to consider.' }}</p>
      <q-btn v-if="filter" outline color="primary" label="Clear search" @click="filter = ''" />
      <q-btn v-else flat color="primary" label="Create a proposal" icon-right="arrow_forward" :to="`/manage/${getActiveGroup}/new-proposal`" />
    </div>
    <div v-else class="dao-proposal-list"><proposal-card v-for="proposal in filteredProposals" :key="tabfilter + proposal.id" :proposal="proposal" :proposalstate="tabfilter" /></div>
  </q-page>
</template>
<script>
import { mapGetters } from 'vuex';
import pageHeader from 'components/page-header';
import proposalCard from 'components/proposal-card';
export default {
  components: { pageHeader, proposalCard },
  data: () => ({ tabfilter: 'active', filter: '', states: ['active', 'executed', 'cancelled', 'expired'], clockTimer: null }),
  computed: {
    ...mapGetters({ getProposals: 'group/getProposals', getActiveGroup: 'group/getActiveGroup' }),
    loading() { return !Array.isArray(this.getProposals[this.tabfilter]); },
    archiveCount() { return ['cancelled', 'expired'].every(s => Array.isArray(this.getProposals[s])) ? this.getProposals.cancelled.length + this.getProposals.expired.length : '—'; },
    filteredProposals() {
      const proposals = this.getProposals[this.tabfilter] || [];
      const term = (this.filter || '').trim().toLowerCase();
      return term ? proposals.filter(p => [p.title, p.description, p.proposer, p.id, ...(p.actions || []).map(a => `${a.account} ${a.name}`)].join(' ').toLowerCase().includes(term)) : proposals;
    },
  },
  methods: { count(state) { return Array.isArray(this.getProposals[state]) ? this.getProposals[state].length : '—'; } },
  mounted() {
    this.$store.commit('app/setCLOCK', Date.now());
    this.clockTimer = setInterval(() => this.$store.commit('app/setCLOCK', Date.now()), 1000);
  },
  beforeUnmount() { clearInterval(this.clockTimer); },
};
</script>
