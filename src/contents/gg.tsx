import type { PlasmoCSConfig } from "plasmo"

import { useMessage } from "@plasmohq/messaging/hook"

export const config: PlasmoCSConfig = {
  matches: ["https://www.geoguessr.com/*"]
}

export const GG_MESSAGE_NAME_CHECK_STATUS = 'checkStatus'

export type DuelsPageStatus = "waiting" | "countdown" | "other"

// ref: https://www.answeroverflow.com/m/1187812316025204736
// file extension should be .tsx to use `useMessage` hook
// > I figured it out... Apparently you need new tabs, not just a refresh of old tabs.. OOF

export default function gg() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useMessage<string, string>(async (req, res) => {
    // console.log("Received message", req)
    if (req.name !== GG_MESSAGE_NAME_CHECK_STATUS) {
      console.error("Unknown message", req)
      res.send(null)
      return
    }

    const waitingElement = document.querySelector(
      'div[class^="center-content_waitingMessage__"]'
    )
    if (waitingElement) {
      res.send("waiting")
      return
    }

    // this element exists both in waiting and countdown screen
    const matchMakingElement = document.querySelector(
      'span[class^="matchmaking-layout_playerName__"]'
    )
    if (matchMakingElement) {
      res.send("countdown")
      return
    }

    res.send("other")
  })
}
