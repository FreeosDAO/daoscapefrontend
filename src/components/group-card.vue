<template>
    <q-card
      v-if="group.state"
      class="overflow-hidden relative-position"
      :style="{ backgroundColor: getGroupColor}"
    >
      <div
        class="full-height column justify-between overflow-hidden q-pt-xl"
      >
        <div
          class="row justify-center items-center text-white text-weight-light q-py-sm"
          style="min-height: 115px"
        >
          <q-avatar
          v-if="group.ui.logo"
          class="q-mb-sm"
          size="80px"
          >
            <q-img
              contain
              :src="group.ui.logo"
              spinner-color="white"
            />
          </q-avatar>

          <div
            class="text-bold text-uppercase text-center"
            style="flex-basis: 100%"
          >
            {{ group.groupname }}
          </div>
        </div>

        <div
          style="background: rgb(0 0 0 / 25%); height: 60px"
          class="full-width row justify-between items-center"
        >
          <div>
            <q-btn
              round
              :color="group.is_fav ? 'yellow' : 'white'"
              flat
              icon="star"
              size="md"
              @click="
                $store.commit('user/setFavouriteGroups', group.groupname);
                group.is_fav = !group.is_fav;
              "
            />
          </div>
          <div>
            <q-btn
              v-if="getUiUrl.startsWith('/')"
              label="Visit Group"
              :to="getUiUrl"
              flat
              size="sm"
              text-color="white"
              :style="{ backgroundColor: getGroupColor }"
            />
            <q-btn
              v-else
              label="Visit Group"
              @click="openURL(getUiUrl)"
              icon="link"
              flat
              size="sm"
              text-color="white"
              :style="{ backgroundColor: group.ui.hexcolor }"
            >
              <q-tooltip
                class="bg-secondary"
                :delay="500"
                anchor="center left"
                self="center right"
                :offset="[10, 10]"
              >
                {{ getUiUrl }}
              </q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
      <div v-if="group.tags.length" class="absolute-top row justify-start q-pa-sm full-width">
          <group-tags
            :tags="group.tags"
            content-class="text-white q-mb-xs q-pa-sm"
          />
      </div>
      <!-- {{group}} -->
    </q-card>
</template>

<script>
import { defineComponent } from "vue";
import { openURL } from "quasar";
import { isValidUrl } from "../imports/validators.js";
import groupTags from "components/group-tags";

export default defineComponent({
  name: "groupCard",
  components: {
    groupTags,
  },
  props: {
    group: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      view_mode: "main",
      group_info: {
        about: "",
      },
      info_is_loading: false,
    };
  },
  computed: {
    getUiUrl() {
      let res = `/manage/${this.group.groupname}`;
      if (this.group.ui.custom_ui_url) {
        if (isValidUrl(this.group.ui.custom_ui_url)) {
          res = this.group.ui.custom_ui_url;
        }
      }
      return res;
    },
    getGroupColor() {
      return this.group.ui.hexcolor.startsWith("#")
        ? this.group.ui.hexcolor
        : `#${this.group.ui.hexcolor}`;
    },
  },
  methods: {
    openURL,
    switchViewMode() {
      if (this.view_mode == "main") {
        this.view_mode = "info";
        this.fetchGroupInfo();
      } else {
        this.view_mode = "main";
      }
    },
    fetchGroupInfo() {
      this.group_info.about = this.group.meta.about;

      this.info_is_loading = true;
      setTimeout(() => {
        this.info_is_loading = false;
      }, 500);
    },
  },
});
</script>
