const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const local = process.argv.includes('--local');
const cached = path.join(root, '.icp/cache/tools/icp-cli-aarch64-apple-darwin/icp');
const cli = process.env.ICP_BIN || (fs.existsSync(cached) ? cached : 'icp');
const identity = local ? 'codex-local-check' : 'daoscape-deploy';
const expectedPrincipal = 'kazpp-krjtf-l7n2y-vusih-u27o2-dmbw2-ciimp-jldsp-7wnaf-psl5s-dae';
const expectedCanister = '5hce3-liaaa-aaaao-qqfba-cai';
if (Number(process.versions.node.split('.')[0]) !== 22) throw new Error('Use Node 22 for production deployment.');
const env = { ...process.env, PATH: `${path.dirname(process.execPath)}${path.delimiter}${process.env.PATH}` };
function inspect(args) {
  const result = spawnSync(cli, args, { cwd: root, env, encoding: 'utf8' });
  if (result.error || result.status !== 0) throw new Error(result.error?.message || result.stderr || 'ICP CLI failed');
  return result.stdout.trim();
}
const version = inspect(['--version']);
if (version !== 'icp 1.6.0') throw new Error(`Install the pinned ICP CLI 1.6.0 (found ${version}), or set ICP_BIN to it.`);
if (!local) {
  if (inspect(['identity', 'principal', '--identity', identity]) !== expectedPrincipal) throw new Error('Deployment identity does not match DAOScape.');
  if (!fs.existsSync(path.join(root, '.icp/data/mappings/ic.ids.json'))) throw new Error('Restore the live canister mapping before deployment. Do not create a replacement automatically.');
  const mapping = JSON.parse(fs.readFileSync(path.join(root, '.icp/data/mappings/ic.ids.json'), 'utf8'));
  if (mapping.frontend !== expectedCanister) throw new Error('Live canister mapping does not match DAOScape.');
}
const args = ['deploy', 'frontend', '-e', local ? 'local' : 'ic', '--identity', identity];
if (!local) args.push('--no-create');
const result = spawnSync(cli, args, { cwd: root, env, stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
