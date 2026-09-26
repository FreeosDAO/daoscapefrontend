<template>
  <q-page padding class="constrain-page-width dao-page dao-members">
    <page-header title="Members" eyebrow="Community workspace" description="The people behind your community. Find members and explore their profiles." />
    <div v-if="getCoreConfig" class="text-right q-mb-md">
      <q-badge v-if="getCoreConfig.conf.member_registration" key="enabled"
        >Member Registration Enabled</q-badge
      >
      <q-badge color="negative" v-else key="disabled"
        >Member Registration disabled</q-badge
      >
    </div>

    <q-input
      placeholder="Find a member"
      aria-label="Search members"
      clearable
      outlined
      v-model.trim="searchfilter"
      class="q-mb-md"
    >
      <template v-slot:prepend>
        <q-icon name="search" class="cursor-pointer" />
      </template>

      <!-- <template v-slot:after>
        <div>
          <span>#{{candidates.length}}</span>
          <q-tooltip :delay="250" class="bg-primary">{{candidates.length}} Active Candidates</q-tooltip>
        </div>
      </template> -->
    </q-input>

    <q-card v-if="getActiveGroup">
      <q-toolbar class="bg-secondary text-white shadow-2">
        <q-toolbar-title :shrink="true">
          <span>Members</span>
        </q-toolbar-title>
        <q-space />
        <div v-if="getCoreState">#{{ getCoreState.state.member_count }}</div>
      </q-toolbar>
      <q-list class="primary-hover-list" bordered separator>
        <!--<q-expansion-item v-for="member in members" :key="member.account" group="members">
          <template v-slot:header>
            <q-item-section avatar>
              <profile-pic
                :size="42"
                :account="member.account"
                :icon="getIsGuardian(member.account) ? 'mdi-star' : ''"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>
                <span>{{ member.account }}</span>
              </q-item-label>
            </q-item-section>
          </template>
          <q-separator />
          <q-card>
            <q-card-section>
              <q-item-label caption>
                <q-btn
                  color="primary"
                  dense
                  label="full profile"
                  :to="`/members/${getActiveGroup}/profile/${member.account}`"
                />
              </q-item-label>
            </q-card-section>
          </q-card>
        </q-expansion-item>-->
        <q-item v-for="member in getFilteredMembers" :key="member.account" group="members"
        :to="`/members/${getActiveGroup}/profile/${member.account}`">
          <q-item-section avatar>
            <profile-pic
              :size="42"
              :account="member.account"
              :icon="getIsGuardian(member.account) ? 'mdi-star' : ''"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              <span>{{ member.account }}</span>
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
                  color="primary"
                  aria-label="View member profile"
                  icon="chevron_right" flat round
                  :to="`/members/${getActiveGroup}/profile/${member.account}`"
                />
          </q-item-section>
        </q-item>
        <q-item v-if="is_loading">
          <div class="row items-center justify-center full-width">
            <q-spinner color="primary" size="24px" />
          </div>
        </q-item>
        <no-items v-if="!is_loading && !getFilteredMembers.length" text="No members" />
      </q-list>
    </q-card>
    <div class="text-right q-mt-md">
      <q-btn v-if="more" label="Load more members" @click="fetchMembers()" color="primary" :loading="is_loading" />
    </div>
  </q-page>
</template>

<script>
import pageHeader from "components/page-header";
import { defineComponent } from "vue";
import { mapGetters } from "vuex";

import profilePic from "components/profile-pic";
import profileLink from "components/profile-link";
import noItems from "components/no-items";

export default defineComponent({
  name: "members",
  components: {
    pageHeader,
    profilePic,
    profileLink,
    noItems,
  },
  data() {
    return {
      requestId: 0,
      next_key: "",
      more: false,
      members: [],
      is_loading: false,
      searchfilter: "",
    };
  },
  computed: {
    ...mapGetters({
      getAccountName: "proton/getAccountName",
      getActiveGroup: "group/getActiveGroup",
      getIsGuardian: "group/getIsGuardian",
      getCoreConfig: "group/getCoreConfig",
      getCoreState: "group/getCoreState",
    }),
    getFilteredMembers() {
      const term = (this.searchfilter || '').trim().toLowerCase();
      return this.members.filter(c => c.account.includes(term));
    }

  },
  methods: {
    async fetchMembers() {
      if (!this.getActiveGroup || this.is_loading) return;
      const group = this.getActiveGroup;
      const requestId = ++this.requestId;
      this.is_loading = true;
      let res = await this.$eos.api.rpc
        .get_table_rows({
          json: true,
          code: this.getActiveGroup,
          scope: this.getActiveGroup,
          table: "members",
          lower_bound: this.next_key,
          limit: 10,
        })
        .catch((e) => false);

      if (requestId !== this.requestId) return;
      if (res && group === this.getActiveGroup) {
        this.members = this.members.concat(res.rows);
        if (res.more) {
          this.next_key = res.next_key;
        }
        this.more = res.more;
      } else {
        //return [];
      }
      this.is_loading = false;
    },
  },
  watch: { getActiveGroup: { immediate: true, handler(group) { this.requestId++; this.is_loading = false; this.members = []; this.next_key = ""; this.more = false; if (group) this.fetchMembers(); } } },
});
</script>
