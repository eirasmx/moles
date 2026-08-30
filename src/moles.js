import { MissingAdapterError } from "./errors.js"

export class ProxySession {
  constructor(adapter) {
    this.frame = adapter.frame
    this.navigate = (targetUrl) => adapter.navigate(targetUrl)
    this.fetch = (targetUrl) => adapter.fetch(targetUrl)
    this.addEventListener = adapter.addEventListener.bind(adapter)
    this.removeEventListener = adapter.removeEventListener.bind(adapter)
    this.destroy = () => adapter.destroy()
  }
}

export class Moles {
  constructor({ adapter } = {}) {
    if (!adapter) throw new MissingAdapterError()

    this.adapter = adapter
  }

  async createSession() {
    await this.adapter.initialize()
    return new ProxySession(this.adapter)
  }
}
