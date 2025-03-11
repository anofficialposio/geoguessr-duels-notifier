import { Settings } from "~components/Settings"

function IndexPopup() {
  return (
    <div
      style={{
        padding: 8,
        minWidth: 300
      }}>
      <p
        style={{
          marginBottom: 24,
          fontSize: 14,
          fontWeight: "bold"
        }}>
        {chrome.i18n.getMessage("popup_title")}
      </p>
      <p
        style={{
          marginBottom: 24,
          fontSize: 14,
          fontWeight: "bold",
          color: "red"
        }}>
        {chrome.i18n.getMessage("tmp_sorry")}
      </p>
      <Settings />
      <p
        style={{
          paddingTop: 8
        }}>
        <a href="options.html" target="_blank">
          {chrome.i18n.getMessage("popup_options")}
        </a>
      </p>
    </div>
  )
}

export default IndexPopup
