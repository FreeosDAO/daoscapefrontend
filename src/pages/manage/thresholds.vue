<template>
  <q-page padding class="constrain-page-width dao-page dao-thresholds">
    <page-header title="Thresholds" eyebrow="Community workspace" description="Define how much support each decision needs before it can be executed." />
    <manage-thresholds />

    <manage-threshold-links class="q-mt-md" />

    <!-- {{getThresholds}} -->
    <!-- {{getThresholdLinks}} -->
  </q-page>
</template>

<script>
import pageHeader from "components/page-header";
import { defineComponent } from "vue";
import { mapGetters } from "vuex";

import manageThresholds from "components/thresholds/manage-thresholds";
import manageThresholdLinks from "components/thresholds/manage-threshold-links";

export default defineComponent({
  name: "groupThresholds",
  components: {
    pageHeader,
    manageThresholds,
    manageThresholdLinks,
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters({
      getAccountName: "proton/getAccountName",
      getThresholds: "group/getThresholds",
      getActiveGroup: "group/getActiveGroup",
      getThresholdLinks: "group/getThresholdLinks",
    }),
  },
});
</script>
