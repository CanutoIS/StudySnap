require('dotenv').config()

const { expect } = require('chai')
const sendRegisterSuccessMessage = require('../sendRegisterSuccessMessage')
const { cleanUp, generate, populate } = require('../helpers-test')
const mongoose = require('mongoose')
const { errors: { ExistenceError } } = require('com')

describe('sendRegisterSuccessMessage', () => {
    let user, email

    before(async () => await mongoose.connect(process.env.MONGODB_URL))

    beforeEach(async () => {
        try {
            await cleanUp()

            user = generate.user()
            email = user.email

            await populate(user)
        } catch (error) {
            
        }
    })

    it('fails on non-existent user', async () => {
        try {
            const wrongUserEmail = 'wrongUser@email.com'

            await sendRegisterSuccessMessage(wrongUserEmail)
        } catch (error) {
            expect(error).to.be.instanceOf(ExistenceError)
            expect(error.message).to.equal('User not found.')
        }
    })

    after(async () => await mongoose.disconnect())
})