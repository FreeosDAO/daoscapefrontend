<template>
  <q-page class="dao-page governance-page">
    <page-header :title="isSortition ? 'Fractal Sortition' : 'Member Governance'" eyebrow="A voice in your community" :description="isSortition ? 'Apply, deliberate with your peers, and take your turn as a guardian.' : 'Members decide the rules. Review constitutional changes and hold your elected guardian accountable.'">
      <q-btn flat icon="refresh" label="Refresh" :loading="loading" @click="load" />
    </page-header>
    <q-banner v-if="error" class="gov-notice q-mb-md" role="alert">{{ error }}<template #action><q-btn flat label="Retry" @click="load" /></template></q-banner>
    <div v-if="loading && !config" class="dao-empty" role="status"><q-spinner color="primary" size="36px" /><p>Loading governance…</p></div>
    <div v-else-if="!config" class="dao-empty"><q-icon name="how_to_vote" /><h2>Governance modules are not enabled</h2><p>This DAO continues to use its existing governance.</p></div>
    <template v-else>
      <div class="dao-stat-strip">
        <div class="dao-stat"><span>Identity policy</span><strong>{{ config.rules.kyc ? 'KYC enabled' : 'KYC off' }}</strong></div>
        <div class="dao-stat"><span>Timing</span><strong>{{ config.rules.normal ? 'Normal' : 'Accelerated pilot' }}</strong></div>
        <div class="dao-stat"><span>Your participation</span><strong>{{ eligible ? 'Eligible member' : 'Not currently eligible' }}</strong></div>
      </div>
      <p class="gov-caption">Eligibility is recorded when each process opens. Existing votes keep their original rules. This pilot retains deployment and recovery overrides. KYC requires an XPR verified record with both firstname and lastname in one KYC level; membership itself is retained.</p>
      <q-card v-if="seat && seat.holder" flat class="q-mb-lg"><q-card-section class="gov-spread"><div><span class="gov-eyebrow">Elected guardian</span><h2>{{ seat.holder }}</h2><p>{{ seat.recalled ? 'Recalled · awaiting handover' : seat.ends <= now ? 'Term expired · awaiting handover' : `Term ends ${date(seat.ends)}` }}</p></div><q-btn v-if="!isSortition && !seat.recalled && seat.ends > now" outline label="Start recall petition" :disable="busy || !eligible" @click="openDialog('recall')" /></q-card-section></q-card>
      <template v-if="isSortition">
        <div class="gov-spread q-mb-md"><h2>Selection cycles</h2><q-btn color="primary" unelevated label="Open applications" icon="add" :disable="busy || !eligible || !!(cycles[0] && cycles[0].phase < 8)" @click="send(config.sortition, 'start', { member: account })" /></div>
        <q-select v-if="cycles.length" outlined :model-value="selectedCycle" :options="cycles.map(c => ({label: `Cycle ${c.id} · ${cyclePhases[c.phase]}`, value: c.id}))" emit-value map-options label="Cycle" class="q-mb-lg" @update:model-value="selectCycle" />
        <div v-if="!cycle" class="dao-empty"><q-icon name="groups" /><h2>A guardian begins with a conversation</h2><p>Open applications, then gather at least six eligible candidates. Existing permanent guardians keep their seats.</p></div>
        <template v-else>
          <q-card flat class="q-mb-lg"><q-card-section class="gov-spread"><div><span class="gov-eyebrow">{{ cyclePhases[cycle.phase] }}</span><h2>Cycle {{ cycle.id }}</h2><p v-if="[1,3,4,5].includes(cycle.phase)">{{ date(cycle.closes) }} · {{ remaining(cycle.closes) }}</p><p v-if="[2,6].includes(cycle.phase)">Waiting for XPR Network’s randomness service. No replacement draw will be substituted.</p><p v-if="cycle.outcome">{{ cycle.outcome }}</p></div><div class="gov-buttons"><q-btn v-if="cycle.phase === 1 && cycle.closes > now" color="primary" label="Apply / edit statement" :disable="busy || !inCycle || permanent" @click="openDialog('apply')" /><q-btn v-if="cycle.phase === 1 && mine && cycle.closes > now" flat label="Withdraw" :disable="busy" @click="send(config.sortition,'withdraw',{candidate:account,cycle_id:cycle.id})" /><q-btn outline label="Advance phase" :disable="busy || [0,2,6,8,9].includes(cycle.phase)" @click="send(config.sortition,'advance',{cycle_id:cycle.id})" /></div></q-card-section></q-card>
          <details v-if="cycleRequests.length" class="gov-audit q-mb-lg"><summary>Randomness requests · {{ cycleRequests.length }}</summary><p v-for="request in cycleRequests" :key="request.id">Request #{{ request.id }} · {{ request.fulfilled ? 'Delivered' : 'Waiting for XPR RNG' }} · {{ request.phase === 6 ? 'Shortlist order' : 'Group assignment' }}<code v-if="request.fulfilled" class="gov-hash">{{ request.result }}</code></p></details>
          <q-card v-if="cycle.queue.length" flat class="q-mb-lg"><q-card-section><h2>Guardian queue</h2><p>Drawn once. Each nominee serves at most once from this shortlist.</p><ol class="gov-queue"><li v-for="(person,index) in cycle.queue" :key="person"><strong>{{ person }}</strong><span>{{ index < cycle.queue_index ? 'Used / considered' : 'Awaiting a turn' }}</span></li></ol></q-card-section></q-card>
          <div v-if="cycle.phase === 1" class="gov-grid"><q-card v-for="person in candidates" :key="person.account" flat><q-card-section><h2>{{ person.account }}</h2><p class="gov-text">{{ person.statement }}</p></q-card-section></q-card></div>
          <div v-else class="gov-grid">
            <q-card v-for="group in groups" :key="group.id" flat><q-card-section><span class="gov-eyebrow">Round {{ group.round }}</span><h2>Group {{ Number(group.id) % 100 + 1 }}</h2><div v-for="person in group.accounts" :key="person" class="gov-person"><div><strong>{{ person }}</strong><p class="gov-text">{{ (candidates.find(c => c.account === person) || {}).statement }}</p></div><q-btn v-if="[4,5].includes(cycle.phase) && cycle.closes > now && group.round === cycle.round && group.accounts.includes(account) && person !== account && !group.nominee" flat :label="myVote && myVote.nominee === person && myVote.stage === cycle.phase ? 'Your vote' : 'Vote'" :disable="busy" @click="send(config.sortition,'vote',{voter:account,cycle_id:cycle.id,nominee:person})" /></div><q-badge v-if="group.nominee" color="primary">Nominee: {{ group.nominee }}</q-badge><p v-else class="gov-caption">{{ Math.floor(group.accounts.length / 2) + 1 }} votes needed. No self-votes.</p><details v-if="peerVotes.some(v => v.group === group.id)" class="gov-audit"><summary>Public peer ballots</summary><p v-for="vote in peerVotes.filter(v => v.group === group.id)" :key="vote.voter">{{ vote.voter }} → {{ vote.nominee }} <small>({{ vote.stage === 5 ? 'runoff' : 'first ballot' }})</small></p></details><q-separator class="q-my-md" /><div v-for="post in posts.filter(p => p.group === group.id)" :key="post.id" class="gov-post"><strong>{{ post.author }}</strong><small>{{ date(post.created) }}</small><p class="gov-text">{{ post.body }}</p></div><q-btn v-if="cycle.phase === 3 && cycle.closes > now && group.round === cycle.round && group.accounts.includes(account)" outline label="Join discussion" :disable="busy" @click="openDialog('post')" /></q-card-section></q-card>
          </div>
        </template>
      </template>
      <template v-else>
        <div class="gov-spread q-mb-lg"><div><h2>Decisions by members</h2><p>30% turnout · more yes than no votes · 10% support to open a recall ballot</p></div><q-btn color="primary" unelevated icon="add" label="Propose a change" :disable="busy || !eligible" @click="openDialog('proposal')" /></div>
        <div v-if="!ballots.length" class="dao-empty"><q-icon name="how_to_vote" /><h2>No member decisions yet</h2><p>Propose a change to KYC, timing, or another constitutional setting.</p></div>
        <div class="gov-grid"><q-card v-for="ballot in ballots" :key="ballot.id" flat><q-card-section><span class="gov-eyebrow">{{ ballotPhases[ballot.phase] }} · #{{ ballot.id }}</span><h2>{{ ballot.title }}</h2><p class="gov-text">{{ ballot.reason }}</p><p>Proposed by {{ ballot.proposer }}</p><p>{{ ballot.electorate }} eligible accounts · {{ ballot.kyc ? 'KYC required' : 'KYC off' }}</p><p v-if="ballot.phase < 3">{{ remaining(ballot.closes) }} · {{ date(ballot.closes) }}</p><div v-if="ballot.recall && ballot.phase === 1"><p>{{ ballot.supporters }} / {{ Math.ceil(ballot.electorate / 10) }} petition supporters</p><q-btn outline label="Support petition" :disable="busy || !electorates[ballot.id]?.includes(account) || ballot.closes <= now" @click="send(config.membergov,'support',{member:account,id:ballot.id})" /></div><template v-else><div class="gov-tally"><span>{{ ballot.yes }} Yes</span><span>{{ ballot.no }} No</span><span>{{ Math.ceil(ballot.electorate * .3) }} turnout needed</span></div><div v-if="ballot.phase === 2 && ballot.closes > now" class="gov-buttons"><q-btn color="primary" label="Vote yes" :disable="busy || !electorates[ballot.id]?.includes(account)" @click="send(config.membergov,'vote',{member:account,id:ballot.id,yes:true})" /><q-btn outline label="Vote no" :disable="busy || !electorates[ballot.id]?.includes(account)" @click="send(config.membergov,'vote',{member:account,id:ballot.id,yes:false})" /></div></template><div class="gov-buttons q-mt-md"><q-btn v-if="[1,2].includes(ballot.phase) && ballot.closes <= now" outline label="Finalize" :disable="busy" @click="send(config.membergov,'finalize',{id:ballot.id})" /><q-btn v-if="!ballot.recall" flat label="Review transaction" @click="review(ballot)" /><q-btn v-if="ballot.phase === 3 && ballot.expires > now" color="primary" label="Execute approved change" :disable="busy" @click="openExecution(ballot)" /><span v-if="ballot.phase === 3 && ballot.expires <= now">Execution approval expired</span></div></q-card-section></q-card></div>
      </template>
    </template>
    <q-dialog v-model="dialog" :persistent="busy"><q-card class="gov-dialog" role="dialog" aria-modal="true" :aria-label="dialogTitle"><q-card-section><h2>{{ dialogTitle }}</h2><q-btn class="gov-close" flat round icon="close" aria-label="Close dialog" :disable="busy" v-close-popup /></q-card-section><q-card-section class="q-gutter-md">
      <template v-if="dialogKind === 'proposal'"><q-input outlined v-model="title" label="Title" maxlength="120" /><q-select outlined v-model="proposalType" :options="proposalOptions" map-options emit-value label="Change" /><template v-if="proposalType === 'policy'"><q-toggle v-model="proposedKyc" label="Require KYC for voters and candidates" /><q-toggle v-model="proposedNormal" label="Use normal timing (off = accelerated pilot)" /></template><template v-else-if="proposalType === 'asset'"><q-input outlined v-model="tokenContract" label="Token contract account" /><q-input outlined v-model="tokenSymbol" label="Precision and symbol (e.g. 4,FREEOS)" /><q-toggle v-model="tokenEnabled" label="Allow guardians to pay grants in this asset" /><p class="gov-caption">This approves a token type, not a payment. Each grant still needs two guardian approvals for its exact amount and recipient.</p></template><q-input v-else outlined v-model="payload" type="textarea" label="Action array (JSON)" autogrow /><p class="gov-caption">The signed ballot commits to the exact transaction. Download its payload and share it with voters; the contract stores its hash.</p></template>
      <q-input v-if="['apply','post','recall','proposal'].includes(dialogKind)" outlined v-model="body" type="textarea" autogrow :label="dialogKind === 'apply' ? 'Candidate statement' : dialogKind === 'post' ? 'Message' : 'Reason and explanation'" /><p v-if="['apply','post','recall','proposal'].includes(dialogKind)" class="gov-caption">{{ bytes(body) }} / {{ ['apply','post'].includes(dialogKind) ? 2048 : 4096 }} UTF-8 bytes<span v-if="dialogKind === 'post'"> · 20 posts per candidate per cycle · 30 seconds between posts</span></p>
      <template v-if="['execute','review'].includes(dialogKind)"><p>Expected hash: <code class="gov-hash">{{ currentBallot?.digest }}</code></p><q-input outlined v-model="payload" type="textarea" autogrow label="Signed proposal payload (JSON)" /><p class="gov-caption">Import the published action array or the downloaded payload object. Its hash must match before execution.</p><q-btn outline label="Verify payload" @click="verifyPayload().catch(() => {})" /><p v-if="payloadStatus" role="status">{{ payloadStatus }}</p></template>
      <p v-if="dialogError" role="alert" class="text-negative">{{ dialogError }}</p>
    </q-card-section><q-card-actions align="right"><q-btn flat label="Cancel" :disable="busy" v-close-popup /><q-btn v-if="dialogKind !== 'review'" color="primary" :label="dialogKind === 'execute' ? 'Sign execution' : 'Sign and submit'" :loading="busy" @click="submitDialog" /></q-card-actions></q-card></q-dialog>
  </q-page>
