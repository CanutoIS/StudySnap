const { sendRestorePasswordEmail } = require("../logic")
const { handleErrors } = require("./helpers")

module.exports = handleErrors((req, res) => {
  const { email } = req.body

  const promise = sendRestorePasswordEmail(email)

  return (async () => {
    await promise

    res.send()
  })()
})
