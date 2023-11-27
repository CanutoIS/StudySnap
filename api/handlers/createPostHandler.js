const { extractUserId, handleErrors } = require('./helpers')
const { createPost } = require('../logic')

module.exports = handleErrors((req, res) => {
  const userId = extractUserId(req)
  const { title, content, subject } = req.body
  
  const promise = createPost(userId, title, content, subject)

  return (async () => {
    await promise
    
    res.status(201).send()
  })()
})