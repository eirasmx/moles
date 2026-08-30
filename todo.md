# Todo 📋

Direction locked in: this is a client side SDK. The developer supplies an
adapter, we handle service worker registration, IndexedDB schema resets,
localStorage shimming, and transport wiring inside `ScramjetAdapter`.
Nothing moves to a server. The end user's own browser still does the
proxying. Moles itself ships no third-party runtime code: Scramjet, bare-mux,
and any transport are installed and served entirely by whoever uses Moles.

Setup logic has been extracted out of `public/index.html` and `sw.js` in
the `browser` test project into `src/` here: `ScramjetAdapter.initialize()`
now does everything that used to happen between `setUpScramjet()` and
`scramjetController.init()`, and `Moles.createSession()` returns a
`ProxySession` with `frame`, `navigate()`, and event access instead of
manipulating the DOM directly.

## In Progress

- [ ] Legal review of the transport a consumer chooses 🪪: verified that
  `@mercuryworkshop/scramjet` and `@mercuryworkshop/bare-mux` are both MIT
  as of this check, and Moles no longer bundles either, so this is no
  longer an AGPL question for Moles itself, the consumer's own install and
  serve step carries whatever license the transport they pick requires
  (`@mercuryworkshop/epoxy-transport` and `@mercuryworkshop/libcurl-transport`
  are both still AGPL-3.0-only). Still worth an actual lawyer confirming
  that `ScramjetAdapter` dynamically calling into a consumer-supplied
  transport build at runtime doesn't itself create an obligation for
  Moles, versus the obligation sitting entirely with whoever installs and
  serves that transport. Get a real sign off before relying on this
  reading. Affects `package.json` license field and `README.md`. Licenses
  shift over time and across MercuryWorkshop's own packages, so re-verify
  current license fields before publishing rather than trusting this note
  indefinitely.

## Pending

- [ ] `ScramjetAdapter.fetch()` is not implemented: bare-mux's
  `BareMuxConnection` wires the shared transport worker for the service
  worker to use, it does not expose a client-side fetch call itself. A
  standalone proxied fetch likely needs bare-mux's separate `BareClient`
  class wired against the same transport, verify the correct API before
  implementing this rather than guessing at it.

- [ ] Session lifecycle events: connection state (connecting, ready,
  failed) and load errors still need to be exposed as callbacks or an
  event emitter on `Moles`/`ProxySession`. `ProxySession` currently only
  forwards Scramjet's own `urlchange` event through `addEventListener`.

- [ ] Cross-browser storage fallback audit: `ensureWritableLocalStorage()`
  in `src/storage.js` handles Brave private mode and Safari strict
  tracking prevention today. Needs testing against current versions of
  both before this ships, browser privacy defaults change often.

- [ ] IndexedDB version reset strategy: `resetScramjetDatabaseOnVersionChange()`
  in `src/scramjet-database.js` wipes the entire `$scramjet` database on
  every scramjet package version bump. Fine for a test page, worth
  deciding if an SDK consumer should be warned before their users lose
  proxy state on an update.

- [ ] TypeScript types for the public API surface, including the
  `ProxyAdapter` contract itself, since this is meant to save other
  developers from reading scramjet's own source to figure out what to
  pass where, the whole point of building this.

- [ ] Framework wrappers once the core SDK is stable: a React hook
  (`useProxySession`) and a plain web component wrapper are natural asks
  once the vanilla JS API is solid. Do not start these before the core API
  shape is settled, changing the core later means rewriting both.

- [ ] Scramjet 2.x reportedly depends on `@mercuryworkshop/proxy-transports`
  (MIT) directly instead of bare-mux, as the successor to bare-mux's own
  transport interface. `ScramjetAdapter` currently only exercises the
  bare-mux 1.x style `setTransport(modulePath, args)` flow that was already
  verified working. Confirm the actual Scramjet 2.x wiring before adding
  support for it, rather than assuming the API carries over.

## Known Issues

None currently open. Scramjet's shipped filenames aren't consistently
documented upstream. Since Moles no longer bundles Scramjet's build output,
there is no longer a build step to fail on a missing filename, that
verification now falls on whoever copies Scramjet's dist output into their
own project, see `docs/setup.md`.
