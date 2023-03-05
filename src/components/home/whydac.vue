<template>
  <q-card style="max-height: 600px">
    <q-card-section class="bg-white">
      <q-img src="~assets/question.jpg" style="max-width: 100%; max-height: 300px" />
    </q-card-section>

    <q-card-section class="bg-white text-grey-9" style="font-size: 17px">
      <b>Why would you create a DAO?</b>
    </q-card-section>

    <q-card-section class="q-pt-none bg-white text-grey-9">
      <q-scroll-area :thumb-style="thumbStyle" style="height: 190px; max-width: 100%">
        <div v-for="n in 1" :key="n" class="q-pa-xs">
          <div>
            <p>One of the main advantages of a DAO is that it allows for decentralized decision-making, meaning that decisions are made by the members collectively rather than by a centralized authority. This can lead to greater transparency, fairness, and inclusivity in decision-making processes. </p>
            <p>Additionally, DAOs can facilitate decentralized coordination and collaboration among individuals who share a common goal or interest, without the need for intermediaries. </p>
            <p>Finally, DAOs can provide a way to pool resources and coordinate efforts in a decentralized manner, making it easier to fund and manage projects that might be difficult to accomplish through traditional means. </p>
          </div>
        </div>
      </q-scroll-area>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "whydac",
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
