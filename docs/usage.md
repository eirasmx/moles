# Usage 🔌

```js
import { Moles, ScramjetAdapter } from "moles";

const adapter = new ScramjetAdapter({
  scramjetVersion: "1.1.0",
  transportModulePath: "/transport/index.mjs",
  transportOptions: [{ wisp: "wss://your-wisp-relay.example/" }],
});

const moles = new Moles({ adapter });

const session = await moles.createSession();
document.body.appendChild(session.frame);

await session.navigate("https://example.com");
```

## `ScramjetAdapter` options

| Option                | Required | Default                       | Purpose                                                                 |
|-----------------------|----------|--------------------------------|--------------------------------------------------------------------------|
| `scramjetVersion`     | yes      | none                           | The version of `@mercuryworkshop/scramjet` you installed, used to reset the `$scramjet` IndexedDB schema on upgrades |
| `transportModulePath` | yes      | none                           | Path to your installed transport's built module, e.g. `/transport/index.mjs` |
| `transportOptions`    | no       | `[]`                           | Arguments passed to bare-mux's `setTransport`, shape depends on your chosen transport (e.g. `[{ wisp: "wss://..." }]` for epoxy-transport) |
| `scramjetPrefix`      | no       | `/scramjet/`                   | The path Scramjet rewrites proxied requests under                       |
| `serviceWorkerPath`   | no       | `/sw.js`                       | Where your copy of `scramjet-service-worker.js` is served from          |
| `scramjetAssets.all`  | no       | `/scram/scramjet.all.js`       | Path to the Scramjet controller bundle                                  |
| `scramjetAssets.sync` | no       | `/scram/scramjet.sync.js`      | Path to the synchronous Scramjet bundle                                 |
| `scramjetAssets.wasm` | no       | `/scram/scramjet.wasm.wasm`    | Path to the Scramjet WebAssembly binary                                 |
| `bareMuxAssets.index` | no       | `/baremux/index.js`            | Path to the bare-mux browser bundle                                     |
| `bareMuxAssets.worker`| no       | `/baremux/worker.js`           | Path to the bare-mux worker                                             |

Every default above matches the copy commands in [Setup](./setup.md). Each
path is an independent override, there is no shared base folder
ScramjetAdapter assumes. For example, pointing `scramjetAssets.wasm` at a
CDN or a different build output does not affect `scramjetAssets.all` or
`scramjetAssets.sync`:

```js
const adapter = new ScramjetAdapter({
  scramjetVersion: "1.1.0",
  scramjetAssets: {
    all: "/scram/scramjet.all.js",
    sync: "/scram/scramjet.sync.js",
    wasm: "/scram/scramjet.wasm.wasm",
  },
  bareMuxAssets: {
    index: "/baremux/index.js",
    worker: "/baremux/worker.js",
  },
  transportModulePath: "/transport/index.mjs",
  transportOptions: [{ wisp: "wss://your-wisp-relay.example/" }],
});
```

Any key you omit from `scramjetAssets` or `bareMuxAssets` falls back to its
own default, you do not need to repeat the ones you are not overriding.

## `session` API

* `session.frame` — the rendered iframe element, append it wherever it belongs in your page
* `session.navigate(url)` — load a new address inside the frame
* `session.addEventListener("urlchange", callback)` / `removeEventListener` — fires as the visitor navigates inside the frame
* `session.destroy()` — tears down the frame
* `session.fetch(url)` — not implemented yet on `ScramjetAdapter`, see `todo.md`

## Errors

Setup failures throw typed errors instead of generic messages, so calling
code can branch on the failure reason:

* `MissingAdapterError` — no `adapter` was passed to the `Moles` constructor
* `MissingScramjetVersionError` — no `scramjetVersion` was passed to `ScramjetAdapter`
* `MissingTransportModulePathError` — no `transportModulePath` was passed to `ScramjetAdapter`
* `ServiceWorkerUnsupportedError` — the browser has no service worker support
* `StorageUnavailableError` — the browser blocks `localStorage` entirely
* `ServiceWorkerActivationError` — the service worker failed to reach an activated state

## Writing your own adapter

`ScramjetAdapter` is a reference implementation, not the only one Moles
accepts. Extend `ProxyAdapter` from `moles` and implement `initialize()`,
`frame`, `navigate()`, `fetch()`, `addEventListener()`,
`removeEventListener()`, and `destroy()` to wire up a different proxy
runtime or transport entirely.
