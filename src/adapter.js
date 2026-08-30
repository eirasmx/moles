// The contract Moles orchestrates against. Moles never imports a proxy
// runtime itself, it calls these members on whatever adapter the host
// application constructs and passes in. src/adapters/scramjet-adapter.js is
// a reference implementation, not the only one this contract supports.
export class ProxyAdapter {
  async initialize() {
    throw new Error("ProxyAdapter.initialize() must be implemented")
  }

  get frame() {
    throw new Error("ProxyAdapter.frame must be implemented")
  }

  navigate(_targetUrl) {
    throw new Error("ProxyAdapter.navigate() must be implemented")
  }

  async fetch(_targetUrl) {
    throw new Error("ProxyAdapter.fetch() must be implemented")
  }

  addEventListener(_eventName, _callback) {
    throw new Error("ProxyAdapter.addEventListener() must be implemented")
  }

  removeEventListener(_eventName, _callback) {
    throw new Error("ProxyAdapter.removeEventListener() must be implemented")
  }

  destroy() {
    throw new Error("ProxyAdapter.destroy() must be implemented")
  }
}
