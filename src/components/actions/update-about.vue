<template>
  <div>
    <div class="q-mt-md">
      <q-input outlined v-model="new_about" placeholder="About the group" type="textarea" />
    </div>
    <div class="q-mt-md">
      <p class="text-subtitle text-uppercase">Preview:</p>
      <q-markdown
        class="text-caption text-weight-light"
        :src="new_about"
        :no-abbreviation="false"
      ></q-markdown>
    </div>
    <div class="q-mt-md row justify-end">
      <q-btn
        :disabled="!isAboutChanged"
        label="update"
        color="primary"
        @click="proposeAboutUpdate"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { mapGetters } from "vuex";

export default defineComponent({
  name: "updateAbout",
  data() {
    return {
      new_about: "",
    };
  },
  computed: {
    ...mapGetters({
      getActiveGroup: "group/getActiveGroup",
      getActiveGroupConfig: "group/getActiveGroupConfig",
      getAppConfig: "app/getAppConfig",
    }),
    isAboutChanged() {
      if (
        this.getActiveGroupConfig &&
        this.new_about != this.getActiveGroupConfig.meta.about
      ) {
        return true;
      } else {
        return false;
      }
    },
  },
  methods: {
    async proposeAboutUpdate() {
      let action = {
        account: this.getAppConfig.groups_contract,
        name: "updateabout",
        data: {
          groupname: this.getActiveGroup,
          about: this.new_about,
        },
      };

      const title = `Update About`;
      const description = `Propose to update the about.`;

      this.$store.dispatch("group/propose", {
        data: {
          actions: [action],
          description: description,
          title: title,
        },
        vm: this,
      });
    },
  },
  watch: {
    getActiveGroupConfig: {
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal) {
          this.new_about = this.getActiveGroupConfig.meta.about;
        }
      },
    },
  },
});
</script>
