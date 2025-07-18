import { sendToContentScript } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import {
  GG_MESSAGE_NAME_CHECK_STATUS,
  type DuelsPageStatus
} from "~contents/gg"
import {
  getGeoGuessrTabs,
  INTERVAL_MSEC,
  loadGdnSettings,
  setNotifierEnabled,
  STORAGE_KEYS,
  type GdnSettings
} from "~lib"
import {
  bringTabToFrontIfEnabled,
  bringWindowToFrontIfEnabled,
  desktopNotificationIfEnabled,
  voiceNotificationIfEnabled
} from "~notifier"

export interface NotificationInfo {
  notificationId: string | null
  index: number | null
  windowId: number | null
}

console.log(chrome.i18n.getUILanguage())

// ref: https://developer.chrome.com/docs/extensions/reference/api/runtime?hl=ja#event-onInstalled
chrome.runtime.onInstalled.addListener((details) => {
  console.log(JSON.stringify(details, null, 2))
  if (details?.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({
      url: "options.html"
    })
  }
})

const duelsStatusMap = new Map<number, DuelsPageStatus>()

const tabMap = new Map()
const lastNotificationInfo: NotificationInfo = {
  notificationId: null,
  index: null,
  windowId: null
}
// manifestでweb_accessible_resourcesを指定しないとgetURLできない
const iconUrl = chrome.runtime.getURL("assets/icon.png")
console.log(`iconUrl: ${iconUrl}`)

let intervalId = null
let settings: GdnSettings | null = null
let isTimerAsyncFuncRunning = false

const initAsync = async () => {
  console.log("initAsync")

  settings = await loadGdnSettings()
  console.log(JSON.stringify(settings, null, 2))

  stopTimer()
  await startTimerIfEnabled()
}

initAsync().then()

const startTimerIfEnabled = async () => {
  if (!settings) {
    console.error("settings is not available")
    return
  }

  if (settings.nofifierEnabled) {
    console.log("startTimerIfEnabled")

    stopTimer()
    await timerAsyncFunc()

    intervalId = setInterval(() => {
      // console.log("timerAsyncFunc")
      timerAsyncFunc().then()
    }, INTERVAL_MSEC)
  }
}

const stopTimer = () => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }

  tabMap.clear()
}

const storage = new Storage()
storage.watch({
  [STORAGE_KEYS.nofifierEnabled]: async (c) => {
    console.log(`watch: nofifierEnabled: ${c.newValue}`)
    // console.log(typeof c.newValue) // => boolean
    settings.nofifierEnabled = c.newValue

    if (c.newValue) {
      await startTimerIfEnabled()
    } else {
      stopTimer()
    }
  },
  [STORAGE_KEYS.desktopNotificationEnabled]: async (c) => {
    console.log(`watch: desktopNotificationEnabled: ${c.newValue}`)
    settings.desktopNotificationEnabled = c.newValue
  },
  [STORAGE_KEYS.soundNotificationEnabled]: async (c) => {
    console.log(`watch: soundNotificationEnabled: ${c.newValue}`)
    settings.soundNotificationEnabled = c.newValue
  },
  [STORAGE_KEYS.bringTabToFrontEnabled]: async (c) => {
    console.log(`watch: bringTabToFrontEnabled: ${c.newValue}`)
    settings.bringTabToFrontEnabled = c.newValue
  },
  [STORAGE_KEYS.bringWindowToFrontEnabled]: async (c) => {
    console.log(`watch: bringWindowToFrontEnabled: ${c.newValue}`)
    settings.bringWindowToFrontEnabled = c.newValue
  },
  [STORAGE_KEYS.autoDisable]: async (c) => {
    console.log(`watch: autoDisable: ${c.newValue}`)
    settings.autoDisable = c.newValue
  }
})

const timerAsyncFunc = async () => {
  if (isTimerAsyncFuncRunning) {
    console.log("timerAsyncFunc is already running")
    return
  }

  if (!settings?.nofifierEnabled) {
    console.log("timerAsyncFunc is called but notifier is disabled")
    return
  }

  isTimerAsyncFuncRunning = true

  try {
    const prevDuelsStatusMap = new Map(duelsStatusMap)
    duelsStatusMap.clear()

    const latestTabs = await getGeoGuessrTabs()
    // console.log(`latestTabs: ${latestTabs.length}`)
    // latestTabs.forEach((tab) => {
    //   console.log(`title: ${tab.title}, url: ${tab.url}`)
    // })

    const duelTabs = latestTabs.filter((tab) => {
      if (
        !tab.url.endsWith("/multiplayer") &&
        !tab.url.endsWith("/multiplayer/teams")
      ) {
        return false
      }

      return true
    })
    // console.log(`duelTabs: ${duelTabs.length}`)

    for (const tab of duelTabs) {
      // console.log(`tab: ${tab.title}`)
      const status: DuelsPageStatus | null = await sendToContentScript({
        name: GG_MESSAGE_NAME_CHECK_STATUS,
        tabId: tab.id
      })
      console.log(`status: ${status}`)
      if (!status) {
        continue
      }

      const prev = prevDuelsStatusMap.get(tab.id)
      duelsStatusMap.set(tab.id, status)

      if (
        (prev === "waiting" && status === "countdown") ||
        (prev === "waiting" && status === "ongoing")
      ) {
        console.log("duel starting")
        await notify(tab.index, tab.windowId)
        break
      }
    }
  } catch (e) {
    // ignore error
    console.error(e)
  }

  isTimerAsyncFuncRunning = false
}

const disableNotifierIfAutoDisabled = async () => {
  if (settings?.autoDisable) {
    settings.nofifierEnabled = false
    await setNotifierEnabled(false)
    stopTimer()
  }
}

const notify = async (index: number, windowId: number) => {
  voiceNotificationIfEnabled(settings)
  bringTabToFrontIfEnabled(settings, index, windowId)
  bringWindowToFrontIfEnabled(settings, windowId)

  // Promise allしていないので、これを後ろに持って行ったほうがよさそう
  const nid = await desktopNotificationIfEnabled(settings, iconUrl)
  if (nid) {
    lastNotificationInfo.notificationId = nid
    lastNotificationInfo.index = index
    lastNotificationInfo.windowId = windowId
  }

  disableNotifierIfAutoDisabled()
}

chrome.notifications.onClicked.addListener(async (notificationId) => {
  console.log(`onClicked: notificationId: ${notificationId}`)

  if (lastNotificationInfo.notificationId !== notificationId) {
    console.log(
      `notificationId is not matched: last ${lastNotificationInfo.notificationId}, received ${notificationId}`
    )
    return
  }

  if (lastNotificationInfo.index && lastNotificationInfo.windowId) {
    console.log("set focus")
    chrome.windows.update(lastNotificationInfo.windowId, {
      focused: true
    })
    chrome.tabs.highlight({
      tabs: lastNotificationInfo.index,
      windowId: lastNotificationInfo.windowId
    })
    chrome.notifications.clear(notificationId)
  }
})
