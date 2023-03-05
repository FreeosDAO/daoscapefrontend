<template>
  <q-page padding class="text-center text-white bg-grey-9">
    <h2 class="text-center q-mb-sm">Login</h2>
    <p class="text-center">Please login to access groups.</p>
    <login-network-switcher />
  </q-page>
</template>

<script>
import loginNetworkSwitcher from 'src/components/login/login-network-switcher.vue';
import { defineComponent } from 'vue';
import { mapGetters } from 'vuex';

export default defineComponent({

  components:{
    loginNetworkSwitcher
  }
})
</script>
