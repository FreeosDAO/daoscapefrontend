# DAOScape on ICP

Deployment date: 26 September 2026.

- Frontend canister: `5hce3-liaaa-aaaao-qqfba-cai`
- Public site: https://5hce3-liaaa-aaaao-qqfba-cai.icp0.io/
- Deployment identity: `daoscape-deploy` (macOS keychain)
- Controller: `kazpp-krjtf-l7n2y-vusih-u27o2-dmbw2-ciimp-jldsp-7wnaf-psl5s-dae`
- Mainnet mapping: `.icp/data/mappings/ic.ids.json`. Preserve this in version control.
- Host: DFINITY static-site recipe `v0.4.0`, ICP CLI `1.6.0`.
- App backend: existing XPR mainnet contracts, registry `daoscapehub`.

This is a new frontend canister, independent of the old Fleek deployment.
Users connect their XPR wallets on the new origin. LocalDAO and local test
account signing are excluded from the production build.

## Update the live site

Use Node 22 (`nvm use 22`) and ICP CLI 1.6.0. Install the pinned CLI from the
[official release](https://github.com/dfinity/icp-cli/releases/tag/v1.6.0) and
verify its release checksum. The initial deployment used the checksum-verified
Apple Silicon binary in `.icp/cache/tools/icp-cli-aarch64-apple-darwin/icp`.
The wrapper uses that binary when present, otherwise `icp` on PATH; `ICP_BIN`
can specify another installation of the pinned version.

```sh
npm ci
npm run check:mainnet
npm run deploy:icp
```

The deploy script verifies the CLI version, controller identity and canister
mapping, then builds, tests, scans for test-wallet/private-key code and deploys.
It refuses to create a replacement canister. It does not convert funds on updates.
The ICP recipe serves `dist/spa`, applies `_headers`, and uses `_redirects` for
history-mode routes. Deployment uploads only changed assets. Header policy
allows the WebAuth popup to communicate with its opener.

## Test ICP hosting locally

```sh
icp network start -d
npm run deploy:icp:local
```

Use CLI 1.6.0 for both commands (or the cached binary above). Port 8000 hosts
this project's local ICP network. The local deployment uses `codex-local-check`.
It still builds a production frontend connected to XPR mainnet. For the separate
private XPR development chain, see `../local-chain/README.md` and `npm run dev:local`.

## Funding and recovery

The dedicated identity received 2 ICP. Initial conversion consumed 1.28411456 ICP
including the transfer fee, credited 3,000,000,019,440 cycles, and left 0.71588544 ICP.
The first canister creation was funded with 2 trillion cycles; creation fees and
runtime costs reduce the canister's usable balance. Check current balances before
future top-ups:

```sh
icp canister status frontend -e ic --identity daoscape-deploy
icp cycles balance -n ic --identity daoscape-deploy
icp token balance -n ic --identity daoscape-deploy
```

Immediately after upload, the canister held approximately 1.463 trillion cycles,
with 0.9999 trillion cycles still in the identity's cycles-ledger balance.
These are a deployment snapshot, not current balances or a runtime guarantee.

Initial verification returned certified HTTP 200 responses matching the build
for `/`, `/browse`, `/manage/freedaocore/proposals`, the login redirect and the
production manifest. The browser loaded all nine DAOs from live XPR contracts.
The live wallet selector opened the WebAuth login page successfully. Completing
wallet authentication and approving transactions require the user's wallet;
deployment verification did not sign any XPR transactions.
The deployed static-site state hash was
`87d90b3147efd18b8b38573bb970142e4e5fd421e5aa6a1efe6f43245f1f9ea0`.

To add cycles from the identity's remaining cycles balance when needed:

```sh
icp canister top-up frontend -e ic --identity daoscape-deploy --amount 500000000000
```

Identity recovery instructions are in `../DEPLOYMENT-IDENTITY.md`. Keep the
recovery phrase outside this repository and back it up securely; it controls
future upgrades. The phrase and private key are never frontend assets.


## Governance frontend update — 26 September 2026

Added opt-in Sortition and Member Governance pages, public group discussions and
ballots, electorate/term/recall views, and member proposal payload verification.
Navigation depends on each DAO's module registry. At the time of this frontend
release, XPR activation was pending. The subsequent FreeDAOCore pilot deployment
is now complete; see `../governance-pilot/README.md` for current lifecycle status.

The production release passed seven unit checks and the local-signing exclusion
scan. Mobile proposal creation and voting were signed on the isolated local chain;
production WebAuth opening, cancellation and retry were checked without signing
mainnet transactions. All nine live DAOs loaded after the update.

Deployed state hash:
`6966fe790da530ed0348444bfe1f0861f61e02b908ac782a79898812d6238bfe`.
The served index and new governance bundle match the production build. Evidence
and transaction IDs are in `../governance-pilot/evidence/`.

## DAO creation redesign — 27 September 2026 (NZ)

Restyled `/create` and `/create/:newgroupname`, including account naming, hub
deposits and withdrawals, account creation, activation, wallet confirmation,
errors and completion. Uses the same paper, green and serif design as the other
DAOScape pages, with responsive layouts and a matching funding dialog. Removed
the wizard's obsolete Anchor-only session gate; production authentication still
uses the existing XPR wallet workflow.

Thirteen regression checks passed, including failed and stale name checks,
wallet rejection, resource price changes, invalid amounts and unloaded balances.
Browser verification covered 320/390/768/1440px layouts, prefilled-name login
redirects, funding dialogs, and a simulated complete creation flow with wallet
rejection/retry. These checks did not sign mainnet transactions or create a DAO.
The underlying contract deployment action payloads remain unchanged.

Deployed static-site state hash:
`e087fe1ff88f72ecd7cdd4fa6ffdea38f261ed0e9c261466412ed48775fe077b`.
Asset comparison evidence is committed in `releases/2026-09-27-create.json`.
Local screenshots and browser traces remain in ignored `output/playwright/`.
This redesign is separate from the future guided module installer in Decision
D001; it does not install the FreeDAOCore pilot modules for newly created DAOs.
