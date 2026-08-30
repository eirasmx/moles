# Setup 🛠️

Moles ships zero third-party runtime code. `@mercuryworkshop/scramjet` and a
transport are entirely up to you, install them, serve their build output,
and pass the paths to `ScramjetAdapter`.

1. Install Moles in your project: `npm install moles`
2. Install Scramjet and a bare-mux-compatible transport yourself, for example:
   ```
   npm install @mercuryworkshop/scramjet @mercuryworkshop/bare-mux @mercuryworkshop/epoxy-transport
   ```
   Scramjet and bare-mux are both MIT licensed. epoxy-transport is
   AGPL-3.0-only, so confirm that fits your own project before choosing it.
   Any other bare-mux-compatible transport, such as libcurl-transport, works
   the same way.
3. Copy each package's built output into your own public folder:
   ```
   cp -r node_modules/@mercuryworkshop/scramjet/dist public/scram
   cp -r node_modules/@mercuryworkshop/bare-mux/dist public/baremux
   cp node_modules/@mercuryworkshop/epoxy-transport/dist/index.mjs public/transport/index.mjs
   ```
4. Copy `src/adapters/scramjet-service-worker.js` from Moles into your public
   folder as `sw.js` (or wherever `serviceWorkerPath` points). Edit the
   `importScripts` path inside it if you served Scramjet's output somewhere
   other than `/scram`.
5. Serve your project over `https://` or `localhost`. Scramjet registers a
   service worker, and browsers only allow that on those two origin types,
   never on a `file://` page.
6. Construct a `ScramjetAdapter` with the version of Scramjet you installed
   and the transport module path from step 3, pass it to `Moles`, see
   [Usage](./usage.md).

None of steps 2 through 4 are automated by Moles. That is intentional: it
keeps Moles itself free of any third-party runtime code, and lets you pick
whichever transport fits your project's own license constraints.
