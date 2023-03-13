<template>
  <q-card style="max-height: 600px">
    <q-card-section class="bg-white">
      <q-img src="~assets/04-onchain.jpeg" style="max-width: 100%; max-height: 300px" />
    </q-card-section>

    <q-card-section class="bg-white text-grey-9" style="font-size: 17px">
      <b>On-Chain</b>
    </q-card-section>
    <q-card-section class="q-pt-none bg-white text-grey-9">
      <q-scroll-area :thumb-style="thumbStyle" style="height: 190px; max-width: 100%">
        <div v-for="n in 1" :key="n" class="q-pa-xs">
          <div>
            <p>
              The DAOScape's core has been built on using a combination of the Proton blockchain and Dfinity's Internet Computer platform. This creates a fast, easy-to-access, gas-free, and truly decentralised (front-end and back-end) ecosystem of DAOs.
            </p>
            <p>
              With no central servers hosting either the front or backend, you can be assured that your DAO is unstoppable for your distributed team and lofty goals.
            </p>
          </div>
        </div>
      </q-scroll-area>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "onchain",
  data() {
    return {
      contentStyle: {
        backgroundColor: "rgba(0,0,0,0.02)",
        color: "#555",
      },

      contentActiveStyle: {
        backgroundColor: "#eee",
        color: "black",
      },

      thumbStyle: {
        right: "2px",
        borderRadius: "5px",
        backgroundColor: "#027be3",
        width: "5px",
        opacity: 0.75,
      },
    };
  },
});
</script>

<style></style>
