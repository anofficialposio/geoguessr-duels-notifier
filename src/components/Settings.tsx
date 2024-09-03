import { useMemo } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { INITIAL_SETTINGS, STORAGE_KEYS } from "~lib"

export const Settings = () => {
  const [notifierEnabled, setNotifierEnabled] = useStorage(
    STORAGE_KEYS.nofifierEnabled,
    INITIAL_SETTINGS.nofifierEnabled
  )
  const [desktopNotificationEnabled, setDesktopNotificationEnabled] =
    useStorage(
      STORAGE_KEYS.desktopNotificationEnabled,
      INITIAL_SETTINGS.desktopNotificationEnabled
    )
  const [soundNotificationEnabled, setSoundNotificationEnabled] = useStorage(
    STORAGE_KEYS.soundNotificationEnabled,
    INITIAL_SETTINGS.soundNotificationEnabled
  )
  const [bringTabToFrontEnabled, setBringTabToFrontEnabled] = useStorage(
    STORAGE_KEYS.bringTabToFrontEnabled,
    INITIAL_SETTINGS.bringTabToFrontEnabled
  )
  const [bringWindowToFrontEnabled, setBringWindowToFrontEnabled] = useStorage(
    STORAGE_KEYS.bringWindowToFrontEnabled,
    INITIAL_SETTINGS.bringWindowToFrontEnabled
  )
  const [autoDisable, setAutoDisable] = useStorage(
    STORAGE_KEYS.autoDisable,
    INITIAL_SETTINGS.autoDisable
  )

  const textColor = useMemo(() => {
    return notifierEnabled ? "#000000" : "#666666"
  }, [notifierEnabled])

  return (
    <div>
      <div
        style={{
          marginBottom: 8
        }}>
        <input
          type="checkbox"
          id={STORAGE_KEYS.nofifierEnabled}
          checked={notifierEnabled}
          onChange={(e) => {
            setNotifierEnabled(e.target.checked)
          }}
        />{" "}
        <label
          style={{
            fontSize: 14,
            fontStyle: "bold"
          }}
          htmlFor={STORAGE_KEYS.nofifierEnabled}>
          {chrome.i18n.getMessage("settings_checkbox_notifier")}
        </label>
      </div>
      <div
        style={{
          marginLeft: 16
        }}>
        <div>
          <input
            type="checkbox"
            id={STORAGE_KEYS.desktopNotificationEnabled}
            checked={desktopNotificationEnabled}
            disabled={!notifierEnabled}
            onChange={(e) => {
              setDesktopNotificationEnabled(e.target.checked)
            }}
          />{" "}
          <label
            htmlFor={STORAGE_KEYS.desktopNotificationEnabled}
            style={{ color: textColor }}>
            {chrome.i18n.getMessage("settings_checkbox_desktop_notification")}
          </label>
        </div>
        <div>
          <input
            type="checkbox"
            id={STORAGE_KEYS.soundNotificationEnabled}
            checked={soundNotificationEnabled}
            disabled={!notifierEnabled}
            onChange={(e) => {
              setSoundNotificationEnabled(e.target.checked)
            }}
          />{" "}
          <label
            htmlFor={STORAGE_KEYS.soundNotificationEnabled}
            style={{ color: textColor }}>
            {chrome.i18n.getMessage("settings_checkbox_voice_notification")}
          </label>
        </div>
        <div>
          <input
            type="checkbox"
            id={STORAGE_KEYS.bringTabToFrontEnabled}
            checked={bringTabToFrontEnabled}
            disabled={!notifierEnabled}
            onChange={(e) => {
              setBringTabToFrontEnabled(e.target.checked)
            }}
          />{" "}
          <label
            htmlFor={STORAGE_KEYS.bringTabToFrontEnabled}
            style={{ color: textColor }}>
            {chrome.i18n.getMessage("settings_checkbox_tab_to_selected")}
          </label>
        </div>
        <div>
          <input
            type="checkbox"
            id={STORAGE_KEYS.bringWindowToFrontEnabled}
            checked={bringWindowToFrontEnabled}
            disabled={!notifierEnabled}
            onChange={(e) => {
              setBringWindowToFrontEnabled(e.target.checked)
            }}
          />{" "}
          <label
            htmlFor={STORAGE_KEYS.bringWindowToFrontEnabled}
            style={{ color: textColor }}>
            {chrome.i18n.getMessage("settings_checkbox_window_to_foreground")}
          </label>
        </div>
      </div>
      <div
        style={{
          marginTop: 16
        }}>
        <input
          type="checkbox"
          id={STORAGE_KEYS.autoDisable}
          checked={autoDisable}
          disabled={!notifierEnabled}
          onChange={(e) => {
            setAutoDisable(e.target.checked)
          }}
        />{" "}
        <label htmlFor={STORAGE_KEYS.autoDisable} style={{ color: textColor }}>
          {chrome.i18n.getMessage("settings_checkbox_auto_disable")}
        </label>
      </div>
    </div>
  )
}
