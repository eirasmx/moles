export class MissingAdapterError extends Error {
  constructor() {
    super("Moles requires an adapter implementing ProxyAdapter, see src/adapter.js")
    this.name = "MissingAdapterError"
  }
}

export class MissingTransportModulePathError extends Error {
  constructor() {
    super("ScramjetAdapter requires transportModulePath, pointing at your installed transport's built module")
    this.name = "MissingTransportModulePathError"
  }
}

export class MissingScramjetVersionError extends Error {
  constructor() {
    super("ScramjetAdapter requires scramjetVersion, the version of @mercuryworkshop/scramjet you installed")
    this.name = "MissingScramjetVersionError"
  }
}

export class ServiceWorkerUnsupportedError extends Error {
  constructor() {
    super("This browser has no service worker support, Scramjet cannot run here")
    this.name = "ServiceWorkerUnsupportedError"
  }
}

export class StorageUnavailableError extends Error {
  constructor() {
    super("This browser blocks localStorage entirely, Scramjet's transport setup cannot run here")
    this.name = "StorageUnavailableError"
  }
}

export class ServiceWorkerActivationError extends Error {
  constructor(reason) {
    super("Service worker failed to activate: " + reason)
    this.name = "ServiceWorkerActivationError"
  }
}
