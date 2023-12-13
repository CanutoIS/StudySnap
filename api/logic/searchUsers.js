const {
    validators: { validateId, validateText },
    errors: { ExistenceError }
  } = require('com')
  const { User } = require('../data/models')

  /**
 * Retrieves the posts matching the user search
 * 
 * @param {string} userId The user id
 * @param {string} textToSearch The text used for searching posts
 * 
 * @returns {Promise<array>} The array of posts
 * 
 * @throws {TypeError} On non-string user id, post subject or text to search
 * @throws {ContentError} On user id not equal to 24 characters of length or not hexadecimal, or empty post subject or text to search
 * @throws {ExistenceError} On non-existing user
 */
  
  module.exports = (userId, textToSearch) => {
    validateId(userId, 'user id')
    validateText(textToSearch, 'text to search')
  
    return (async () => {
      const user = await User.findById(userId)
      if(!user) throw new ExistenceError('User not found.')
      
      const users = await User.find({ username: {$regex: textToSearch, $options: 'i'} }, 'name username _id').lean()
  
      if(users === null) throw new Error('There must be an error.')
      else {
        if(users.length > 0 )
          users.forEach(user => {
            user.id = user._id.toString()
            delete user._id
          })
    
        return users
      }
    })()
  }