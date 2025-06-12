import type { PlasmoCSConfig } from "plasmo"

import { useMessage } from "@plasmohq/messaging/hook"

export const config: PlasmoCSConfig = {
  matches: ["https://www.geoguessr.com/*"]
}

export const GG_MESSAGE_NAME_CHECK_STATUS = "checkStatus"

export type DuelsPageStatus = "waiting" | "countdown" | "ongoing" | "other"

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

    const title = document.title
    // console.log(`Title: ${title}`)
    const isOngoingDuel = title.startsWith("Ongoing duel")
    // if (isOngoingDuel) {
    //   console.log("Ongoing duel detected")
    // }

    const waitingElement = document.querySelector(
      'div[class^="center-content_waitingMessage__"]'
    )
    // if (waitingElement) {
    //   console.log("Waiting element found")
    // }

    // these element exists both in waiting and countdown screen
    const soloMatchMakingElement = document.querySelector(
      '*[class^="matchmaking-layout_playerName__"]'
    )
    // if (soloMatchMakingElement) {
    //   console.log("Matchmaking element found (solo)")
    // }
    const teamMatchMakingElement = document.querySelector(
      '*[class^="team-matchmaking-layout_playerName__"]'
    )
    // if (teamMatchMakingElement) {
    //   console.log("Matchmaking element found (team)")
    // }

    if (isOngoingDuel) {
      res.send("ongoing")
      return
    }

    if (waitingElement) {
      res.send("waiting")
      return
    }

    if (soloMatchMakingElement || teamMatchMakingElement) {
      res.send("countdown")
      return
    }

    res.send("other")
  })
}
