<template>
  <div v-if="getAppConfig && getAccountName" class="hub-wallet">
    <div class="hub-balance"><span><q-icon name="account_balance_wallet" /> Your hub deposit</span><strong>{{ balance.toFixed(selected_asset.precision) }} {{ selected_asset.symbol }}</strong><q-btn flat round icon="refresh" aria-label="Refresh hub deposit balance" :loading="is_loading_deposits" @click="refresh_deposits" /></div>
    <q-tabs v-model="active_tab" align="left" no-caps active-color="primary" indicator-color="primary"><q-tab label="Deposit" name="deposit" /><q-tab label="Withdraw" name="withdraw" /></q-tabs>
    <q-input v-model="input_value" :dark="false" class="q-mt-md" type="number" outlined label="Amount" min="0" :step="10 ** -selected_asset.precision" :hint="active_tab === 'withdraw' ? 'Withdraw unused funds to your connected wallet.' : `Send funds to ${getAppConfig.groups_contract} from your connected wallet.`" :disable="busy"><template #append><span class="hub-symbol">{{ selected_asset.symbol }}</span></template></q-input>
    <p v-if="error" class="hub-error" role="alert">{{ error }}</p>
    <div class="hub-actions"><span v-if="busy" role="status">Confirm in your wallet…</span><q-btn v-if="active_tab === 'withdraw'" unelevated label="Withdraw to wallet" color="primary" :loading="is_withdrawing" :disable="!can_withdraw || busy" @click="withdraw" /><q-btn v-else unelevated label="Deposit funds" color="primary" :loading="is_transfering" :disable="!validAmount || busy" @click="deposit" /></div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import { notifySuccess } from 'src/imports/notifications';
export default {
  name: 'hubDepositWallet',
  props: { default_input_value: { type: Number, default: 0 } },
  data: () => ({ active_tab: 'deposit', input_value: '', is_transfering: false, is_withdrawing: false, is_loading_deposits: false, error: '' }),
  computed: {
    ...mapGetters({ getAccountName: 'proton/getAccountName', getAppConfig: 'app/getAppConfig', getHubDeposits: 'user/getHubDeposits' }),
    selected_asset() { return this.getAppConfig.system_token; },
    balance() { const token = this.selected_asset; const row = (Array.isArray(this.getHubDeposits) ? this.getHubDeposits : []).find(d => d.symbol === token.symbol && d.contract === token.contract); return parseFloat(row?.quantity || '0'); },
    validAmount() { const value = Number(this.input_value); return Number.isFinite(value) && value > 0 && value < 1e12 && Number(value.toFixed(this.selected_asset.precision)) === value; },
    can_withdraw() { return this.validAmount && Number(this.input_value) <= this.balance; },
    busy() { return this.is_transfering || this.is_withdrawing; },
  },
  methods: {
    async refresh_deposits() {
      this.is_loading_deposits = true;
      try { await this.$store.dispatch('user/fetchHubDeposits', { accountname: this.getAccountName, vm: this }); }
      catch (_) { this.error = 'Could not refresh your balance. Check your connection and retry.'; }
      finally { this.is_loading_deposits = false; }
    },
    async deposit() {
      if (!this.validAmount || this.busy) return;
      const token = this.selected_asset;
      const quantity = `${Number(this.input_value).toFixed(token.precision)} ${token.symbol}`;
      const actions = [
        { account: this.getAppConfig.groups_contract, name: 'opendeposit', data: { account: this.getAccountName, ram_payer: this.getAccountName, amount: { contract: token.contract, quantity: `${(0).toFixed(token.precision)} ${token.symbol}` } } },
        { account: token.contract, name: 'transfer', data: { from: this.getAccountName, to: this.getAppConfig.groups_contract, quantity, memo: '' } },
      ];
      await this.submit(actions, 'is_transfering', `Deposited ${quantity}`);
    },
    async withdraw() {
      if (!this.can_withdraw || this.busy) return;
      const token = this.selected_asset;
      const quantity = `${Number(this.input_value).toFixed(token.precision)} ${token.symbol}`;
      await this.submit([{ account: this.getAppConfig.groups_contract, name: 'withdraw', data: { account: this.getAccountName, amount: { contract: token.contract, quantity } } }], 'is_withdrawing', `Withdrawn ${quantity}`);
    },
    async submit(actions, flag, message) {
      this[flag] = true; this.error = '';
      try {
        const receipt = await this.$store.dispatch('proton/transact', { actions, disable_signing_overlay: true });
        if (!receipt?.trxid) { this.error = 'Transaction was not confirmed. Check your wallet and refresh your balance before retrying.'; return; }
        notifySuccess({ message });
        this.input_value = '';
        await this.refresh_deposits();
      } catch (_) { this.error = 'Transaction was not confirmed. Check your wallet and refresh your balance before retrying.'; }
      finally { this[flag] = false; }
    },
  },
  mounted() { this.input_value = this.default_input_value > 0 ? this.default_input_value.toFixed(this.selected_asset.precision) : ''; this.refresh_deposits(); },
};
</script>
<style scoped>
.hub-wallet { color: #17272b; background: #fffefa; border: 1px solid #e0e5da; border-radius: 12px; padding: 18px; }
.hub-balance { display: flex; flex-wrap: wrap; align-items: center; column-gap: 10px; padding-bottom: 12px; }
.hub-balance > span { width: 100%; color: #68776d; font-size: 12px; }
.hub-balance > span .q-icon { font-size: 17px; margin-right: 5px; }
.hub-balance strong { font-size: 20px; font-weight: 500; overflow-wrap: anywhere; }
.hub-balance .q-btn { margin-left: auto; }
.hub-wallet :deep(.q-btn) { border-radius: 24px; text-transform: none; min-height: 44px; letter-spacing: 0; }
.hub-wallet :deep(.q-field__native) { color: #17272b; }
.hub-wallet :deep(.q-field__control) { border-radius: 9px; }
.hub-wallet :deep(.q-field__bottom) { color: #6c7970; line-height: 1.5; padding-bottom: 4px; }
.hub-wallet :deep(.q-tab) { min-height: 44px; }
.hub-symbol { color: #617366; font-size: 13px; }
.hub-actions { display: flex; justify-content: flex-end; align-items: center; flex-wrap: wrap; gap: 12px; margin-top: 26px; }
.hub-actions > span { font-size: 12px; color: #67766e; }
.hub-error { font-size: 12px; color: #993c39; background: #fff0ed; padding: 12px; border-radius: 8px; margin: 20px 0 0; line-height: 1.6; text-align: left; }
</style>
