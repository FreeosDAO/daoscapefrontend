// Display rules mirror the core; signing and execution still enforce them on-chain.
export const chainSeconds = value => typeof value === 'number' ? value : Date.parse(/Z$/.test(value) ? value : `${value}Z`) / 1000;
export function validGuardian(guardian, seat, now, inactiveAfter = 0, checkAlive = false) {
  if (!guardian) return false;
  if (seat?.holder === guardian.account && (seat.recalled || now >= Number(seat.ends))) return false;
  if (checkAlive) {
    const active = chainSeconds(guardian.last_active);
    if (!Number.isFinite(active) || active === 0 || (inactiveAfter && now - active >= inactiveAfter)) return false;
  }
  return true;
}
export function requiresTwoGuardians(dao, actions) {
  return (actions || []).some(a => a.name === 'transfer' || (a.account === dao && a.name === 'setmprops'));
}
export function approvalStatus({dao, proposal, policy, guardians, threshold, now, inactiveAfter = 0}) {
  const fixed = !!policy?.available && requiresTwoGuardians(dao, proposal.actions);
  const required = fixed ? 2 : Number(threshold?.threshold ?? Infinity);
  const valid = [...new Set(proposal.approvals || [])].filter(account => {
    const guardian = guardians.find(g => g.account === account);
    if (!validGuardian(guardian, policy?.seat, now, inactiveAfter, fixed)) return false;
    if (policy?.pilot) {
      const tag = policy.tags?.[proposal.id]?.find(t => t.account === account);
      if (!tag || String(tag.generation) !== String(policy.seat?.holder === account ? policy.seat.generation : 0)) return false;
    }
    return true;
  });
  const score = fixed ? valid.length : valid.reduce((sum, account) => sum + Number(guardians.find(g => g.account === account).weight), 0);
  const expired = now >= chainSeconds(proposal.expiration);
  return {fixed, required, score, valid, expired, executable:!!policy?.loaded && !policy.error && !expired && required >= 0 && score >= required};
}
export function constitutionalAction(dao, action) {
  const core = ['updateconf','repairconf','setgovpol','setgranttok','manthreshold','manthreshlin','linkmodule','unlinkmodule','invitecust','removecust','updaterole','updateprivs','setuiframe','filepublish','filedelete'];
  const system = ['setcode','setabi','updateauth','deleteauth','linkauth','unlinkauth'];
  return (action.account === dao && core.includes(action.name)) || (action.account === 'eosio' && system.includes(action.name));
}
export function grantAssets(rows = []) {
  const assets = [{token_contract:'eosio.token',token_symbol:'4,XPR',enabled:true}];
  for (const row of rows) {
    const index = assets.findIndex(a => a.token_contract === row.token_contract && a.token_symbol === row.token_symbol);
    if (index < 0) assets.push(row); else assets[index] = row;
  }
  return assets.filter(a => a.enabled);
}
