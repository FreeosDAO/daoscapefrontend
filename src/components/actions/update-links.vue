<template>
  <div>
    <div class="q-mt-md">
      <div v-for="(link, i) in new_links" class="q-mb-md row q-gutter-sm items-center">
        <div class="col-xs-12 col-sm-4">
          <q-select class="col-auto" outlined v-model="link.icon" :options="linkOptions" label="Link Type" emit-value map-options @update:model-value="updateLabel(i)" />
        </div>
        <div class="col-xs-12 col-sm-6">
          <q-input class="col-auto" v-model="link.url" label="URL" outlined></q-input>
        </div>
        <div class="col-xs-12 col-sm-1 text-center">
          <q-btn icon="mdi-delete-forever-outline" round size="sm" color="red" @click="deleteLink(i)" />
        </div>
      </div>
      <div class="q-mb-md row q-gutter-sm items-center">
        <div class="col-xs-12 col-sm-4">
        </div>
        <div class="col-xs-12 col-sm-6">
        </div>
        <div class="col-xs-12 col-sm-1 text-center">
          <q-btn color="secondary" round size="sm" icon="mdi-plus-circle-outline" @click="addLink" />
        </div>
      </div>
    </div>
    <div class="q-mt-md">
      <p class="text-subtitle text-uppercase">Preview:</p>
      <div>
        <groupLinks :links="new_links" />
      </div>
    </div>
    <div class="q-mt-md row justify-end">
      <q-btn
        :disabled="!isLinksChanged"
        label="update"
        color="primary"
        @click="proposeLinksUpdate"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { mapGetters } from "vuex";
import groupLinks from "components/group-links";

export default defineComponent({
  name: "updateLinks",
  components:{
    groupLinks
  },
  data() {
    return {
      new_links: [],
      linkOptions:[
        {label: 'Telegram', value: 'mdi-telegram'},
        {label: 'Twitter', value: 'mdi-twitter'},
        {label: 'Discord', value: 'mdi-discord'},
        {label: 'Snipcoins', value: 'mdi-open-in-new'}
      ],
      test: {label: 'Discord', icon: 'mdi-discord'}
    };
  },
  computed: {
    ...mapGetters({
      getActiveGroup: "group/getActiveGroup",
      getActiveGroupConfig: "group/getActiveGroupConfig",
      getAppConfig: "app/getAppConfig",
    }),
    isLinksChanged() {
      if ( this.getActiveGroupConfig && !this.isObjectsEqual(this.new_links,this.getActiveGroupConfig.meta.links) ) {
        return true
      } 
      return false
    },
  },
  methods: {
    async proposeLinksUpdate() {
      let action = {
        account: this.getAppConfig.groups_contract,
        name: "updatelinks",
        data: {
          groupname: this.getActiveGroup,
          newlinks: this.new_links,
        },
      };

      const title = `Update Links`;
      const description = `Propose to update group links.`;

      this.$store.dispatch("group/propose", {
        data: {
          actions: [action],
          description: description,
          title: title,
        },
        vm: this,
      });
    },
    deleteLink(i){
      this.new_links.splice(i, 1)
    },
    addLink(){
      this.new_links.push({url: '', icon: '', label: ''})
    },
    isObjectsEqual(arr1, arr2){ 
      return JSON.stringify(arr1) == JSON.stringify(arr2)
    },
    updateLabel(i){
      let link = this.new_links[i]
      let choice = this.linkOptions.filter(option=>option.value==link.icon)
      link.label = choice[0].label
    }
  },
  watch: {
    getActiveGroupConfig: {
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal) {
          this.new_links = JSON.parse(JSON.stringify(this.getActiveGroupConfig.meta.links));
        }
      },
    },
  },
});
</script>
