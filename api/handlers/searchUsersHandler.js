const { extractUserId, handleErrors } = require('./helpers')
const { searchUsers } = require('../logic')

module.exports = handleErrors((req, res) => {
  const userId = extractUserId(req)
  const { textToSearch } = req.body

  const promise = searchUsers(userId, textToSearch)

  return (async () => {
    const users = await promise

    res.send(users)
  })()
})