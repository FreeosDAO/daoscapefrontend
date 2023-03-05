<template>
  <q-page class=" bg-dark full-height">

    <div class="header_box relative-position">
      <q-parallax src="~assets/daoscape_background.jpeg" :height="700">
        <div class="text-center text-primary" style="">
          <h1
            style="background:#272822F2"
            class="shadow-8 q-px-xl q-py-lg q-ma-none text-h2 text-white text-weight-light"
          >
            Enter the DAO Scape
          </h1>
          <div class="shadow-8 q-px-lg q-py-sm q-mx-xl  bg-white text-secondary text-weight-bold" style="font-size:17px">
            Start As Group - Proceed As DAO
          </div>

          <!--<split-btn />-->
          <div class="row justify-center q-mt-xl text-center">
            <div>
              <transition appear enter-active-class="animated fadeInRight" leave-active-class="animated fadeOutRight"  mode="out-in" tag="div" >
              <q-btn
                to="browse"
                label="browse"
                color="secondary"
                size="lg"
                class="q-mr-md "
              />
              </transition>

              <transition appear enter-active-class="animated fadeInLeft" leave-active-class="animated fadeOutLeft"  mode="out-in" tag="div" >
              <q-btn
                to="create"
                label="create"
                color="secondary"
                size="lg"
                class="q-ml-md"
              />
              </transition>
            </div>
          </div>
        </div>
      </q-parallax>
    </div>
    <div class="q-pa-md center-page-content text-white">
      <div class="text-white text-center q-mt-xl q-mb-xl text-h4" >
        Empowerment Of Decentralized Communities
      </div>

      <div class="">
        <comparison-table style="width:100%"/>
      </div>

      <div class=" q-mt-md q-pb-xl row q-col-gutter-lg text-grey-9 text-weight-medium">
        <q-intersection transition="scale" once class="col-xs-12 col-sm-6">
            <whatisdac  />
        </q-intersection>
        <q-intersection transition="scale" once class="col-xs-12 col-sm-6">
            <whydac  />
        </q-intersection>
        <q-intersection transition="scale" once class="col-xs-12 col-sm-6">
            <modules  />
        </q-intersection>
        <q-intersection transition="scale" once class="col-xs-12 col-sm-6">
            <onchain  />
        </q-intersection>
      </div>
  
    </div>
  </q-page>
</template>

<style></style>

<script>
import { mapGetters } from "vuex";
import splitBtn from "components/split-btn";
import comparisonTable from "components/home/comparison-table";
import whatisdac from "components/home/whatisdac";
import whydac from "components/home/whydac";
import modules from "components/home/modules";
import onchain from "components/home/onchain";

export default {
  name: "PageIndex",
  components: {
    splitBtn,
    comparisonTable,
    whatisdac,
    whydac,
    modules,
    onchain
    },
  data() {
    return {
      showYouTubeVideo: false,
      video_is_loaded: false,
      contentStyle: {
        backgroundColor: 'rgba(0,0,0,0.02)',
        color: '#555'
      },

      contentActiveStyle: {
        backgroundColor: '#eee',
        color: 'black'
      },

      thumbStyle: {
        right: '2px',
        borderRadius: '5px',
        backgroundColor: '#027be3',
        width: '5px',
        opacity: 0.75
      }
    };
  },
  computed: {
    ...mapGetters({
      getAccountName: "proton/getAccountName",
    })
  }
};
</script>

<style>
.header_box {
  border-bottom: 5px solid var(--q-primary);
}
.q-parallax__media:after {
    display: block;
    content: '';
    position:absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgb(255 255 255 / 20%);
}
</style>
