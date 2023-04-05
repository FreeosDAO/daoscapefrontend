<template>
  <q-page padding class="constrain-page-width q-pb-lg">

    <page-header title="NFTs" />

    <transition-group appear enter-active-class="animated zoomIn" leave-active-class="animated zoomOut"
      class="row q-col-gutter-md q-mt-md items-stretch" tag="div">

      <div v-if="nftsLoading" key="loading" class="col-xs-12 nft">
        <q-card>
          <q-card-section class="bg-grey-9 text-white loading">
            Loading
          </q-card-section>
        </q-card>
      </div>

      <div v-if="!nftsLoading && !nfts.length && !error" key="loading" class="col-xs-12 nft">
        <q-card>
          <q-card-section class="bg-grey-9 text-white loading">
            This DAO doesn't hold any NFTs.
          </q-card-section>
        </q-card>
      </div>

      <div v-if="!nftsLoading && error" key="loading" class="col-xs-12 nft">
        <q-card>
          <q-card-section class="bg-grey-9 text-white loading">
            {{ error }}
          </q-card-section>
        </q-card>
      </div>

      <div v-if="nfts.length" v-for="nft in nfts" :key="nft.asset_id"
        class="col-xs-12 col-sm-6 col-md-4 col-lg-4 col-xl-4 nft">

        <q-card>
          <figure>
            <q-img v-if="'image' in nft.data && nft.data.image" :src="'https://bloks.io/cdn-cgi/image/width=500/https://proton.mypinata.cloud/ipfs/' + nft.data.image"
              :alt="nft.data.name" />
            <video v-else-if="'video' in nft.data && nft.data.video" controls muted loop preload="auto">
              <source :src="'https://proton.mypinata.cloud/ipfs/' + nft.data.video" />
            </video>
            <q-img v-else src="https://via.placeholder.com/1080x720/dddddd/000000/?text=NO%20MEDIA" :alt="nft.data.name" />
          </figure>

          <q-card-section>
            <div class="row no-wrap items-center text-grey text-caption">
              <div class="col ellipsis">
                {{ 'name' in nft.collection && nft.collection.name ? nft.collection.name : nft.collection.collection_name }}
              </div>
              <div class="col-auto row no-wrap items-center">
                #{{ nft.template_mint }}
              </div>
            </div>
            <div class="row no-wrap items-center">
              <div class="col text-h6 ellipsis">
                <p class="text-h6">{{ nft.data.name }}</p>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions>
            <q-btn flat color="primary" target="_blank" icon-right="mdi-open-in-new" align="between" label="View" 
              :href="`${getAppConfig.nft.url}/${nft.asset_id}`">
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>

    </transition-group>

  <div class="row align-center justify-center q-mt-lg">
    <q-btn v-if="this.checkData.length"
    @click="checkForMoreNFTs()"
    flat color="secondary">
      Load More
    </q-btn>
  </div>


  </q-page>
</template>

<script>
import pageHeader from "components/page-header";
import { defineComponent } from "vue";
import { mapGetters } from "vuex";

export default defineComponent({
  name: "groupNfts",
  components: {
    pageHeader
  },
  data() {
    return {
      nftsLoading: true,
      nfts: [],
      perPage: 6,
      page: 1,
      checkData: [],
      error: false
    };
  },
  computed: {
    ...mapGetters({
      getActiveGroup: "group/getActiveGroup",
      getAppConfig: "app/getAppConfig",
    })
  },
  methods: {
    async getNftsFromAtomic() {

      // make request to atomic assets api
      let result = await this.callAtomic()

      // Store results
      console.log('nfts', result)
      this.nftsLoading = false
      this.nfts = result.data.data//.filter( nft => nft.owner == this.getActiveGroup )

      // Check for more
      if(!this.nfts.length){
        return true
      }
      this.checkForMoreNFTs()
    },
    async checkForMoreNFTs() {

      // plus one to page
      this.page++

      // merge more with current
      this.nfts.push(...this.checkData)
      this.checkData = {}

      // make request to atomic assets api
      let result = await this.callAtomic()

      // Store results
      console.log('more check', result)
      this.checkData = result.data.data//.filter( nft => nft.owner == this.getActiveGroup )
    },
    async callAtomic(){
      let url = `${this.getAppConfig.nft.api}/atomicassets/v1/assets?owner=${this.getActiveGroup}&page=${this.page}&limit=${this.perPage}&order=desc&sort=asset_id`;
      console.warn('calling', url)
      return await this.$axios
        //.get(this.getAppConfig.nft.api + '/atomicassets/v1/assets?owner=conorsee&page=' + this.page + '&limit=' + this.perPage + '&order=desc&sort=asset_id')
        .get(url)
        .catch(error => {
          this.nftsLoading = false
          this.error = error
        })
    }
  },
  watch:{
    getActiveGroup(){
      this.getNftsFromAtomic()
    }
  },
  mounted(){
    if(!this.getActiveGroup) return
    this.getNftsFromAtomic()
  }
});
</script>

<style scoped>
.nft figure {
  margin: 0
}

.nft figure>* {
  width: 100%;
}
</style>