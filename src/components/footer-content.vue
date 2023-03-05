<template>
  <div class="text-white" style="min-height: 200px">
    <div class="center-page-content">
      <div class="row q-col-gutter-md">
        <div :class="colsetup">
          <div class="q-pa-sm">
            <div class="text-h6 q-mb-md">
              <img
                src="~assets/the_daoscape_logo.svg"
                style="height: 120px"
                class="cursor-pointer q-mt-sm"
              />
              <!-- <router-link to="/" tag="a" class="text-link text-caption" style="display:block">
            Pricing
          </router-link>
          <router-link to="/" tag="a" class="text-link text-caption" style="display:block">
            Upgrade To DAC
          </router-link>
          <router-link to="/" tag="a" class="text-link text-caption" style="display:block">
            Documentation
          </router-link> -->
            </div>
          </div>
        </div>
        <div :class="colsetup">
          <div class="q-pa-sm">
            <!--
        <div class="text-h6 text-weight-light q-mb-md">Sponsors & Partners</div>
        <q-img  src="https://i.ibb.co/cYGz2xq/36450.png" style="width:80px" contain class="cursor-pointer" @click="openURL('https://boid.com')" />
        <q-img  src="~assets/animus-logo-small.png" style="width:80px" contain class="cursor-pointer" @click="openURL('https://www.animus.is')" />
        -->
          </div>
        </div>

        <div :class="colsetup">
          <div v-if="true" class="q-pa-sm">
            <div class="text-h6 text-weight-light q-my-md">Follow Us</div>
            <q-btn
              dense
              color="primary"
              round
              @click="openURL(getAppConfig.social.twitter)"
              class="q-mr-md"
            >
              <q-tooltip class="bg-primary">Visit our Twitter</q-tooltip>
              <q-icon
                name="img:statics/vectors/social/005-twitter.svg"
                size="24px"
              />
            </q-btn>
            <q-btn
              dense
              color="primary"
              round
              @click="openURL(getAppConfig.social.github)"
            >
              <q-tooltip class="bg-primary">Visit our Github repos</q-tooltip>
              <q-icon
                name="img:statics/vectors/social/027-github.svg"
                size="24px"
              />
            </q-btn>
          </div>
        </div>
      </div>

      <q-separator dark class="q-mt-lg q-mb-md" />

      <div class="row flex-end">
        <p>© TheDAOScape by FreeDAO {{ new Date().getFullYear() }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { mapGetters } from "vuex";
import { openURL } from "quasar";

export default defineComponent({
  // name: 'ComponentName',
  data() {
    return {
      colsetup: "col-xs-12 col-sm-6 col-md-4",
    };
  },
  computed: {
    ...mapGetters({
      getAppConfig: "app/getAppConfig",
    }),
  },
  methods: {
    openURL,
  },
});
</script>
