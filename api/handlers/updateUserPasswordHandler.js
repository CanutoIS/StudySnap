const { extractUserId, handleErrors } = require('./helpers')
const { updateUserPassword } = require('../logic')

module.exports = handleErrors((req, res) => {
  const userId = extractUserId(req)
  const { password, newPassword, newPasswordConfirm } = req.body

  const promise = updateUserPassword(userId, password, newPassword, newPasswordConfirm)

  return (async () => {
    await promise

    res.status(204).send()
  })()
})