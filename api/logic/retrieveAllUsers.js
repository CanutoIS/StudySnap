const { validators: { validateId }, errors: { ExistenceError } } = require('com')
const { User, Conversation } = require('../data/models')

/**
 * Retrieves a conversation by conversation id
 * 
 * @param {string} userId The user id 
 * 
 * @returns {Promise<object>} The array with users
 * 
 * @throws {TypeError} On non-string user id
 * @throws {ContentError} On user id not equal to 24 characters of length or not hexadecimal
 * @throws {ExistenceError} On non-existing user
 */

module.exports = function retrieveConversations(userId) {
    validateId(userId, 'user id')

    return (async () => {
        const user = await User.findById(userId)
        if(!user) throw new ExistenceError('User not found.')

        const users = await User.find({}, 'name username _id').lean()

        users.forEach(user => {
            user.id = user._id.toString()
            delete user._id
        })

        return users
    })()
}
