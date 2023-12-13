require('dotenv').config()

const { expect } = require('chai')
const toggleFollowUser = require('../toggleFollowUser')
const { cleanUp, generate, populate } = require('../helpers-test')
const mongoose = require('mongoose')
const { errors: { ExistenceError, ContentError } } = require('com')
const { User } = require('../../data/models')
const { mongoose: { Types: { ObjectId } } } = require('mongoose')

describe('toggleFollowUser', () => {
    let user1, email1, user2, email2

    before(async () => await mongoose.connect(process.env.MONGODB_URL))

    beforeEach(async () => {
        try {
            await cleanUp()

            user1 = generate.user()
            email1 = user1.email
            user2 = generate.user()
            email2 = user2.email

            await populate([user1, user2])
        } catch (error) {
            
        }
    })

    it('succeeds on start following a user', async () => {
        try {
            const _user1 = await User.findOne({ email: email1 })
            const userId1 = _user1._id.toString()

            const _user2 = await User.findOne({ email: email2 })
            const userId2 = _user2._id.toString()

            await toggleFollowUser(userId1, userId2)

            const _user3 = await User.findOne({ email: email1 })
            const _user4 = await User.findOne({ email: email2 })

            expect(_user3.following).to.have.lengthOf(1)
            expect(_user3.following[0].id.toString()).to.equal(userId2)
            expect(_user3.following[0].username).to.equal(_user2.username)
            expect(_user3.following[0].name).to.equal(_user2.name)

            expect(_user4.followers).to.have.lengthOf(1)
            expect(_user4.followers[0].id.toString()).to.equal(userId1)
            expect(_user4.followers[0].username).to.equal(_user1.username)
            expect(_user4.followers[0].name).to.equal(_user1.name)
        } catch (error) {
            
        }
    })
    
    it('succeeds on stop following a user', async () => {
        try {
            const _user1 = await User.findOne({ email: email1 })
            const userId1 = _user1._id.toString()

            const _user2 = await User.findOne({ email: email2 })
            const userId2 = _user2._id.toString()

            await User.updateOne(
                { _id: userId1 },
                { $push: { following: { id: new ObjectId(userId2), username: user2.username, name: user2.name } } }
              )
              await User.updateOne(
                { _id: userId2 },
                { $push: { followers: { id: new ObjectId(userId1), name: user1.name, username: user1.username } } }
              )

            await toggleFollowUser(userId1, userId2)

            const _user3 = await User.findOne({ email: email1 })
            const _user4 = await User.findOne({ email: email2 })

            expect(_user3.following).to.have.lengthOf(0)

            expect(_user4.followers).to.have.lengthOf(0)
        } catch (error) {
            
        }
    })

    it('fails on non-existing user', async () => {
        try {
            const wrongUserId = '6102a3cbf245ef001c9a4961'
            const testUserToFollowId = '6102a3cbf245ef001c9a1837'
            
            await toggleFollowUser(wrongUserId, testUserToFollowId)

        } catch (error) {
            expect(error).to.be.instanceOf(ExistenceError)
            expect(error.message).to.equal('User not found.')
        }
    })
    
    it('fails on non-existing user to follow', async () => {
        try {
            const _user = await User.findOne({ email: email1 })
            const userId = _user._id.toString()

            const wrongUserToFollowId = '6102a3cbf245ef001c9a1837'

            await toggleFollowUser(userId, wrongUserToFollowId)

        } catch (error) {
            expect(error).to.be.instanceOf(ExistenceError)
            expect(error.message).to.equal('Profile user not found.')
        }
    })

    it('fails on empty user id', () => expect(() => toggleFollowUser('', '6102a3cbf245ef001c9a1837')).to.throw(ContentError, 'The user id does not have 24 characters.'))

    it('fails on a non-string user id', () => {
        const testSuggestionId = '6102a3cbf245ef001c9a1837'

        expect(() => toggleFollowUser(true, testSuggestionId)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => toggleFollowUser([], testSuggestionId)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => toggleFollowUser({}, testSuggestionId)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => toggleFollowUser(undefined, testSuggestionId)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => toggleFollowUser(1, testSuggestionId)).to.throw(TypeError, 'The user id is not a string.')
    })

    it('fails on not hexadecimal user id', () => expect(() => toggleFollowUser('-102a3cbf245ef001c9a1837', '6102a3cbf245ef001c9a1837')).to.throw(ContentError, 'The user id is not hexadecimal.'))
    
    it('fails on empty user to follow id', () => expect(() => toggleFollowUser('6102a3cbf245ef001c9a1837', '')).to.throw(ContentError, 'The user to follow id does not have 24 characters.'))

    it('fails on a non-string user to follow id', () => {
        const testUserId = '6102a3cbf245ef001c9a1837'

        expect(() => toggleFollowUser(testUserId, true)).to.throw(TypeError, 'The user to follow id is not a string.')
        expect(() => toggleFollowUser(testUserId, [])).to.throw(TypeError, 'The user to follow id is not a string.')
        expect(() => toggleFollowUser(testUserId, {})).to.throw(TypeError, 'The user to follow id is not a string.')
        expect(() => toggleFollowUser(testUserId, undefined)).to.throw(TypeError, 'The user to follow id is not a string.')
        expect(() => toggleFollowUser(testUserId, 1)).to.throw(TypeError, 'The user to follow id is not a string.')
    })

    it('fails on not hexadecimal user to follow id', () => expect(() => toggleFollowUser('6102a3cbf245ef001c9a1837', '-102a3cbf245ef001c9a1837')).to.throw(ContentError, 'The user to follow id is not hexadecimal.'))


    after(async () => await mongoose.disconnect())
})