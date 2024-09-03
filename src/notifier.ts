import type { GdnSettings } from "~lib"

/**
 *
 * @returns notificationId or null
 */
export const desktopNotificationIfEnabled = (
  settings: GdnSettings | null,
  iconUrl: string
): Promise<string | null> => {
  return new Promise((resolve) => {
    if (!settings?.desktopNotificationEnabled) {
      resolve(null)
      return
    }

    chrome.notifications.create(
      {
        type: "basic",
        iconUrl: iconUrl,
        title: chrome.i18n.getMessage("desktop_notification_title"),
        message: chrome.i18n.getMessage("desktop_notification_description")
      },
      (notificationId) => {
        console.log(`notificationId: ${notificationId}`)
        resolve(notificationId)
      }
    )
  })
}

export const voiceNotificationIfEnabled = (settings: GdnSettings | null) => {
  if (!settings?.soundNotificationEnabled) {
    return
  }

  chrome.tts.speak(chrome.i18n.getMessage("voice_notification_message"), {
    rate: 1.0,
    lang: chrome.i18n.getMessage("voice_notification_lang")
  })
}

export const bringTabToFrontIfEnabled = (
  settings: GdnSettings | null,
  index: number,
  windowId: number
) => {
  if (!settings?.bringTabToFrontEnabled) {
    return
  }

  chrome.tabs.highlight({
    tabs: index,
    // optionalと書いてあるが、省略すると、別のウィンドウでおかしな挙動をするので必須では？
    windowId: windowId
  })
}

export const bringWindowToFrontIfEnabled = (
  settings: GdnSettings | null,
  windowId: number
) => {
  if (!settings?.bringWindowToFrontEnabled) {
    return
  }

  chrome.windows.update(windowId, {
    focused: true
  })
}
