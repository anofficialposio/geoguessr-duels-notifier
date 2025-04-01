import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const ping = req.body?.ping
  if (!ping) {
    console.error("No ping found")
    return res.send({ error: "No ping found" })
  }

  return res.send({ ping: "pong" })
}

export default handler
