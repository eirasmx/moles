# Moles 🦫

Web-Native Browser SDK

Moles is a thin adapter layer around a proxy runtime you supply. Scramjet is
a web proxy, not a browser engine: it runs inside your visitor's own
browser and uses a service worker to intercept, rewrite, and sandbox cross
origin content so it can load inside an iframe without hitting CORS or CSP
restrictions. Moles does not reimplement any of that, and it does not ship
any of it either. It removes the boilerplate a developer would otherwise
have to copy out of a raw Scramjet setup by hand, around whatever Scramjet
and transport packages you install yourself.

Give it a URL.
Moles handles the service worker, transport, and rendering.
You get a frame.

## Quick Start

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

That's it, once Scramjet and a transport are installed and served, see
[Setup](./docs/setup.md).

## What You Get

Depending on what's wired up, a session can provide:

* 🖥️ A rendered page inside a frame, using the visitor's real browser
* 🔗 URL change events as the visitor navigates inside the frame
* 🔐 Session-aware browsing, cookies and storage scoped per session
* 🔌 An adapter contract, so you can swap Scramjet, bare-mux, or the transport for anything else that fits the same shape
* 📛 Typed errors for setup failures instead of parsed message strings

More capabilities will be added over time, see `todo.md` for what's planned
and what's already working.

## Self-Hosted

Moles does not host anything for you. There is no Moles server sitting
between your app and the internet. Moles also does not ship Scramjet,
bare-mux, or any transport: you install and serve those yourself.

```
Your App
   │
   ▼
Moles (adapter contract + session wrapper)
   │
   ▼
ScramjetAdapter, or your own ProxyAdapter
   │
   ▼
Scramjet + transport, installed and served by you
   │
   ▼
Wisp relay (or whatever your transport connects through)
   │
   ▼
Internet
```

Moles is simply the developer-friendly interface between your application
and whichever proxy runtime you choose. Nothing runs on infrastructure you
don't control, and nothing ships inside the `moles` package except Moles's
own code.

## Deploying

Moles has no deploy target of its own, whatever hosts your app hosts Moles.
Scramjet imposes one requirement: it registers a service worker, which
browsers only allow on `https://` or `localhost` origins, never on a
`file://` page, so it has to be served somewhere, not opened as a local
file. See [Setup](./docs/setup.md) for the exact install and copy steps,
there is no postinstall step, no build step, and nothing automated on
Moles's side. Vercel, a plain static host, or your own server all work,
none of it depends on Vercel specifically.

## License

Moles itself is MIT licensed, and ships no third-party runtime code at all.

Scramjet and bare-mux are both MIT licensed as of this writing. Any
transport you choose to install, such as `@mercuryworkshop/epoxy-transport`
(AGPL-3.0-only) or `@mercuryworkshop/libcurl-transport` (also AGPL-3.0-only),
is installed and served by you, never by Moles, so any obligations that
come with your choice of transport belong to your own project, not to
Moles. Confirm this reading with an actual lawyer before relying on it, see
`todo.md`.

See `LICENSE` for details.

---

Moles 🦫 — Give us a URL. Get the web.
