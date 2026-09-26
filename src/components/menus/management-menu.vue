<template>
  <q-list
    class="primary-hover-list"
    :class="$q.dark.isActive ? `bg-dark` : `bg-grey-3`"
    :separator="!$q.dark.isActive"
  >
    <q-item clickable :to="`/manage/${getActiveGroup}`" exact>
      <q-item-section avatar>
        <q-icon name="mdi-home-outline" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Group Info</q-item-label>
      </q-item-section>
    </q-item>

    <q-item clickable :to="`/manage/${getActiveGroup}/proposals`">
      <q-item-section avatar>
        <q-icon name="mdi-file-key" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Proposals</q-item-label>
      </q-item-section>
      <q-item-section side>
        <!-- $route.path!=`/manage/${getActiveGroup}/new-proposal` -->
        <q-btn
          aria-label="Create proposal"
          unelevated
          round
          :flat="false"
          size="sm"
          :color="
            $route.path != `/manage/${getActiveGroup}/new-proposal`
              ? 'secondary'
              : 'primary'
          "
          @click.stop.prevent="handleNewProposal"
        >
          <q-icon v-if="getActionBucket.length == 0" name="add" color="white" />
          <span v-else>{{ getActionBucket.length }}</span>
          <q-tooltip class="bg-secondary">
            <span v-if="getActionBucket.length == 0">New Proposal</span>
            <span v-else>{{ `Bucket contains ${getActionBucket.length} actions` }}</span>
          </q-tooltip>
        </q-btn>
      </q-item-section>
    </q-item>

    <template v-if="getModuleByName('membergov')">
      <q-item clickable :to="`/manage/${getActiveGroup}/sortition`"><q-item-section avatar><q-icon name="groups" /></q-item-section><q-item-section>Sortition</q-item-section></q-item>
      <q-item clickable :to="`/manage/${getActiveGroup}/member-governance`"><q-item-section avatar><q-icon name="how_to_vote" /></q-item-section><q-item-section>Member Governance</q-item-section></q-item>
    </template>
    <q-item clickable :to="`/manage/${getActiveGroup}/treasury`" v-if="isUserGuardian">
      <q-item-section avatar>
        <q-icon name="mdi-wallet" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Treasury</q-item-label>
      </q-item-section>
    </q-item>

    <q-item clickable :to="`/manage/${getActiveGroup}/nfts`">
      <q-item-section avatar>
        <q-icon name="mdi-image-search" />
      </q-item-section>
      <q-item-section>
        <q-item-label>NFTs</q-item-label>
      </q-item-section>
    </q-item>

    <q-item
      v-if="getModuleByName('payroll') && isUserGuardian"
      clickable
      :to="`/manage/${getActiveGroup}/payroll`"
    >
      <q-item-section avatar>
        <q-icon name="mdi-account-cash" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Payroll</q-item-label>
      </q-item-section>
    </q-item>

    <q-item
      v-if="getModuleByName('hooks') && isUserGuardian" 
      clickable
      :to="`/manage/${getActiveGroup}/hooks`"
    >
      <q-item-section avatar>
        <q-icon name="mdi-anchor" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Hooks</q-item-label>
      </q-item-section>
    </q-item>

    <q-item clickable v-if="isUserGuardian" :to="`/manage/${getActiveGroup}/thresholds`">
      <q-item-section avatar>
        <q-icon name="mdi-chart-gantt" class="rotate-270" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Thresholds</q-item-label>
      </q-item-section>
    </q-item>

    <q-item clickable :to="`/manage/${getActiveGroup}/files`">
      <q-item-section avatar>
        <q-icon name="mdi-file-document" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Files</q-item-label>
      </q-item-section>
    </q-item>

    <!--<q-item clickable :to="`/manage/${getActiveGroup}/resources`">
      <q-item-section avatar>
        <q-icon name="mdi-alpha-r-circle" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Resources</q-item-label>
      </q-item-section>
      <q-item-section side>
        <transition
          appear
          enter-active-class="animated zoomIn"
          leave-active-class="animated zoomOut"
        >
          <q-btn
            v-if="getResourcesLowWarning.length"
            color="grey-3"
            round
            unelevated
            size="sm"
            icon="mdi-alert"
            text-color="negative"
          >
            <q-tooltip class="bg-secondary">
              <div v-for="warning in getResourcesLowWarning" :key="warning.type">
                {{
                  `Group consumed ${warning.perc_used.toFixed(2)}% of its ${warning.type}`
                }}
              </div>
            </q-tooltip>
          </q-btn>
        </transition>
      </q-item-section>
    </q-item>-->

    <q-item clickable :to="`/manage/${getActiveGroup}/guardians`">
      <q-item-section avatar>
        <q-icon name="mdi-account-key" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Guardians</q-item-label>
      </q-item-section>
    </q-item>

    <q-item clickable :to="`/manage/${getActiveGroup}/members`">
      <q-item-section avatar>
        <q-icon name="mdi-account-multiple" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Members</q-item-label>
      </q-item-section>
    </q-item>

    <q-item clickable v-if="isUserGuardian" :to="`/manage/${getActiveGroup}/modules`">
      <q-item-section avatar>
        <q-icon name="mdi-settings" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Configuration</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script>
import { defineComponent } from "vue";
import { mapGetters } from "vuex";

export default defineComponent({
  name: "managementMenu",
  data() {
    return {};
  },
  computed: {
    ...mapGetters({
      getActiveGroup: "group/getActiveGroup",
      getResourcesLowWarning: "group/getResourcesLowWarning",
      getActionBucket: "bucket/getActionBucket",
      getModuleByName: "group/getModuleByName",
      getIsGuardian: "group/getIsGuardian",
      getAccountName: "proton/getAccountName"
    }),
    isUserGuardian(){
      return this.getIsGuardian(this.getAccountName) ? true : false
    }
  },
  methods: {
    handleNewProposal() {
      this.$router.push(`/manage/${this.getActiveGroup}/new-proposal`);
    }
  }
});
</script>
