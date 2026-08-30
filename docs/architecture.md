# Architecture 🏗️

```
Your App
   │
   ▼
Moles (adapter contract + session wrapper, MIT, no third-party code)
   │
   ▼
ScramjetAdapter (or your own ProxyAdapter)
   │
   ▼
Scramjet + a transport, both installed and served by you
   │
   ▼
Wisp relay (or whatever your chosen transport connects through)
   │
   ▼
Internet
```

`src/moles.js` is deliberately thin: `Moles` holds an `adapter` and
`createSession()` just calls `adapter.initialize()` then wraps the adapter
in a `ProxySession`. Moles never imports Scramjet, bare-mux, or any
transport package itself, see `src/adapter.js` for the full contract.

`src/adapters/scramjet-adapter.js` is the reference implementation. It runs,
in order: a browser capability check, a localStorage shim if needed, an
IndexedDB schema reset if the installed Scramjet version changed, loading
Scramjet's and bare-mux's script tags from wherever you served them,
registering and waiting for the service worker to activate, initializing
Scramjet's controller, wiring bare-mux's transport, and wrapping the
resulting Scramjet frame.

Each step still lives in its own file by responsibility:

* `src/errors.js` — the typed error classes
* `src/storage.js` — the localStorage shim for Brave private mode and Safari strict tracking prevention
* `src/scramjet-database.js` — the `$scramjet` IndexedDB version reset
* `src/service-worker-registration.js` — service worker registration and activation waiting
* `src/script-loader.js` — one-time script tag loading
* `src/adapters/scramjet-service-worker.js` — the service worker source, copied into your own public folder, see `docs/setup.md`

Moles ships no build step, no postinstall script, and no bundled runtime
assets. Every third-party package Scramjet or your chosen transport touch
is installed, served, and licensed entirely on your own project's terms.
