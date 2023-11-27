const { retrieveAllUsers } = require("../logic")
const { handleErrors, extractUserId } = require("./helpers")

module.exports = handleErrors((req, res) => {
  const userId = extractUserId(req)

  const promise = retrieveAllUsers(userId)

  return (async () => {
    const users = await promise

    res.send(users)
  })()
})
