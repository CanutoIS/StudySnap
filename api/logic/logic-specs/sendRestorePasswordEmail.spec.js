require('dotenv').config()

const { expect } = require('chai')
const sendRestorePasswordEmail = require('../sendRestorePasswordEmail')
const { cleanUp, generate, populate } = require('../helpers-test')
const mongoose = require('mongoose')
const { errors: { ExistenceError } } = require('com')
const { User, Post } = require('../../data/models')

describe('sendRestorePasswordEmail', () => {
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

            await sendRestorePasswordEmail(wrongUserEmail)
        } catch (error) {
            expect(error).to.be.instanceOf(ExistenceError)
            expect(error.message).to.equal('User with this email is not registered.')
        }
    })

    after(async () => await mongoose.disconnect())
})