</template>
<script>
import { mapGetters } from 'vuex';
import { constitutionalAction } from 'src/utils/guardian-grants';
import PageHeader from 'components/page-header';
import { readGovernanceRows, governanceDigest, cyclePhases, ballotPhases, byteLength } from 'src/utils/governance';
export default {
  components: { PageHeader },
  data: () => ({ config:null, seat:null, cycles:[], candidates:[], groups:[], posts:[], ballots:[], electorates:{}, cycleVoters:[], peerVotes:[], requests:[], guardians:[], selectedCycle:null, eligible:false, loading:false, busy:false, error:'', now:Math.floor(Date.now()/1000), timer:null, refreshing:false, requestGeneration:0, dialog:false, dialogKind:'', title:'', body:'', payload:'', proposalType:'policy', tokenContract:'', tokenSymbol:'4,FREEOS', tokenEnabled:true, proposedKyc:false, proposedNormal:false, dialogError:'', payloadStatus:'', currentBallot:null, nextBallot:1, cyclePhases, ballotPhases }),
  computed: {
    ...mapGetters({ account:'proton/getAccountName' }),
    proposalOptions(){return [{label:'KYC and timing policy',value:'policy'},...(this.$store.getters['group/getGrantPolicy']?.available?[{label:'Approved grant asset',value:'asset'}]:[]),{label:'Advanced transaction',value:'advanced'}];},
    dao() { return this.$route.params.groupname; }, isSortition() { return this.$route.path.endsWith('/sortition'); },
    cycle() { return this.cycles.find(c => String(c.id) === String(this.selectedCycle)); },
    cycleRequests() { return this.requests.filter(r => String(r.cycle) === String(this.selectedCycle)); },
    mine() { return this.candidates.find(c => c.account === this.account); },
    permanent() { return this.guardians.some(c => c.account === this.account) && this.seat?.holder !== this.account; },
    inCycle() { return this.cycleVoters.includes(this.account); },
    myVote() { return this.peerVotes.find(v => v.voter === this.account); },
    dialogTitle() { return ({apply:'Stand as a guardian',post:'Group discussion',recall:'Start a recall petition',proposal:'Propose a constitutional change',execute:'Execute the approved transaction',review:'Review the proposed transaction'})[this.dialogKind]; },
  },
  methods: {
    bytes: byteLength,
    date(n) { return n ? new Date(n*1000).toLocaleString() : '—'; },
    remaining(n) { const d=n-this.now;return d<=0?'Ready to finalize':d<3600?`${Math.ceil(d/60)} minutes remaining`:`${Math.ceil(d/3600)} hours remaining`; },
    read(code,table,scope=code,options={}) { return readGovernanceRows(this.$eos.api.rpc,code,table,scope,options); },
    async load() {
      if(this.refreshing||this.loading)return;
      this.refreshing=true;this.loading=true;this.error='';
      const generation=++this.requestGeneration, dao=this.dao, isSortition=this.isSortition, account=this.account;
      const rpc=this.$eos.api.rpc;
      const read=(code,table,scope=code)=>readGovernanceRows(rpc,code,table,scope);
      try {
        const modules=await read(dao,'modules');
        if(!modules.some(m=>m.module_name==='membergov')){if(generation===this.requestGeneration)this.config=null;return;}
        const [configs,seats,guardians,members]=await Promise.all([read(dao,'govconfig'),read(dao,'govseat'),read(dao,'custodians'),read(dao,'members')]);
        const config=configs[0];if(!config)throw new Error('Governance configuration is unavailable.');
        let eligible=members.some(m=>m.account===account);
        if(eligible&&config.rules.kyc){const users=await rpc.get_table_rows({json:true,code:'eosio.proton',scope:'eosio.proton',table:'usersinfo',lower_bound:account,upper_bound:account,limit:1});const u=users.rows.find(u=>u.acc===account);eligible=!!(u?.verified&&u.kyc?.some(k=>k.kyc_level.includes('firstname')&&k.kyc_level.includes('lastname')));}
        const result={config,seat:seats[0],guardians,eligible};
        if(isSortition){
          const [cycles,requests]=await Promise.all([read(config.sortition,'cycles'),read(config.sortition,'requests')]);result.cycles=cycles.reverse();result.requests=requests;
          result.selectedCycle=result.cycles.some(c=>String(c.id)===String(this.selectedCycle))?this.selectedCycle:result.cycles[0]?.id;
          const c=result.cycles.find(c=>String(c.id)===String(result.selectedCycle));
          if(c)[result.candidates,result.groups,result.posts,result.peerVotes,result.cycleVoters]=await Promise.all([read(config.sortition,'candidates',c.id),read(config.sortition,'groups',c.id),read(config.sortition,'posts',c.id),read(config.sortition,'ballots',c.id),read(dao,'govvoters',c.snapshot).then(r=>r.map(v=>v.account))]);
        }else{
          const [ballots,state]=await Promise.all([read(config.membergov,'ballots'),read(config.membergov,'state')]);
          result.ballots=ballots.reverse();result.nextBallot=state[0]?.next_id||1;
          result.electorates=Object.fromEntries(await Promise.all(ballots.filter(b=>b.phase<3).map(async b=>[b.id,(await read(dao,'govvoters',b.snapshot)).map(v=>v.account)])));
        }
        if(generation===this.requestGeneration)Object.assign(this,result);
      }catch(e){if(generation===this.requestGeneration)this.error=e.message||String(e);}
      finally{if(generation===this.requestGeneration){this.loading=false;this.refreshing=false;}}
    },
    async loadCycle(){if(!this.cycle)return;const c=this.cycle,dao=this.dao,generation=++this.requestGeneration;this.loading=true;this.refreshing=false;try{const data=await Promise.all([this.read(this.config.sortition,'candidates',c.id),this.read(this.config.sortition,'groups',c.id),this.read(this.config.sortition,'posts',c.id),this.read(this.config.sortition,'ballots',c.id),this.read(dao,'govvoters',c.snapshot).then(r=>r.map(v=>v.account))]);if(generation===this.requestGeneration&&dao===this.dao&&c.id===this.cycle?.id)[this.candidates,this.groups,this.posts,this.peerVotes,this.cycleVoters]=data;}finally{if(generation===this.requestGeneration)this.loading=false;}},
    async selectCycle(id){this.selectedCycle=id;try{await this.loadCycle();}catch(e){this.error=e.message;}},
    async send(contract,name,data){if(this.loading){this.error='Wait for governance data to finish loading.';return false;}this.busy=true;this.dialogError='';try{const result=await this.$store.dispatch('proton/transact',{actions:[{account:contract,name,data}]});if(!result?.trxid)throw new Error('Transaction was not confirmed. Check your wallet or retry.');if(name==='start')this.selectedCycle=null;await this.load();return true;}catch(e){this.dialogError=e.message;this.error=e.message;return false;}finally{this.busy=false;}},
    openDialog(kind){this.dialogKind=kind;this.dialogError='';this.payloadStatus='';this.title='';this.body=kind==='apply'?(this.mine?.statement||''):'';this.payload='';this.proposedKyc=Boolean(this.config.rules.kyc);this.proposedNormal=Boolean(this.config.rules.normal);this.dialog=true;},
    storedPayload(b){try{return localStorage.getItem(`daoscape:gov:${this.$store.getters['proton/getChainId']}:${this.dao}:${b.id}`)||b.payload||'';}catch(_){return b.payload||'';}},
    review(b){this.openDialog('review');this.currentBallot=b;this.payload=this.storedPayload(b);},
    openExecution(b){this.openDialog('execute');this.currentBallot=b;this.payload=this.storedPayload(b);},
    async parseActions(){const parsed=JSON.parse(this.payload);const actions=Array.isArray(parsed)?parsed:parsed.actions;if(!Array.isArray(actions)||!actions.length||actions.length>7)throw new Error('Provide an array of one to seven actions.');for(const a of actions){if(this.$store.getters['group/getGrantPolicy']?.available && !constitutionalAction(this.dao,a))throw new Error('Grants and member-submission settings belong in guardian Proposals. This action is not a constitutional change.');if(a.authorization?.length!==1||a.authorization[0].actor!==this.dao||!['active','owner'].includes(a.authorization[0].permission))throw new Error('Each action must use this DAO’s active or owner authority.');}return this.$eos.api.serializeActions(actions);},
    async verifyPayload(){try{const actions=await this.parseActions();const digest=await governanceDigest(this.dao,this.currentBallot.id,actions);if(digest!==this.currentBallot.digest)throw new Error('Payload hash does not match this ballot.');this.payloadStatus='Verified: this is the exact transaction approved by this ballot.';return actions;}catch(e){this.payloadStatus=e.message;throw e;}},
    async submitDialog(){this.dialogError='';try{
      let ok=false;if(['apply','post','recall','proposal'].includes(this.dialogKind)){const max=['apply','post'].includes(this.dialogKind)?2048:4096;if(!this.body.trim()||byteLength(this.body)>max)throw new Error(`Please enter between 1 and ${max} UTF-8 bytes.`);}
      if(this.dialogKind==='apply')ok=await this.send(this.config.sortition,'apply',{candidate:this.account,cycle_id:this.cycle.id,statement:this.body});
      if(this.dialogKind==='post')ok=await this.send(this.config.sortition,'discuss',{author:this.account,cycle_id:this.cycle.id,body:this.body});
      if(this.dialogKind==='recall')ok=await this.send(this.config.membergov,'petition',{proposer:this.account,id:this.nextBallot,reason:this.body});
      if(this.dialogKind==='execute'){const actions=await this.verifyPayload();ok=await this.send(this.config.membergov,'execute',{id:this.currentBallot.id,actions});}
      if(this.dialogKind==='proposal'){
        if(!this.title.trim()||byteLength(this.title)>120)throw new Error('Title must be 1–120 UTF-8 bytes.');
        if(this.proposalType==='policy')this.payload=JSON.stringify([{account:this.dao,name:'setgovpol',authorization:[{actor:this.dao,permission:'active'}],data:{kyc:this.proposedKyc,normal:this.proposedNormal}}]);
        if(this.proposalType==='asset'){if(!/^[a-z1-5.]{1,12}$/.test(this.tokenContract)||! /^(?:[0-9]|1[0-8]),[A-Z]{1,7}$/.test(this.tokenSymbol))throw new Error('Enter a valid token contract and precision,symbol.');this.payload=JSON.stringify([{account:this.dao,name:'setgranttok',authorization:[{actor:this.dao,permission:'active'}],data:{token_contract:this.tokenContract,token_symbol:this.tokenSymbol,enabled:this.tokenEnabled}}]);}
        const actions=await this.parseActions();const id=this.nextBallot;const digest=await governanceDigest(this.dao,id,actions);const payload=JSON.stringify({dao:this.dao,id,digest,actions},null,2);
        ok=await this.send(this.config.membergov,'propose',{proposer:this.account,id,title:this.title,reason:this.body,digest,payload:byteLength(payload)<=8192?payload:''});
        if(ok){try{localStorage.setItem(`daoscape:gov:${this.$store.getters['proton/getChainId']}:${this.dao}:${id}`,payload);}catch(_){}const url=URL.createObjectURL(new Blob([payload],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`${this.dao}-ballot-${id}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
      }
      if(ok)this.dialog=false;
    }catch(e){this.dialogError=e.message;}},
  },
  watch: { '$route.path'(){++this.requestGeneration;this.refreshing=false;this.loading=false;this.config=null;this.selectedCycle=null;this.load();}, account(){this.load();} },
  mounted(){this.load();this.timer=setInterval(()=>{this.now=Math.floor(Date.now()/1000);if(!document.hidden&&!this.busy&&!this.dialog&&this.now%15===0)this.load();},1000);},
  beforeUnmount(){clearInterval(this.timer);++this.requestGeneration;},
};
</script>
<style scoped>
.gov-audit{border:1px solid #dce3dc;border-radius:12px;padding:14px;overflow-wrap:anywhere}.gov-audit summary{cursor:pointer;font-size:13px;color:#345a4f}.gov-audit p{font-size:13px;margin:12px 0 0}.gov-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr));gap:20px}.gov-spread{display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap}.governance-page h2,.gov-dialog h2{font-family:Georgia,serif;font-weight:400;font-size:25px;line-height:1.25;margin:8px 0 14px}.gov-eyebrow{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#557369}.gov-buttons{display:flex;gap:10px;flex-wrap:wrap}.gov-caption{color:#66756f;font-size:13px;line-height:1.6}.gov-notice{background:#f3eee3;border-radius:12px}.gov-text{white-space:pre-wrap;overflow-wrap:anywhere}.gov-person{display:flex;align-items:flex-start;gap:12px;border-bottom:1px solid #e2e7df;padding:14px 0}.gov-person>div{flex:1;min-width:0}.gov-post{padding:12px 0;border-bottom:1px solid #e2e7df}.gov-post small{display:block;color:#6d7974}.gov-queue{padding-left:24px}.gov-queue li{padding:10px}.gov-queue span{display:block;color:#6d7974}.gov-tally{display:flex;flex-wrap:wrap;gap:14px;padding:12px 0;font-weight:500}.gov-dialog{width:620px;max-width:calc(100vw - 24px);max-height:90vh;overflow:auto}.gov-close{position:absolute;right:12px;top:12px}.gov-hash{overflow-wrap:anywhere;display:block;font-size:12px}.governance-page code{overflow-wrap:anywhere}@media(max-width:600px){.gov-grid{grid-template-columns:1fr}.gov-buttons{width:100%}.gov-buttons .q-btn{flex:1}.gov-spread{align-items:flex-start}}
</style>
