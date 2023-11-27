const { generateNewPasswordWithCode } = require('../logic')
const { handleErrors } = require('./helpers')

module.exports = handleErrors((req, res) => {
  const { email, code, newPassword, newPasswordConfirm } = req.body

  const promise = generateNewPasswordWithCode(email, code, newPassword, newPasswordConfirm)

  return (async () => {
    await promise

    res.status(204).send()
  })()
})