<template>
  <div>
    <p v-if="rules.fixed" class="text-caption">{{ rules.score }} / 2 valid guardian approvals. Members do not vote on grants.</p>
    <p v-if="rules.expired" class="text-caption">This proposal has expired.</p>
    <div class="row justify-end q-gutter-xs">
      <q-btn v-if="isProposer" label="Cancel proposal" flat color="negative" size="sm" :disable="busy" @click="act('cancel')" />
      <template v-if="guardian && !rules.expired">
        <q-btn v-if="!hasApproved" label="Approve" color="positive" size="sm" :disable="busy || !policy?.loaded || !!policy.error" @click="act('approve')" />
        <q-btn v-else label="Withdraw approval" flat color="negative" size="sm" :disable="busy" @click="act('unapprove')" />
        <q-btn v-if="rules.executable" label="Execute" color="primary" size="sm" :disable="busy" @click="act('exec')" />
      </template>
      <q-btn v-else-if="!account" label="Sign in" flat size="sm" :disable="busy" @click="$store.dispatch('proton/login')" />
      <span v-else-if="!guardian" class="text-caption">Only current guardians can approve.</span>
    </div>
    <p v-if="hasApproved && !rules.valid.includes(account) && !rules.expired" class="text-caption">Your recorded approval is not currently valid. A current guardian can withdraw and approve again.</p>
    <p v-if="policy?.error" role="alert">{{ policy.error }}</p>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
export default {
  props:{proposal:{type:Object,required:true}},
  computed:{
    ...mapGetters({account:'proton/getAccountName',getIsGuardian:'group/getIsGuardian',getApprovalStatus:'group/getApprovalStatus',policy:'group/getGrantPolicy',busy:'proton/getIsTransacting'}),
    guardian(){return this.getIsGuardian(this.account);},
    rules(){return this.getApprovalStatus(this.proposal);},
    hasApproved(){return this.proposal.approvals?.includes(this.account);},
    isProposer(){return !!this.account&&this.proposal.proposer===this.account;},
  },
  methods:{act(type){this.$emit('useraction',{type,id:this.proposal.id});}},
};
</script>
