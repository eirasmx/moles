import { ServiceWorkerActivationError } from "./errors.js"

function waitForServiceWorkerActive(serviceWorkerRegistration) {
  if (serviceWorkerRegistration.active) return Promise.resolve(serviceWorkerRegistration.active)

  const workerInTraining = serviceWorkerRegistration.installing || serviceWorkerRegistration.waiting
  if (!workerInTraining) throw new ServiceWorkerActivationError("registration has no installing, waiting, or active worker")

  return new Promise((resolve, reject) => {
    workerInTraining.addEventListener("statechange", () => {
      if (workerInTraining.state === "activated") resolve(workerInTraining)
      if (workerInTraining.state === "redundant") reject(new ServiceWorkerActivationError("worker became redundant before activating"))
    })
  })
}

export async function registerScramjetServiceWorker({ serviceWorkerPath, scope }) {
  const registration = await navigator.serviceWorker.register(serviceWorkerPath, { scope })
  await waitForServiceWorkerActive(registration)
  return registration
}
