<template>
  <q-page class="dao-page dao-nfts">
    <page-header title="NFTs" eyebrow="Community workspace" description="Discover the digital assets held by your community." />
    <div v-if="isLocal" class="dao-empty"><q-icon name="mdi-image-multiple-outline" /><h2>Your collection starts here</h2><p>The local development network does not have an NFT indexer configured. NFT collections will appear when an indexer is connected.</p></div>
    <template v-else>
      <div v-if="error" class="dao-empty q-mb-lg" role="alert"><q-icon name="cloud_off" /><h2>Collection unavailable</h2><p>{{ error }}</p><q-btn outline color="primary" label="Try again" :loading="nftsLoading" @click="fetchPage(page)" /></div>
      <div v-if="nftsLoading && !nfts.length" class="dao-empty" role="status"><q-spinner size="36px" color="primary" /><p>Loading your collection…</p></div>
      <div v-else-if="!nfts.length && !error" class="dao-empty"><q-icon name="mdi-image-multiple-outline" /><h2>No NFTs yet</h2><p>This DAO’s digital collection will appear here when it holds NFTs.</p></div>
      <div class="row q-col-gutter-lg">
        <div v-for="nft in nfts" :key="nft.asset_id" class="col-12 col-sm-6 col-lg-4">
          <q-card>
            <figure class="nft-media">
              <q-img v-if="nft.data.image" :src="assetUrl(nft.data.image)" :alt="nft.data.name || 'NFT artwork'" :ratio="1" loading="lazy" />
              <video v-else-if="nft.data.video" controls muted preload="metadata" :src="assetUrl(nft.data.video)" />
              <model-viewer v-else-if="nft.data.model && modelViewerReady" :src="assetUrl(nft.data.model)" :alt="nft.data.name" camera-controls touch-action="pan-y" />
              <div v-else class="nft-no-media"><q-icon name="image" size="48px" /></div>
            </figure>
            <q-card-section><div class="text-caption text-grey-7">{{ nft.collection.name || nft.collection.collection_name }} · #{{ nft.template_mint }}</div><h2 class="dao-section-title q-mt-sm">{{ nft.data.name || `Asset #${nft.asset_id}` }}</h2></q-card-section>
            <q-separator /><q-card-actions><q-btn flat color="primary" label="View asset" icon-right="north_east" target="_blank" rel="noopener noreferrer" :href="`${getAppConfig.nft.url}/${nft.asset_id}`" /></q-card-actions>
          </q-card>
        </div>
      </div>
      <div v-if="hasMore && nfts.length" class="text-center q-mt-lg"><q-btn outline color="primary" label="Load more NFTs" :loading="nftsLoading" @click="fetchPage(page)" /></div>
    </template>
  </q-page>
</template>
<script>
import { mapGetters } from 'vuex';
import pageHeader from 'components/page-header';
export default {
  components: { pageHeader },
  data: () => ({ nfts: [], nftsLoading: false, error: '', page: 1, hasMore: false, requestId: 0, modelViewerReady: false }),
  computed: {
    ...mapGetters({ getActiveGroup: 'group/getActiveGroup', getAppConfig: 'app/getAppConfig', network: 'proton/getActiveNetwork' }),
    isLocal() { return this.network === 'local'; },
    collectionKey() { return `${this.network}:${this.getActiveGroup}`; },
  },
  watch: { collectionKey: { immediate: true, handler() { this.requestId++; this.nfts = []; this.page = 1; this.error = ''; this.nftsLoading = false; this.hasMore = false; if (this.getActiveGroup && !this.isLocal) this.fetchPage(1); } } },
  beforeUnmount() { this.requestId++; },
  methods: {
    assetUrl(value) { return /^https?:\/\//i.test(value) ? value : `https://proton.mypinata.cloud/ipfs/${value.replace(/^ipfs:\/\//, '')}`; },
    async fetchPage(page) {
      if (this.nftsLoading || this.isLocal) return;
      const id = ++this.requestId;
      this.nftsLoading = true; this.error = '';
      try {
        const response = await this.$axios.get(`${this.getAppConfig.nft.api}/atomicassets/v1/assets`, { params: { owner: this.getActiveGroup, page, limit: 12, order: 'desc', sort: 'asset_id' }, timeout: 10000 });
        if (id !== this.requestId) return;
        const assets = response.data.data;
        if (!Array.isArray(assets)) throw new Error('Invalid collection response');
        this.nfts.push(...assets.map(nft => ({ ...nft, data: nft.data || {}, collection: nft.collection || {} })));
        this.hasMore = assets.length === 12; this.page = page + 1;
        if (assets.some(nft => nft.data?.model)) { await import('@google/model-viewer'); this.modelViewerReady = true; }
      } catch (error) { if (id === this.requestId) this.error = 'We couldn’t reach the NFT indexer. Please try again.'; }
      finally { if (id === this.requestId) this.nftsLoading = false; }
    },
  },
};
</script>
<style scoped>
.nft-media { margin: 0; background: #e9eee5; }
.nft-media video, .nft-media model-viewer { width: 100%; min-height: 260px; max-height: 360px; }
.nft-no-media { display: grid; place-items: center; aspect-ratio: 1; color: #7b9185; }
</style>
