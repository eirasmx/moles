const loadedScriptUrls = new Set()

export function loadScriptOnce(scriptUrl) {
  if (loadedScriptUrls.has(scriptUrl)) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const scriptElement = document.createElement("script")
    scriptElement.src = scriptUrl
    scriptElement.addEventListener("load", () => {
      loadedScriptUrls.add(scriptUrl)
      resolve()
    })
    scriptElement.addEventListener("error", () => reject(new Error("Failed to load script: " + scriptUrl)))
    document.head.appendChild(scriptElement)
  })
}
