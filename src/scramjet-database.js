const SCRAMJET_DATABASE_NAME = "$scramjet"
const SCRAMJET_VERSION_STORAGE_KEY = "scramjetDbVersion"

function deleteDatabase(databaseName) {
  return new Promise((resolve) => {
    const deleteRequest = indexedDB.deleteDatabase(databaseName)
    deleteRequest.addEventListener("success", resolve)
    deleteRequest.addEventListener("error", resolve)
    deleteRequest.addEventListener("blocked", resolve)
  })
}

// Scramjet keeps a $scramjet IndexedDB with a fixed schema version. Switching
// Scramjet package versions does not bump that schema version, so a database
// created by a previous version can be missing object stores the current
// version expects. Wiping it once per version change keeps the schema in
// sync with whatever version is actually installed.
//
// Some browsers (Brave in private mode, Safari with strict tracking
// prevention) set window.localStorage to null instead of leaving it usable,
// so the version check is skipped entirely there and the database is reset
// on every load.
export async function resetScramjetDatabaseOnVersionChange(installedScramjetVersion) {
  const lastInitializedVersion = localStorage ? localStorage.getItem(SCRAMJET_VERSION_STORAGE_KEY) : null
  if (lastInitializedVersion === installedScramjetVersion) return

  const scramjetRegistrations = await navigator.serviceWorker.getRegistrations()
  await Promise.all(scramjetRegistrations.map((registration) => registration.unregister()))

  await deleteDatabase(SCRAMJET_DATABASE_NAME)
  if (localStorage) localStorage.setItem(SCRAMJET_VERSION_STORAGE_KEY, installedScramjetVersion)
}
