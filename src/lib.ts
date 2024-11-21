import { Storage } from "@plasmohq/storage"

const storage = new Storage()

export const INTERVAL_MSEC = 1000

/*
  確認済み: En, Ja, Deutsh, Espanol, Francais, Italiano, Portugues, Nederland, Svenska, Turkce, Polski
  未確認: ...
*/
export const DUEL_WAITING_TITLES = ["GeoGuessr - Let's explore the world!"]
export const DUEL_STARTING_TITLES = [
  "Duels - GeoGuessr",
  "Team Duels - GeoGuessr"
]

const EXCLUDE_URLS = [
  "https://www.geoguessr.com/",
  "https://www.geoguessr.com/party",
  "https://www.geoguessr.com/multiplayer/battle-royale-countries",
  "https://www.geoguessr.com/multiplayer/battle-royale-distance",
  "https://www.geoguessr.com/multiplayer/unranked-teams"
]

const EXCLUDE_URL_COUNTRY_CODES = [
  "es",
  "de",
  "fr",
  "it",
  "nl",
  "pt",
  "sv",
  "tr",
  "ja",
  "pl"
]

// cache
let excludeUrls = null

export const getExcludeUrls = (): string[] => {
  if (excludeUrls) {
    return excludeUrls
  }

  // console.log("getExcludeUrls")
  const list = [...EXCLUDE_URLS]

  for (const code of EXCLUDE_URL_COUNTRY_CODES) {
    for (const url of EXCLUDE_URLS) {
      const replaced = url.replace(
        "www.geoguessr.com/",
        `www.geoguessr.com/${code}/`
      )
      if (replaced.endsWith("/")) {
        list.push(replaced.slice(0, -1))
      } else {
        list.push(replaced)
      }
    }
  }

  // add 'https://www.geoguessr.com'
  list.push("https://www.geoguessr.com")

  console.log(list)
  excludeUrls = list
  return list
}

export const STORAGE_KEYS = {
  nofifierEnabled: "notifEnabled",
  desktopNotificationEnabled: "desktopNotificationEnabled",
  soundNotificationEnabled: "soundNotificationEnabled",
  bringTabToFrontEnabled: "bringTabToFrontEnabled",
  bringWindowToFrontEnabled: "bringWindowToFrontEnabled",
  autoDisable: "autoDisable"
}

export const INITIAL_SETTINGS: GdnSettings = {
  nofifierEnabled: true,
  desktopNotificationEnabled: true,
  soundNotificationEnabled: true,
  bringTabToFrontEnabled: true,
  bringWindowToFrontEnabled: true,
  autoDisable: false
}

export interface GdnSettings {
  nofifierEnabled: boolean
  desktopNotificationEnabled: boolean
  soundNotificationEnabled: boolean
  bringTabToFrontEnabled: boolean
  bringWindowToFrontEnabled: boolean
  autoDisable: boolean
}

export const loadGdnSettings = async (): Promise<GdnSettings> => {
  const nofifierEnabled = await storage.get<boolean>(
    STORAGE_KEYS.nofifierEnabled
  )
  // console.log(typeof nofifierEnabled)

  const desktopNotificationEnabled = await storage.get<boolean>(
    STORAGE_KEYS.desktopNotificationEnabled
  )
  const soundNotificationEnabled = await storage.get<boolean>(
    STORAGE_KEYS.soundNotificationEnabled
  )
  const bringTabToFrontEnabled = await storage.get<boolean>(
    STORAGE_KEYS.bringTabToFrontEnabled
  )
  const bringWindowToFrontEnabled = await storage.get<boolean>(
    STORAGE_KEYS.bringWindowToFrontEnabled
  )

  const autoDisable = await storage.get<boolean>(STORAGE_KEYS.autoDisable)

  return {
    nofifierEnabled: nofifierEnabled ?? INITIAL_SETTINGS.nofifierEnabled,
    desktopNotificationEnabled:
      desktopNotificationEnabled ?? INITIAL_SETTINGS.desktopNotificationEnabled,
    soundNotificationEnabled:
      soundNotificationEnabled ?? INITIAL_SETTINGS.soundNotificationEnabled,
    bringTabToFrontEnabled:
      bringTabToFrontEnabled ?? INITIAL_SETTINGS.bringTabToFrontEnabled,
    bringWindowToFrontEnabled:
      bringWindowToFrontEnabled ?? INITIAL_SETTINGS.bringWindowToFrontEnabled,
    autoDisable: autoDisable ?? INITIAL_SETTINGS.autoDisable
  }
}

export const setNotifierEnabled = async (enabled: boolean): Promise<void> => {
  await storage.set(STORAGE_KEYS.nofifierEnabled, enabled)
}

export const getGeoGuessrTabs = async (): Promise<chrome.tabs.Tab[]> => {
  return new Promise((resolve) => {
    chrome.tabs.query({}, (tabs) => {
      const filtered = tabs.filter((tab) => tab.url && tab.title)
      // filtered.forEach((tab) => {
      //   // console.log(tab.title)
      // console.log(JSON.stringify(tab, null, 2))
      // })
      resolve(filtered)
    })
  })
  // return new Promise((resolve) => {
  //   chrome.tabs.query({}, (tabs) => {
  //     const windowIdSet = new Set<number>()

  //     tabs.forEach((tab) => {
  //       // console.log(tab.title)
  //       console.log(JSON.stringify(tab, null, 2))
  //       windowIdSet.add(tab.windowId)
  //     })
  //     // memo: windowの数は取得できる
  //     console.log(`windowIdSet: ${windowIdSet.size}`)
  //     resolve(tabs)
  //   })
  // })
}
