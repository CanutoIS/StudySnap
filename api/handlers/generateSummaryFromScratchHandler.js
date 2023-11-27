const { extractUserId, handleErrors } = require('./helpers')
const { generateSummaryFromScratch } = require('../logic')

module.exports = handleErrors((req, res) => {
  const userId = extractUserId(req)
  const { textToSummarize } = req.body
  
  const promise = generateSummaryFromScratch(userId, textToSummarize)

  return (async () => {
    const summary = await promise
    
    res.status(201).send(summary)
  })()
})