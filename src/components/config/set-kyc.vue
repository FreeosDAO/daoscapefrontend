<template>
  <div >

    <q-list separator class="q-mt-md">

      <q-item clickable>
        <q-item-section>
         <q-item-label>Enable Proton KYC</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle
            v-if="getNewCoreConfig"
            :true-value="1"
            :false-value="0"
            v-model="getNewCoreConfig.conf.proton_kyc_enabled"
            color="positive"
            @input="
              $store.commit('group/setNewCoreConfigPath', {
                path: 'conf.proton_kyc_enabled',
                value: Number($event)
              })
            "
          />
        </q-item-section>
      </q-item>

      <q-item clickable>
        <q-item-section>
         <q-item-label>Enable Freeos Participation Requirement</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle
            v-if="getNewCoreConfig"
            :true-value="1"
            :false-value="0"
            v-model="getNewCoreConfig.conf.freeos_participation_enabled"
            color="positive"
            @input="
              $store.commit('group/setNewCoreConfigPath', {
                path: 'conf.freeos_participation_enabled',
                value: Number($event)
              })
            "
          />
        </q-item-section>
      </q-item>
    </q-list>


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
      getNewCoreConfig: "group/getNewCoreConfig"
    })
  }
});
</script>
