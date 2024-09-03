import { Storage } from "@plasmohq/storage"

import {
  DUEL_STARTING_TITLES,
  DUEL_WAITING_TITLES,
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
let isIntervalAsynclFuncRunning = false

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
    intervalId = setInterval(() => {
      // console.log("intervalAsynclFunc")
      intervalAsynclFunc().then()
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

const intervalAsynclFunc = async () => {
  if (isIntervalAsynclFuncRunning) {
    console.log("intervalAsynclFunc is already running")
    return
  }

  if (!settings?.nofifierEnabled) {
    console.log("intervalAsynclFunc is called but notifier is disabled")
    return
  }

  isIntervalAsynclFuncRunning = true
  {
    const prevTabMap = new Map(tabMap)
    tabMap.clear()
    const latestTabs = await getGeoGuessrTabs()

    for (const current of latestTabs) {
      // console.log(`current: ${current.title}`)

      const prev = prevTabMap.get(current.id)
      tabMap.set(current.id, current)

      if (prev?.title && current.title && prev?.title !== current.title) {
        console.log(`title changed: ${prev.title} => ${current.title}`)

        if (
          DUEL_WAITING_TITLES.includes(prev.title) &&
          DUEL_STARTING_TITLES.includes(current.title)
        ) {
          console.log("duel starting")
          await notify(current.index, current.windowId)
          break
        }

        // debug
        // console.error("duel starting (debug)")
        // await notify(current.index, current.windowId)
        // break
      }
    }
  }
  isIntervalAsynclFuncRunning = false
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
