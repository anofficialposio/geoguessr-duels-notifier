// eslint-disable-next-line import/no-unresolved
import iconImage from "data-base64:/assets/icon.png"
// eslint-disable-next-line import/no-unresolved
import tipsJaImage from "data-base64:/assets/tips_ja.png"
// eslint-disable-next-line import/no-unresolved
import tipsImage from "data-base64:/assets/tips.png"
import { useMemo } from "react"

import { Settings } from "~components/Settings"

function OptionsIndex() {
  const version = useMemo(() => {
    const manifest = chrome.runtime.getManifest()
    return manifest.version
  }, [])

  const tips = useMemo(() => {
    const lang = chrome.i18n.getUILanguage()
    console.log(`lang: ${lang}`)
    // memo: chrome/braveだとja, ffはja-JP-macos
    return lang?.startsWith("ja") ? tipsJaImage : tipsImage
  }, [])

  return (
    <div style={{ padding: "24px" }}>
      <img src={iconImage} width="70" alt="app icon" />
      <h1>GeoGuessr Duels Notifier v{version}</h1>

      <div style={{ marginTop: 18, marginBottom: 24 }}>
        <p style={{}}>{chrome.i18n.getMessage("options_description")}</p>
        <p style={{ color: "#cc0000" }}>
          {chrome.i18n.getMessage("options_description_notes")}{" "}
        </p>
      </div>

      <h2 style={{ marginTop: "32px" }}>
        {chrome.i18n.getMessage("options_settings_title")}
      </h2>
      <p style={{ marginBottom: "16px" }}>
        {chrome.i18n.getMessage("options_settings_description")}
      </p>
      <div style={{ padding: "0px" }}>
        <Settings />
      </div>

      <h2 style={{ marginTop: "32px" }}>
        {chrome.i18n.getMessage("options_tips_title")}
      </h2>
      <p>{chrome.i18n.getMessage("options_tips_description")}</p>
      <img src={tips} width={800} alt="tips" />

      <h2 style={{ marginTop: "32px" }}>
        {chrome.i18n.getMessage("options_notes_title")}
      </h2>
      <ul>
        <li>{chrome.i18n.getMessage("options_notes_note_one")} </li>
      </ul>

      <hr
        style={{
          marginTop: "48px",
          marginBottom: "18px"
        }}
      />

      <footer>
        Made by{" "}
        <a href="https://posio.pages.dev" target="_blank" rel="noreferrer">
          Posio
        </a>
      </footer>
    </div>
  )
}

export default OptionsIndex
