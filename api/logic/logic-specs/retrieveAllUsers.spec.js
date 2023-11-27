require('dotenv').config()

const { expect } = require('chai')
const retrieveAllUsers = require('../retrieveAllUsers')
const { cleanUp, generate, populate } = require('../helpers-test')
const mongoose = require('mongoose')
const { errors: { ExistenceError, ContentError } } = require('com')
const { User } = require('../../data/models')
const { mongoose: { Types: { ObjectId } } } = require('mongoose')

describe('retrieveAllUsers', () => {
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

    it('succeeds on recieving summary text', async () => {
        try {
            const _user = await User.findOne({ email: email })
            const userId = _user._id.toString()

            const users = await retrieveAllUsers(userId)

            expect(users).to.exist
            expect(users).to.be.an('array')
            expect(users).to.have.lengthOf(1)

        } catch (error) {
            
        }
    })

    it('fails on non-existing user', async () => {
        try {
            const wrongUserId = '6102a3cbf245ef001c9a1837'

            const users = await retrieveAllUsers(wrongUserId)

        } catch (error) {
            expect(error).to.be.instanceOf(ExistenceError)
            expect(error.message).to.equal('User not found.')
        }
    })

    it('fails on empty user id', () => expect(() => retrieveAllUsers('')).to.throw(ContentError, 'The user id does not have 24 characters.'))

    it('fails on a non-string user id', () => {
        expect(() => retrieveAllUsers(true)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => retrieveAllUsers([])).to.throw(TypeError, 'The user id is not a string.')
        expect(() => retrieveAllUsers({})).to.throw(TypeError, 'The user id is not a string.')
        expect(() => retrieveAllUsers(undefined)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => retrieveAllUsers(1)).to.throw(TypeError, 'The user id is not a string.')
    })

    it('fails on not hexadecimal user id', () => expect(() => retrieveAllUsers('-102a3cbf245ef001c9a1837')).to.throw(ContentError, 'The user id is not hexadecimal.'))

    after(async () => await mongoose.disconnect())
})