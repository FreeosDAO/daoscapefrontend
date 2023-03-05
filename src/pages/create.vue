<template>
  <q-page padding class="bg-white">
    <scrolling-background class="absolute-bottom" />
      <newGroup
        class="q-mt-lg"
        :prefill="{ group_account_name: $route.params.newgroupname }"
      />
      <div style="height: 60vh"></div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { mapGetters } from "vuex";
import scrollingBackground from "components/scrolling-background";
import newGroup from 'components/new-group.vue';

export default defineComponent({
  name: "create",
  components: {
    newGroup,
    scrollingBackground,
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters({
      getAccountName: "proton/getAccountName"
    })
  },
  methods: {},
  watch: {},
});
</script>