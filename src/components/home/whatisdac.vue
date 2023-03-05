<template>
  <q-card style="max-height: 600px">
    <q-card-section class="bg-white">
      <q-img src="~assets/dac1.jpg" style="max-width: 100%; max-height: 300px" />
    </q-card-section>

    <q-card-section class="bg-white text-grey-9" style="font-size: 17px">
      <b>What is a DAO?</b>
    </q-card-section>

    <q-card-section class="q-pt-none bg-white text-grey-9">
      <q-scroll-area :thumb-style="thumbStyle" style="height: 190px; max-width: 100%">
        <div v-for="n in 1" :key="n" class="q-pa-xs">
          <div>
            <p>
              A DAO (Decentralized Autonomous Organization) is a type of organization that is run through smart contracts on a blockchain network, without the need for traditional intermediaries such as a central authority or middlemen. It is governed by a set of rules encoded on the blockchain that are enforced automatically through the smart contracts, allowing members to make decisions through a decentralized voting process. DAOs can be used for a variety of purposes, including managing digital assets, coordinating community efforts, and funding projects through decentralized crowdfunding.
            </p>
            <p>
              DAOs are open-source, transparent and in theory, incorruptible. All transactions of the organization are recorded and maintained on a blockchain. 
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
  name: "whatisdac",
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
