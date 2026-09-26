import { Serialize } from '@proton/js';

export async function readGovernanceRows(rpc, code, table, scope = code, options = {}) {
  const rows = []; let lower_bound = ''; const seen = new Set();
  do {
    const result = await rpc.get_table_rows({ json: true, code, table, scope, limit: 100, ...options, lower_bound });
    rows.push(...result.rows);
    if (!result.more) return rows;
    lower_bound = result.next_key;
    if (!lower_bound || seen.has(lower_bound) || rows.length > 10000) throw new Error('Unable to finish loading governance data. Please retry.');
    seen.add(lower_bound);
  } while (true);
}

// Same canonical encoding as C++ pack(tuple<name,uint64_t,vector<action>>).
export async function governanceDigest(parent, id, actions) {
  const b = new Serialize.SerialBuffer({ textEncoder: new TextEncoder(), textDecoder: new TextDecoder() });
  b.pushName(parent); Serialize.createInitialTypes().get('uint64').serialize(b, String(id)); b.pushVaruint32(actions.length);
  for (const a of actions) {
    b.pushName(a.account); b.pushName(a.name); b.pushVaruint32(a.authorization.length);
    for (const auth of a.authorization) { b.pushName(auth.actor); b.pushName(auth.permission); }
    b.pushBytes(Serialize.hexToUint8Array(a.data));
  }
  const hash = await crypto.subtle.digest('SHA-256', b.asUint8Array());
  return Array.from(new Uint8Array(hash), n => n.toString(16).padStart(2, '0')).join('');
}

export const cyclePhases = ['Preparing electorate', 'Applications open', 'Awaiting group randomness', 'Group discussion', 'Peer voting', 'Runoff voting', 'Awaiting shortlist randomness', 'Guardian rotation', 'Cycle closed', 'Shortlist completed'];
export const ballotPhases = ['Preparing electorate', 'Petition open', 'Voting open', 'Approved', 'Not passed', 'Executed'];
export const byteLength = value => new TextEncoder().encode(value || '').length;
