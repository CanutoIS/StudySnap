import context from "./context"
import { errors } from 'com'

/**
 * Retrieves all users' names, userNames and IDs
 * 
 * @returns {Promise<object>} Ann array with all users
 */

export default function retrieveAllUsers() {
    return (async () => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/allUsers`, {
            headers: {
                'Authorization': `Bearer ${context.token}`
            }
        })

        if (res.status === 200)
            return res.json()

        const { type, message } = await res.json()

        const clazz = errors[type]

        throw new clazz(message)
    })()
}