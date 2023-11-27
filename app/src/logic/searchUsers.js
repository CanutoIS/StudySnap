import context from "./context"
import { errors, validators } from 'com'

const { validateText } = validators

/**
 * Sarch a user by the text entered
 * 
 * @param {string} text The text to search
 * 
 * @returns {Promise} The array of users whose username matches the text entered
 * 
 * @throws {TypeError} On non-string text to search
 * @throws {ContentError} On empty text to search
*/

export default function savePostAsSeen(textToSearch) {
    validateText(textToSearch, 'text to search')

    return (async () => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/searchUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${context.token}`
            },
            body: JSON.stringify({ textToSearch })
        })

        if (res.status === 200)
            return res.json()

        const { type, message } = await res.json()

        const clazz = errors[type]

        throw new clazz(message)
    })()
}