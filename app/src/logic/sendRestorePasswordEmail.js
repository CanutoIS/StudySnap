import { errors, validators } from 'com'

const { validateEmail } = validators

/**
 * Sends an email with the recovery code
 * 
 * @param {string} email The user email
 * 
 * @returns {Promise} A Promise that resolves when a post is saved as seen successfully, or throws an error if the operation fails
 * 
 * @throws {TypeError} On non-string user email
 * @throws {ContentError} On empty or not valid user email
*/

export default function sendRestorePasswordEmail(email) {
    validateEmail(email, 'user email')

    return (async () => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/restorePasswordEmail`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        })

        if (res.status === 200)
            return

        const { type, message } = await res.json()

        const clazz = errors[type]

        throw new clazz(message)
    })()
}