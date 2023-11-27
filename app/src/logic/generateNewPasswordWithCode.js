import { errors, validators } from 'com'

const { validateEmail, validatePassword, validateText } = validators

/**
 * Restore the new use password
 * 
 * @param {string} email The user email
 * 
 * @returns {Promise} A Promise that resolves when a post is saved as seen successfully, or throws an error if the operation fails
 * 
 * @throws {TypeError} On non-string user email
 * @throws {ContentError} On empty or not valid user email
*/

export default function generateNewPasswordWithCode(email, code, newPassword, newPasswordConfirm) {
    validateEmail(email, 'user email')
    validateText(code, 'recover password code')
    validatePassword(newPassword, 'new password')
    validatePassword(newPasswordConfirm, 'new password confirm')

    if(newPassword !== newPasswordConfirm) throw new Error('The new passwords do not match.')

    return (async () => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/newPasswordWithCode`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, code, newPassword, newPasswordConfirm })
        })

        if (res.status === 204)
            return

        const { type, message } = await res.json()

        const clazz = errors[type]

        throw new clazz(message)
    })()
}