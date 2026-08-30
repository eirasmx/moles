# Moles Documentation 📚

Moles wraps [Scramjet](https://github.com/MercuryWorkshop/scramjet) into a
single function call. Scramjet is a self-hosted web proxy: it runs inside a
visitor's own browser and uses a service worker to intercept, rewrite, and
sandbox cross origin content so it can load inside an iframe without hitting
CORS or CSP restrictions. Moles does not reimplement any of that, it removes
the boilerplate a developer would otherwise copy out of a raw Scramjet setup
by hand.

Nothing runs on Moles infrastructure. Every developer who uses Moles hosts
their own copy, and Scramjet runs entirely inside their own visitors'
browsers against whatever Wisp relay they configure.

## Sections

* [Setup](./setup.md) 🛠️ — installing Moles and getting it served correctly
* [Usage](./usage.md) 🔌 — the `Moles` and `session` API, options, and errors
* [Architecture](./architecture.md) 🏗️ — how `createSession()` is put together internally

See `todo.md` at the project root for what is still pending, including the
AGPLv3 legal review required before this ships publicly.
