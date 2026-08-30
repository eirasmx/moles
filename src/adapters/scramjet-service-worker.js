// Copy this file into your own public folder and serve it as the
// serviceWorkerPath you pass to ScramjetAdapter (default "/sw.js"). Moles
// does not serve this for you, service workers cannot take constructor
// arguments, so if you serve Scramjet's build output from somewhere other
// than "/scram", update the importScripts path below to match.
importScripts("/scram/scramjet.all.js")

const { ScramjetServiceWorker } = self.$scramjetLoadWorker()

const scramjetDatabaseName = "$scramjet"
const scramjetDatabaseVersion = 1
const scramjetObjectStoreNames = ["config", "cookies", "redirectTrackers", "referrerPolicies", "publicSuffixList"]

// ScramjetServiceWorker's constructor opens this same database with no
// upgrade handler, so whichever open() request reaches IndexedDB first wins
// the schema upgrade. Creating the schema here first, and waiting for it to
// finish before constructing ScramjetServiceWorker, guarantees the object
// stores always exist before Scramjet's own code can open an empty,
// storeless database instead.
function createScramjetDatabaseSchema() {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open(scramjetDatabaseName, scramjetDatabaseVersion)

    openRequest.addEventListener("upgradeneeded", () => {
      const database = openRequest.result
      for (const storeName of scramjetObjectStoreNames) {
        if (!database.objectStoreNames.contains(storeName)) {
          database.createObjectStore(storeName)
        }
      }
    })

    openRequest.addEventListener("success", () => {
      openRequest.result.close()
      resolve()
    })

    openRequest.addEventListener("error", () => reject(openRequest.error))
  })
}

const scramjetDatabaseReady = createScramjetDatabaseSchema()
let scramjetServiceWorker

self.addEventListener("fetch", (fetchEvent) => {
  fetchEvent.respondWith(
    (async () => {
      await scramjetDatabaseReady
      if (!scramjetServiceWorker) scramjetServiceWorker = new ScramjetServiceWorker()

      await scramjetServiceWorker.loadConfig()

      if (scramjetServiceWorker.route(fetchEvent)) {
        return scramjetServiceWorker.fetch(fetchEvent)
      }

      return fetch(fetchEvent.request)
    })(),
  )
})
