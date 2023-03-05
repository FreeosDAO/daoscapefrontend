<template>
  <div>
    <q-btn
      style="height: 32px; width: 140px"
      v-if="!getAccountName"
      label="login"
      @click="$store.dispatch('proton/login')"
      color="primary"
    />
    <q-btn-dropdown
      v-if="getAccountName"
      color="white"
      flat
      :label="getAccountName"
      style="width: 140px"
    >
      <q-list>
        <q-item clickable dense v-close-popup @click="$store.dispatch('proton/logout')">
          <q-item-section>
            <q-item-label>Logout</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { mapGetters } from "vuex";

export default defineComponent({
  // name: 'ComponentName',
  data() {
    return {};
  },
  computed: {
    ...mapGetters({
      getAccountName: "proton/getAccountName"
    }),
  },
});
</script>

<style></style>
