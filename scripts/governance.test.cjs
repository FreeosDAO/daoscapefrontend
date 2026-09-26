const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');const {Serialize}=require('@proton/js');const {webcrypto,createHash}=require('node:crypto');
const source=fs.readFileSync(path.join(__dirname,'../src/utils/governance.js'),'utf8').replace("import { Serialize } from '@proton/js';",'').replace(/export /g,'');
const context={Serialize,TextEncoder,TextDecoder,crypto:webcrypto,Error};vm.createContext(context);vm.runInContext(source+'\nthis.codec={governanceDigest,readGovernanceRows,byteLength};',context);const {governanceDigest,readGovernanceRows,byteLength}=context.codec;
test('governance digest matches ABI serialization, including uint64 IDs beyond JS safe integers',async()=>{
 const actions=[{account:'freedaocore',name:'setgovpol',authorization:[{actor:'freedaocore',permission:'active'}],data:'0001'}];
 const id='18446744073709551614';
 const types=Serialize.getTypesFromAbi(Serialize.createTransactionTypes(),{structs:[{name:'payload',base:'',fields:[{name:'parent',type:'name'},{name:'id',type:'uint64'},{name:'actions',type:'action[]'}]}]});
 const b=new Serialize.SerialBuffer({textEncoder:new TextEncoder(),textDecoder:new TextDecoder()});types.get('payload').serialize(b,{parent:'freedaocore',id,actions});
 assert.equal(await governanceDigest('freedaocore',id,actions),createHash('sha256').update(b.asUint8Array()).digest('hex'));
 assert.notEqual(await governanceDigest('freedaocore','1',actions),await governanceDigest('freedaocore','2',actions));
});
test('governance pagination loads every page and rejects looping RPC cursors',async()=>{
 let calls=0;const rows=await readGovernanceRows({get_table_rows:async q=>{calls++;return q.lower_bound?{rows:[{id:2}],more:false}:{rows:[{id:1}],more:true,next_key:'2'};}},'dao','ballots');assert.equal(rows.length,2);assert.equal(calls,2);
 await assert.rejects(readGovernanceRows({get_table_rows:async()=>({rows:[],more:true,next_key:'2'})},'dao','ballots'),/finish loading/);
});
test('content limits count UTF-8 bytes, not code units',()=>{assert.equal(byteLength('🌍'),4);assert.equal(byteLength('café'),5);});
