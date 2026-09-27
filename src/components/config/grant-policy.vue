<template>
  <q-card v-if="policy?.available" class="q-mb-lg">
    <q-card-section>
      <h2 class="dao-section-title">Proposals and grants</h2>
      <p>Grants require approval from at least two distinct, current guardians. Members keep their votes on constitutional changes and recall.</p>
      <p><strong>Member submissions: {{ policy.memberProposals ? 'On' : 'Off' }}</strong></p>
      <p>When enabled, eligible members can submit ordinary proposals, but cannot approve them. Switching this off leaves existing proposals in place. Guardians can always submit.</p>
      <q-toggle v-model="enabled" label="Allow member proposal submissions" :disable="!guardian || busy" />
      <p class="text-caption">Changing this setting requires two guardian approvals. Submissions: one outstanding proposal per member, at least 60 seconds apart; title 120 bytes and explanation 4,096 bytes maximum.</p>
      <q-btn color="primary" label="Propose submission setting" :loading="busy" :disable="!guardian || enabled === policy.memberProposals" @click="propose" />
      <p v-if="message" role="status" class="q-mt-md">{{ message }}</p>
      <q-separator class="q-my-lg" />
      <h3 class="text-h6">Approved grant assets</h3>
      <p>The Treasury can hold other tokens. This policy controls which tokens guardians can pay out through ordinary proposals.</p>
      <ul><li v-for="asset in assets" :key="asset.token_contract + asset.token_symbol">{{ asset.token_symbol }} · {{ asset.token_contract }}</li></ul>
      <p v-if="!assets.length">No assets are currently approved for grant payments.</p>
      <q-btn flat color="primary" label="Change asset policy in Member Governance" :to="`/manage/${dao}/member-governance`" />
    </q-card-section>
  </q-card>
  <q-banner v-else-if="policy?.error" class="q-mb-md">{{ policy.error }}</q-banner>
</template>
<script>
import { mapGetters } from 'vuex';
import { grantAssets } from 'src/utils/guardian-grants';
export default {
  data:()=>({enabled:false,busy:false,message:''}),
  computed:{
    ...mapGetters({policy:'group/getGrantPolicy',account:'proton/getAccountName',getIsGuardian:'group/getIsGuardian',dao:'group/getActiveGroup'}),
    guardian(){return !!this.getIsGuardian(this.account);},
    assets(){return grantAssets(this.policy?.tokens);},
  },
  watch:{'policy.memberProposals':{immediate:true,handler(value){this.enabled=!!value;}}},
  methods:{async propose(){this.busy=true;this.message='';try{
    const result=await this.$store.dispatch('group/propose',{vm:this,data:{title:`${this.enabled?'Enable':'Disable'} member proposal submissions`,description:'Members may submit ordinary proposals only while this setting is enabled. Guardian approval requirements and existing proposals are unchanged.',actions:[{account:this.dao,name:'setmprops',authorization:[{actor:this.dao,permission:'active'}],data:{enabled:this.enabled}}]}});
    this.message=result?.trxid?'Proposal submitted with your guardian approval. A second guardian must approve it before execution.':'No transaction confirmed. You can retry.';
  }catch(e){this.message=e.message;}finally{this.busy=false;}}},
};
</script>
