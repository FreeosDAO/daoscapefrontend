<template>
  <q-layout view="lhh Lpr fff">
    <q-header :elevated="true" reveal>
      <q-toolbar style="height: 60px" class="bg-secondary">
        <main-logo />
        <q-toolbar-title> </q-toolbar-title>

        <q-tabs shrink stretch class="q-mr-sm" indicator-color="primary" align="right">
          <q-route-tab label="Browse" to="/browse" />
          <q-route-tab label="Create" to="/create" />
        </q-tabs>
        <login-network-switcher :avatar="false" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
      <q-page-scroller position="bottom-right" :scroll-offset="150" :offset="[18, 18]">
        <q-btn fab icon="keyboard_arrow_up" color="primary" />
      </q-page-scroller>
    </q-page-container>

    <q-footer class="bg-secondary footer-border-top">
      <footer-content />
    </q-footer>
  </q-layout>
</template>

<script>
import { defineComponent } from "vue";
import { openURL, getCssVar, setCssVar } from "quasar";
// const { setBrand, getBrand } = colors;
import { mapGetters } from "vuex";
import loginBtn from "components/login/login-btn";
import loginNetworkSwitcher from "components/login/login-network-switcher";
import footerContent from "components/footer-content";
import mainLogo from "components/main-logo";

export default defineComponent({
  name: "HomeLayout",
  components: {
    loginBtn,
    footerContent,
    loginNetworkSwitcher,
    mainLogo,
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters({
      getAccountName: "proton/getAccountName",
    }),
  },
  methods: {
    openURL,
  },
  mounted() {
    //reset group
    this.$store.dispatch("group/resetStore");
  },
  beforeMount() {
    //setCssVar("primary", "#7DC6EC");
    this.$q.addressbarColor.set(getCssVar("secondary"));
  },
});
</script>

<style>
.footer-border-top {
  border-top: 5px solid var(--q-primary) !important;
}
</style>
