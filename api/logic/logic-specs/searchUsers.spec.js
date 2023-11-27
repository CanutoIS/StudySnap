require('dotenv').config()

const { expect } = require('chai')
const searchUsers = require('../searchUsers')
const { cleanUp, generate, populate } = require('../helpers-test')
const mongoose = require('mongoose')
const { errors: { ExistenceError, ContentError } } = require('com')
const { User } = require('../../data/models')

describe('searchUsers', () => {
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
            _user.name = 'testUser'
            await User.create(_user)
            
            const _user2 = await User.findOne({ email: email })
            const userId = _user2._id.toString()

            const testTextToSearch = 'test'

            const _user3 = await User.findById(_user._id)
            const requestedUserId = _user3._id.toString()

            const users = await searchUsers(userId, testTextToSearch)

            expect(users).to.exist
            expect(users).to.be.an('array')
            expect(users).to.have.lengthOf(1)
            expect(users[0]._id.toString()).to.equal(requestedUserId)
        } catch (error) {
            
        }
    })

    it('fails on non-existing user', async () => {
        try {
            const wrongUserId = '6102a3cbf245ef001c9a1837'
            const testTextToSearch = 'test text to search'

            const users = await searchUsers(wrongUserId, testTextToSearch)
        } catch (error) {
            expect(error).to.be.instanceOf(ExistenceError)
            expect(error.message).to.equal('User not found.')
        }
    })

    it('fails on empty user id', () => expect(() => searchUsers('', 'test text to search')).to.throw(ContentError, 'The user id does not have 24 characters.'))

    it('fails on a non-string user id', () => {
        const testTextToSearch = 'test text to search'

        expect(() => searchUsers(true, testTextToSearch)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => searchUsers([], testTextToSearch)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => searchUsers({}, testTextToSearch)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => searchUsers(undefined, testTextToSearch)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => searchUsers(1, testTextToSearch)).to.throw(TypeError, 'The user id is not a string.')
    })

    it('fails on not hexadecimal user id', () => expect(() => searchUsers('-102a3cbf245ef001c9a1837', 'test text to search')).to.throw(ContentError, 'The user id is not hexadecimal.'))
    
    it('fails on empty text to search', () => expect(() => searchUsers('6102a3cbf245ef001c9a1837', '')).to.throw(ContentError, 'The text to search field is empty.'))

    it('fails on a non-string text to search', () => {
        const testUserId = '6102a3cbf245ef001c9a1837'

        expect(() => searchUsers(testUserId, true)).to.throw(TypeError, 'The text to search is not a string.')
        expect(() => searchUsers(testUserId, [])).to.throw(TypeError, 'The text to search is not a string.')
        expect(() => searchUsers(testUserId, {})).to.throw(TypeError, 'The text to search is not a string.')
        expect(() => searchUsers(testUserId, undefined)).to.throw(TypeError, 'The text to search is not a string.')
        expect(() => searchUsers(testUserId, 1)).to.throw(TypeError, 'The text to search is not a string.')
    })

    after(async () => await mongoose.disconnect())
})