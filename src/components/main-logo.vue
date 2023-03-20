<template>
  <div class="q-mt-xs relative-position row items-center">
    <router-link to="/" >
      <!-- <transition-group enter-active-class="animated fadeInUp" leave-active-class="animated zoomOut" > -->
        <img src="~assets/the_daoscape_logo.svg" key="s" style="height:50px" class="cursor-pointer gt-xs" />
        <img src="~assets/the_daoscape_logo.svg" key="b" style="height:40px" class="cursor-pointer lt-sm" />
      <!-- </transition-group> -->
    </router-link>
    <small class="rounded-borders inline q-ml-xs text-small" >v0.0.1:test1</small>
    <!-- <small v-if="getSession" class="rounded-borders inline q-ml-xs text-small" >{{ getSession.link.walletType }}:{{ getSession.type }}</small> -->
    <!-- <span class="bg-primary rounded-borders inline q-ml-xs" >BETA</span> -->
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { mapGetters } from 'vuex';

export default defineComponent({
  computed: {
    ...mapGetters({
      getSession: "proton/getSession"
    }),
  },
})
</script>
