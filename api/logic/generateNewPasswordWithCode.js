const { validators: { validateEmail, validateText, validatePassword }, errors: { ExistenceError } } = require('com')
const { User } = require('../data/models')
const bcrypt = require('bcryptjs')

/**
 * Retrieves a conversation by conversation id
 * 
 * @param {string} email The user email
 * @param {string} code The password recovery code
 * @param {string} newPassword The new password
 * @param {string} newPasswordConfirm The new password confirmation
 * 
 * @returns {Promise<object>} A Promise that resolves if the new password is generated successfully, or rejects with an error message if fails
 * 
 * @throws {TypeError} On non-string email, code, new password or new password confirm
 * @throws {ContentError} On empty email or code, or not valid email
 * @throws {RangeError} On new password or new password confirmation lower than six characters
 * @throws {ExistenceError} On non-existing user or conversation
 */

module.exports = (email, code, newPassword, newPasswordConfirm) => {
    validateEmail(email, 'user email')
    validateText(code, 'recovery password code')
    validatePassword(newPassword, 'new password')
    validatePassword(newPasswordConfirm, 'new password confirm')

    if(newPassword !== newPasswordConfirm) throw new Error('The new passwords do not match.')

    return (async () => {
        const user = await User.findOne({ email })
        if(!user) throw new ExistenceError('User with this email is not registered.')

        if(code !== user.recoveryCode) throw new Error('Incorrect code.')

        const match = await bcrypt.compare(newPassword, user.password)
        if(match) throw new Error('The password is the same as the old one.')

        const hash = await bcrypt.hash(newPassword, 10)

        await User.updateOne(
            { _id: user._id },
            { 
              $set: {
                recoveryCode: null,
                password: hash
              }
            }
          );          
    })()
}
