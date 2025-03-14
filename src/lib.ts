import { Storage } from "@plasmohq/storage"

const storage = new Storage()

export const INTERVAL_MSEC = 1000

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
}
