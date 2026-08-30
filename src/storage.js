// bare-mux reads window.localStorage once, itself, the moment its script tag
// executes, and keeps whatever it captured for the rest of the page's life.
// In browsers that set window.localStorage to null (Brave private mode,
// Safari strict tracking prevention), that means bare-mux permanently locks
// in a null reference before Moles ever gets a chance to run, so the shim
// has to be installed before bare-mux loads, not alongside the rest of setup.
//
// window.localStorage is also a getter-only property inherited from
// Window.prototype. In a classic, non-strict script, assigning to a
// getter-only property is silently ignored rather than an error, so a plain
// `window.localStorage = shim` line leaves window.localStorage exactly as
// null as it was before. Object.defineProperty can still shadow the
// inherited getter with a real own property on window, which is the only
// reliable way to install the shim here.
function createInMemoryStorage() {
  const backingEntries = new Map()

  return new Proxy(
    {},
    {
      get(target, property) {
        if (property === "length") return backingEntries.size
        if (property === "getItem") return (key) => (backingEntries.has(String(key)) ? backingEntries.get(String(key)) : null)
        if (property === "setItem") return (key, value) => backingEntries.set(String(key), String(value))
        if (property === "removeItem") return (key) => backingEntries.delete(String(key))
        if (property === "clear") return () => backingEntries.clear()
        if (property === "key") return (index) => Array.from(backingEntries.keys())[index] ?? null
        return backingEntries.get(property)
      },
      set(target, property, value) {
        backingEntries.set(String(property), String(value))
        return true
      },
      has(target, property) {
        return backingEntries.has(String(property))
      },
      deleteProperty(target, property) {
        return backingEntries.delete(String(property))
      },
      ownKeys() {
        return Array.from(backingEntries.keys())
      },
      getOwnPropertyDescriptor(target, property) {
        if (!backingEntries.has(String(property))) return undefined
        return { enumerable: true, configurable: true, value: backingEntries.get(String(property)) }
      },
    },
  )
}

export function ensureWritableLocalStorage() {
  if (window.localStorage) return true

  try {
    Object.defineProperty(window, "localStorage", {
      value: createInMemoryStorage(),
      writable: true,
      configurable: true,
    })
    return true
  } catch {
    return false
  }
}
