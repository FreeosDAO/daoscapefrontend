<template>
  <q-page class="dao-page dao-wallet">
    <page-header title="Treasury" eyebrow="Community workspace" description="Shared resources, shared decisions. Manage your DAO’s assets and prepare transfers." />
    <div class="dao-treasury-grid">
      <q-card><q-toolbar><q-toolbar-title>Prepare a transfer</q-toolbar-title><q-icon name="mdi-wallet-outline" size="24px" color="primary" /></q-toolbar><q-card-section><action-proposer><template #default="props"><transfer @propose="props.propose" @addtobucket="props.addtobucket" /></template></action-proposer></q-card-section></q-card>
      <div>
        <q-card class="q-mb-lg"><q-toolbar><q-toolbar-title>DAO balances</q-toolbar-title><q-badge>{{ getGroupWallet.length }} {{ getGroupWallet.length === 1 ? 'asset' : 'assets' }}</q-badge></q-toolbar><q-list separator><q-item v-for="token in getGroupWallet" :key="`${token.contract}-${token.symbol}`"><q-item-section avatar><q-avatar color="grey-2" text-color="primary" icon="mdi-currency-usd" /></q-item-section><q-item-section><q-item-label>{{ token.symbol }}</q-item-label><q-item-label caption>{{ token.contract }}</q-item-label></q-item-section><q-item-section side><strong>{{ token.amount }}</strong></q-item-section></q-item><q-item v-if="!getGroupWallet.length"><q-item-section>No assets yet</q-item-section></q-item></q-list></q-card>
        <aside class="dao-treasury-note"><q-icon name="mdi-shield-check-outline" /><h2>Governed together</h2><p>Transfers are added to your proposal’s action bucket. Your DAO’s approval rules apply before funds can move.</p><p>To fund this treasury, send supported tokens to:</p><div class="row items-center justify-between"><span class="dao-address">{{ getActiveGroup }}</span><q-btn flat round icon="content_copy" aria-label="Copy treasury account" @click="copyAccount" /></div></aside>
      </div>
    </div>
  </q-page>
</template>
<script>
import { mapGetters } from 'vuex';
import { copyToClipboard } from 'quasar';
import { notifySuccess, notifyError } from 'src/imports/notifications';
import actionProposer from 'components/actions/action-proposer';
import transfer from 'components/actions/transfer';
import pageHeader from 'components/page-header';
export default {
  components: { actionProposer, transfer, pageHeader },
  computed: { ...mapGetters({ getGroupWallet: 'group/getGroupWallet', getActiveGroup: 'group/getActiveGroup' }) },
  methods: { async copyAccount() { try { await copyToClipboard(this.getActiveGroup); notifySuccess({ message: 'Treasury account copied' }); } catch { notifyError({ message: 'Could not copy the account name' }); } } },
};
</script>
