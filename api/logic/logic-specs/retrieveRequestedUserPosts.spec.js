require('dotenv').config()

const { expect } = require('chai')
const retrieveRequestedUserPosts = require('../retrieveRequestedUserPosts')
const { cleanUp, generate, populate } = require('../helpers-test')
const mongoose = require('mongoose')
const { errors: { ExistenceError, ContentError } } = require('com')
const { User, Post } = require('../../data/models')
const { mongoose: { Types: { ObjectId } } } = require('mongoose')

describe('retrieveRequestedUserPosts', () => {
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

    it('succeeds on retrieve the requested user posts data', async () => {
        try {
            const _user = generate.user()
            await User.create(_user)

            const _user2 = await User.findById(_user._id)
            const requestedUserId = _user2._id
            const stringRequestedUserId = _user2._id.toString()

            const _date = new Date

            const testPost = { author: requestedUserId, title: 'Test title', text: 'This is a content used to do this test.', subject: 'biology', date: _date.toLocaleDateString() }

            await Post.create(testPost)

            const _user3 = await User.findOne({ email: email })
            const userId = _user3._id.toString()

            const post = await Post.findOne({ author: stringRequestedUserId })
            const postId = post._id.toString()

            const posts = await retrieveRequestedUserPosts(userId, stringRequestedUserId)

            expect(posts).to.exist
            expect(posts).to.be.an('array')
            expect(posts).to.have.lengthOf(1)
            expect(posts[0]._id.toString()).to.equal(postId)
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
            expect(error.message).to.equal('The user is not found.')
        }
    })

    it('fails on non-existing requested user', async () => {
        try {
            const _user = await User.findOne({ email: email })
            const userId = _user._id.toString()

            const wrongRequestedUserId = '6102a3cbf245ef001c9a1837'

            const posts = await retrieveRequestedUserPosts(userId, wrongRequestedUserId)


        } catch (error) {
            expect(error).to.be.instanceOf(ExistenceError)
            expect(error.message).to.equal('The requested user is not found.')
        }
    })

    it('fails on empty user id', () => expect(() => retrieveRequestedUserPosts('', '6102a3cbf245ef001c9a1837')).to.throw(ContentError, 'The user id does not have 24 characters.'))

    it('fails on a non-string user id', () => {
        const testRequestedUserId = '6102a3cbf245ef001c9a1837'

        expect(() => retrieveRequestedUserPosts(true, testRequestedUserId)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => retrieveRequestedUserPosts([], testRequestedUserId)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => retrieveRequestedUserPosts({}, testRequestedUserId)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => retrieveRequestedUserPosts(undefined, testRequestedUserId)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => retrieveRequestedUserPosts(1, testRequestedUserId)).to.throw(TypeError, 'The user id is not a string.')
    })

    it('fails on not hexadecimal user id', () => expect(() => retrieveRequestedUserPosts('-102a3cbf245ef001c9a1837', '6102a3cbf245ef001c9a1837')).to.throw(ContentError, 'The user id is not hexadecimal.'))
    
    it('fails on empty requested user id', () => expect(() => retrieveRequestedUserPosts('6102a3cbf245ef001c9a1837', '')).to.throw(ContentError, 'The requested user id does not have 24 characters.'))

    it('fails on a non-string requested user id', () => {
        const testUserId = '6102a3cbf245ef001c9a1837'

        expect(() => retrieveRequestedUserPosts(testUserId, true)).to.throw(TypeError, 'The requested user id is not a string.')
        expect(() => retrieveRequestedUserPosts(testUserId, [])).to.throw(TypeError, 'The requested user id is not a string.')
        expect(() => retrieveRequestedUserPosts(testUserId, {})).to.throw(TypeError, 'The requested user id is not a string.')
        expect(() => retrieveRequestedUserPosts(testUserId, undefined)).to.throw(TypeError, 'The requested user id is not a string.')
        expect(() => retrieveRequestedUserPosts(testUserId, 1)).to.throw(TypeError, 'The requested user id is not a string.')
    })

    it('fails on not hexadecimal requested user id', () => expect(() => retrieveRequestedUserPosts('6102a3cbf245ef001c9a1837', '-102a3cbf245ef001c9a1837')).to.throw(ContentError, 'The requested user id is not hexadecimal.'))

    after(async () => await mongoose.disconnect())
})