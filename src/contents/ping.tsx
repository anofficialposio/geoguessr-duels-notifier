import type { PlasmoCSConfig } from "plasmo"

import { sendToBackground } from "@plasmohq/messaging"

//
// Send ping periodically to the background script to keep the connection alive
//

export const config: PlasmoCSConfig = {
  matches: ["https://www.geoguessr.com/*"]
}

const PING_PERIOD = 1000 * 5 // 5 seconds

let lastPinged = 0

const sendPing = async () => {
  const now = Date.now()
  // console.log(
  //   `now: ${now}, lastPinged: ${lastPinged}, diff: ${now - lastPinged}`
  // )

  if (now - lastPinged < PING_PERIOD) {
    return
  }
  lastPinged = now

  const extensionId = chrome.runtime.id
  await sendToBackground({
    name: "ping",
    body: {
      ping: "ping"
    },
    extensionId
  })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const observer = new MutationObserver((mutationsList, observer) => {
  const url = window.location.href ?? ""
  // console.log(url)

  const isDuelPage =
    url.endsWith("/multiplayer") || url.endsWith("/multiplayer/teams")

  if (!isDuelPage) {
    return
  }

  sendPing()
    .then()
    .catch((e) => {
      console.error("Error sending ping", e)
    })
})

const target = document.querySelector("#__next")
if (target) {
  observer.observe(target, { subtree: true, childList: true })
} else {
  console.log("Target not found")
}
