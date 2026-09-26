# The DAOScape by FreeDAO (thedaoscapefrontend)

Empowerment Of Decentralized Communities.

## Run with the private local backend

Use Node 22 (`.nvmrc`). From the workspace, follow `../local-chain/README.md` to
start and seed the private chain, then run:

```bash
npm ci
npm run dev:local
```

Open http://127.0.0.1:8080. The header says **LOCAL**. Click login and choose
`alice`, `bob`, or `carol`; these development accounts sign against the private
chain at port 8888. The generated `.local-chain.json` is ignored by Git and its
key is included only in this explicit development mode, never in production builds.

## Run locally against the existing public network

From this directory:

```bash
npm ci
npm run dev
```

Open http://127.0.0.1:8080. The development server binds to loopback and does not
open a browser automatically. If the port is occupied, use `npm run dev -- --port 8081`.

This runs the frontend locally against **live XPR mainnet** by default, using the
existing `daoscapehub` registry. It is not a local blockchain or an offline demo.
Browsing requires no wallet; signing transactions affects the selected live network.
The network menu also offers the existing Proton testnet configuration.
No ICP replica, backend server, private keys, or environment file is needed to browse.

The committed npm lockfile was restored on 24 September 2026. Development and
production builds were verified with Node 22.23.2. `.npmrc` enables legacy peer resolution because the 2023 dependency
tree includes incompatible peer declarations (including model-viewer/three and
old Vue integrations). This restores the original versions; it does not resolve
their compatibility or security debt. Node 23 on the workstation ran development
mode but failed to finish a production build; use Node 22 for both.

Useful routes:

- `/browse`: the existing DAO registry.
- `/members/freedaocore`: public DAO details without logging in.
- `/manage/freedaocore`: redirects to login when signed out.

### Build the app for production

Use Node 22 (`nvm install 22 && nvm use 22`).

```bash
npm run test:production
npm run check:mainnet
npm run build
```

The production script forces local mode off even if `DAOSCAPE_LOCAL=1` is set,
cleans the previous output, and rejects bundles containing local signing code,
test-account login text, private keys, source maps or development endpoints.
A failed verification removes the rejected build. `production-manifest.json`
records SHA-256 hashes of the accepted files. `npm run verify:production` can
check the output again before publishing. Builds use XPR mainnet and the real
wallet SDK (WebAuth browser/mobile and Anchor); development sessions are stored
separately. The private local chain remains available with `npm run dev:local`.

The XPR wallet SDK is pinned to 5.1.0. `npm ci` applies the checked-in
`patches/@proton+web-sdk+5.1.0.patch` automatically: closed/blocked wallet windows
recover cleanly, each connection owns its popup, and wallet messages must come
from that popup and the exact expected WebAuth origin. The production build
runs regression checks for this patch before compiling. Revalidate the patch
when updating the SDK.

### Serve the production build locally against XPR mainnet

```bash
npm run deploy:local
```

This builds, verifies, and serves the frontend at http://127.0.0.1:8080/login.
It does not publish to ICP or deploy XPR contracts. To serve an already built
artifact, use `npm run preview:production`. Set `PORT=8081` if needed.
The server binds only to loopback and supports direct SPA route requests.
Click **Connect wallet** to authorize with your own XPR wallet; browse the live
DAOs after connecting. Approving a transaction affects live XPR mainnet.

Output is `dist/spa`. The new ICP deployment uses the pinned static-site recipe in
`icp.yaml`. It supports the included `_redirects` SPA fallback and `_headers` rules.
See [DEPLOYMENT.md](DEPLOYMENT.md) for the live canister, deployment commands,
identity, and funding details. Future updates use `npm run deploy:icp`; this runs
the production checks and refuses to create a replacement canister if its mapping
is missing. The original Fleek deployment remains separate.

### Customize the configuration
See [Configuring quasar.conf.js](https://quasar.dev/quasar-cli/quasar-conf-js).


```````````````````````````````````````````````````````````````````````````````
MIT License

Copyright (c) 2020 Daclify

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`````````````````````````````````````````````````````````````````````````````````
