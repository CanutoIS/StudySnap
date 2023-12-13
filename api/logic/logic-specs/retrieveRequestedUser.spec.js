require('dotenv').config()

const { expect } = require('chai')
const retrieveRequestedUser = require('../retrieveRequestedUser')
const { cleanUp, generate, populate } = require('../helpers-test')
const mongoose = require('mongoose')
const { errors: { ExistenceError, ContentError } } = require('com')
const { User } = require('../../data/models')

describe('retrieveRequestedUser', () => {
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

    it('succeeds on retrieve the requested user data', async () => {
        try {
            const _user = generate.user()
            await User.create(_user)

            const requestedUser = await User.findById(_user._id)
            const requestedUserId = requestedUser._id.toString()

            const _user2 = await User.findOne({ email: email })
            const userId = _user2._id.toString()

            const _user3 = await retrieveRequestedUser(userId, requestedUserId)

            expect(_user3).to.exist
            expect(_user3).to.be.an('object')
            expect(_user3.id).to.equal(userId)
            expect(_user3).to.not.have.any.keys('password', 'favs');
        } catch (error) {
            
        }
    })

    it('fails on non-existing user', async () => {
        try {
            const wrongUserId = '6102a3cbf245ef001c9a1837'
            const testRequestedUserId = '6102a3cbf245ef001c9a1837'

            const _user2 = await retrieveRequestedUser(wrongUserId, testRequestedUserId)

        } catch (error) {
            expect(error).to.be.instanceOf(ExistenceError)
            expect(error.message).to.equal('User not found.')
        }
    })

    it('fails on non-existing requested user', async () => {
        try {
            const _user = await User.findOne({ email: email })
            const userId = _user._id.toString()

            const wrongRequestedUserId = '6102a3cbf245ef001c9a1837'

            const _user2 = await retrieveRequestedUser(userId, wrongRequestedUserId)


        } catch (error) {
            expect(error).to.be.instanceOf(ExistenceError)
            expect(error.message).to.equal('The requested user is not found.')
        }
    })

    it('fails on empty user id', () => expect(() => retrieveRequestedUser('', '6102a3cbf245ef001c9a1837')).to.throw(ContentError, 'The user id does not have 24 characters.'))

    it('fails on a non-string user id', () => {
        const testRequestedUserId = '6102a3cbf245ef001c9a1837'

        expect(() => retrieveRequestedUser(true, testRequestedUserId)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => retrieveRequestedUser([], testRequestedUserId)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => retrieveRequestedUser({}, testRequestedUserId)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => retrieveRequestedUser(undefined, testRequestedUserId)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => retrieveRequestedUser(1, testRequestedUserId)).to.throw(TypeError, 'The user id is not a string.')
    })

    it('fails on not hexadecimal user id', () => expect(() => retrieveRequestedUser('-102a3cbf245ef001c9a1837', '6102a3cbf245ef001c9a1837')).to.throw(ContentError, 'The user id is not hexadecimal.'))
    
    it('fails on empty requested user id', () => expect(() => retrieveRequestedUser('6102a3cbf245ef001c9a1837', '')).to.throw(ContentError, 'The requested user id does not have 24 characters.'))

    it('fails on a non-string requested user id', () => {
        const testUserId = '6102a3cbf245ef001c9a1837'

        expect(() => retrieveRequestedUser(testUserId, true)).to.throw(TypeError, 'The requested user id is not a string.')
        expect(() => retrieveRequestedUser(testUserId, [])).to.throw(TypeError, 'The requested user id is not a string.')
        expect(() => retrieveRequestedUser(testUserId, {})).to.throw(TypeError, 'The requested user id is not a string.')
        expect(() => retrieveRequestedUser(testUserId, undefined)).to.throw(TypeError, 'The requested user id is not a string.')
        expect(() => retrieveRequestedUser(testUserId, 1)).to.throw(TypeError, 'The requested user id is not a string.')
    })

    it('fails on not hexadecimal requested user id', () => expect(() => retrieveRequestedUser('6102a3cbf245ef001c9a1837', '-102a3cbf245ef001c9a1837')).to.throw(ContentError, 'The requested user id is not hexadecimal.'))

    after(async () => await mongoose.disconnect())
})