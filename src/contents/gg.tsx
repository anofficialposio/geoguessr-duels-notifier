import type { PlasmoCSConfig } from "plasmo"

import { useMessage } from "@plasmohq/messaging/hook"

export const config: PlasmoCSConfig = {
  matches: ["https://www.geoguessr.com/*"]
}

export type DuelsPageStatus = "waiting" | "starting" | "other"

// ref: https://www.answeroverflow.com/m/1187812316025204736
// file extension should be .tsx to use `useMessage` hook
// > I figured it out... Apparently you need new tabs, not just a refresh of old tabs.. OOF

export default function gg() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useMessage<string, string>(async (req, res) => {
    // console.log("Received message", req)
    if (req.name !== "checkStatus") {
      console.error("Unknown message", req)
      res.send("Unknown message")
      return
    }

    const waitingElement = document.querySelector(
      'div[class^="center-content_waitingMessage__"]'
    )
    if (waitingElement) {
      res.send("waiting")
      return
    }

    const chatLine = document.querySelector(
      'div[class^="chat-message_sharedRoot__"]'
    )
    if (chatLine) {
      res.send("starting")
      return
    }

    res.send("other")
  })
}
