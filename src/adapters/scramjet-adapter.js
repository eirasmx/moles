import { ProxyAdapter } from "../adapter.js"
import { MissingScramjetVersionError, MissingTransportModulePathError, ServiceWorkerUnsupportedError, StorageUnavailableError } from "../errors.js"
import { ensureWritableLocalStorage } from "../storage.js"
import { resetScramjetDatabaseOnVersionChange } from "../scramjet-database.js"
import { registerScramjetServiceWorker } from "../service-worker-registration.js"
import { loadScriptOnce } from "../script-loader.js"

const DEFAULT_SCRAMJET_PREFIX = "/scramjet/"
const DEFAULT_SERVICE_WORKER_PATH = "/sw.js"

// Defaults match the copy commands in docs/setup.md. Every path is still
// independently overridable, this is not a folder convention ScramjetAdapter
// assumes, it is the documented shape of scramjetAssets/bareMuxAssets.
const DEFAULT_SCRAMJET_ASSETS = {
  all: "/scram/scramjet.all.js",
  sync: "/scram/scramjet.sync.js",
  wasm: "/scram/scramjet.wasm.wasm",
}
const DEFAULT_BARE_MUX_ASSETS = {
  index: "/baremux/index.js",
  worker: "/baremux/worker.js",
}

// A ProxyAdapter around a host-installed @mercuryworkshop/scramjet and a
// host-installed bare-mux-compatible transport (epoxy-transport,
// libcurl-transport, bare-transport for proxy-transports, or anything else
// that exposes the same setTransport(modulePath, args) call). Moles never
// installs, bundles, or redistributes any of these: the host chooses which
// packages to install, which transport to use, and where their built output
// gets served from, see docs/setup.md. Every path below points at a single
// file the host serves, there is no shared base folder ScramjetAdapter
// assumes.
export class ScramjetAdapter extends ProxyAdapter {
  constructor({ scramjetVersion, scramjetPrefix, serviceWorkerPath, scramjetAssets, bareMuxAssets, transportModulePath, transportOptions } = {}) {
    super()

    if (!scramjetVersion) throw new MissingScramjetVersionError()
    if (!transportModulePath) throw new MissingTransportModulePathError()

    this.scramjetVersion = scramjetVersion
    this.scramjetPrefix = scramjetPrefix ?? DEFAULT_SCRAMJET_PREFIX
    this.serviceWorkerPath = serviceWorkerPath ?? DEFAULT_SERVICE_WORKER_PATH
    this.scramjetAssets = { ...DEFAULT_SCRAMJET_ASSETS, ...scramjetAssets }
    this.bareMuxAssets = { ...DEFAULT_BARE_MUX_ASSETS, ...bareMuxAssets }
    this.transportModulePath = transportModulePath
    this.transportOptions = transportOptions ?? []
  }

  async initialize() {
    if (!("serviceWorker" in navigator)) throw new ServiceWorkerUnsupportedError()
    if (!ensureWritableLocalStorage()) throw new StorageUnavailableError()

    await resetScramjetDatabaseOnVersionChange(this.scramjetVersion)

    await loadScriptOnce(this.scramjetAssets.all)
    await loadScriptOnce(this.bareMuxAssets.index)

    await registerScramjetServiceWorker({
      serviceWorkerPath: this.serviceWorkerPath,
      scope: this.scramjetPrefix,
    })

    const { ScramjetController } = self.$scramjetLoadController()

    this.scramjetController = new ScramjetController({
      prefix: this.scramjetPrefix,
      files: {
        wasm: this.scramjetAssets.wasm,
        all: this.scramjetAssets.all,
        sync: this.scramjetAssets.sync,
      },
    })

    await this.scramjetController.init()

    this.bareMuxConnection = new BareMux.BareMuxConnection(this.bareMuxAssets.worker)
    await this.bareMuxConnection.setTransport(this.transportModulePath, this.transportOptions)

    this.scramjetFrame = this.scramjetController.createFrame()
  }

  get frame() {
    return this.scramjetFrame.frame
  }

  navigate(targetUrl) {
    return this.scramjetFrame.go(targetUrl)
  }

  async fetch(_targetUrl) {
    // bare-mux's BareMuxConnection wires the shared transport worker for the
    // service worker to use, it does not itself expose a client-side fetch.
    // A standalone proxied fetch needs bare-mux's separate BareClient class,
    // wired against this same transport. Not done yet, see todo.md.
    throw new Error("ScramjetAdapter.fetch() is not implemented yet")
  }

  addEventListener(eventName, callback) {
    return this.scramjetFrame.addEventListener(eventName, callback)
  }

  removeEventListener(eventName, callback) {
    return this.scramjetFrame.removeEventListener(eventName, callback)
  }

  destroy() {
    this.scramjetFrame.frame.remove()
  }
}
