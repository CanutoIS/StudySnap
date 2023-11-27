const handleErrors = require('./handleErrors')

module.exports = handleErrors(async (req, res) => {
    res.send('Server UP')
})