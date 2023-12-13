require('dotenv').config()

const { expect } = require('chai')
const createPost = require('../createPost')
const { cleanUp, generate, populate } = require('../helpers-test')
const mongoose = require('mongoose')
const { errors: { ExistenceError, ContentError } } = require('com')
const { User, Conversation, Post } = require('../../data/models')
const { mongoose: { Types: { ObjectId } } } = require('mongoose')

describe('createPost', () => {
    let user, email, content

    before(async () => await mongoose.connect(process.env.MONGODB_URL))

    beforeEach(async () => {
        try {
            await cleanUp()

            user = generate.user()
            email = user.email

            content = generate.post().content

            await populate(user, [])
        } catch (error) {
            
        }
    })

    it('succeeds on creating post', async () => {
        try {
            const _user = await User.findOne({ email: user.email })
            const userId = _user._id.toString()

            const conversationTitle = 'Test conversation'

            await Conversation.create({ author: new ObjectId(userId), title: conversationTitle })

            const conversation = await Conversation.findOne({ author: userId })
            const conversationId = conversation._id.toString()
            
            await createPost(userId, conversationId, content, 'Others')

            const post = await Post.findOne({ author: userId })

            expect(post).to.be.an('object')
            expect(post.author.toString()).to.equal(userId)
            expect(post.title).to.equal(conversationTitle)
            expect(post.text).to.equal(summaryText)
            expect(post.image).to.equal(undefined)
            expect(post.likes).to.be.an('array')
            expect(post.visible).to.equal(true)
            expect(post.comments).to.be.an('array')

        } catch (error) {
            
        }
    })



    it('fails on non-existing user', async () => {
        try {
            const _user = await User.findOne({ email: user.email })
            const userId = _user._id.toString()
            
            await Conversation.create({ author: new ObjectId(userId), title: 'Test conversation', messages: [] })

            const conversation = await Conversation.findOne({ author: userId })
            const conversationId = conversation._id.toString()

            const wrongUserId = '6102a3cbf245ef001c9a1837'

            await createPost(wrongUserId, conversationId, content, 'Others')

        } catch (error) {
            expect(error).to.be.instanceOf(ExistenceError)
            expect(error.message).to.equal('User not found.')
        }
    })
    
    it('fails on non-existing conversation', async () => {
        try {
            const _user = await User.findOne({ email: user.email })
            const userId = _user._id.toString()
            
            await Conversation.create({ author: new ObjectId(userId), title: 'Test conversation', messages: [] })

            const wrongConversationId = '6102a3cbf245ef001c9a1837'

            await createPost(userId, wrongConversationId, content, 'Others')

        } catch (error) {
            expect(error).to.be.instanceOf(ExistenceError)
            expect(error.message).to.equal('Conversation not found.')
        }
    })

    it('fails on empty user id', () => expect(() => createPost('', 'New post title', content, 'Others')).to.throw(ContentError, 'The user id does not have 24 characters.'))

    it('fails on a non-string user id', () => {
        const postTitle = 'New post title'
        const subject = 'Others'

        expect(() => createPost(true, postTitle, content, subject)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => createPost([], postTitle, content, subject)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => createPost({}, postTitle, content, subject)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => createPost(undefined, postTitle, content, subject)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => createPost(1, postTitle, content, subject)).to.throw(TypeError, 'The user id is not a string.')
    })

    it('fails on not hexadecimal user id', () => expect(() => createPost('-102a3cbf245ef001c9a1837', 'New post title', content, 'Others')).to.throw(ContentError, 'The user id is not hexadecimal.'))
    
    it('fails on empty post title', () => expect(() => createPost('6102a3cbf245ef001c9a1837', '', content, 'Others')).to.throw(ContentError, 'The new post title field is empty.'))

    it('fails on a non-string post title', () => {
        const testUserId = '6102a3cbf245ef001c9a1837'
        const subject = 'Others'

        expect(() => createPost(testUserId, true, content, subject)).to.throw(TypeError, 'The new post title is not a string.')
        expect(() => createPost(testUserId, [], content, subject)).to.throw(TypeError, 'The new post title is not a string.')
        expect(() => createPost(testUserId, {}, content, subject)).to.throw(TypeError, 'The new post title is not a string.')
        expect(() => createPost(testUserId, undefined, content, subject)).to.throw(TypeError, 'The new post title is not a string.')
        expect(() => createPost(testUserId, 1, content, subject)).to.throw(TypeError, 'The new post title is not a string.')
    })

    it('fails on post title too long', () => expect(() => createPost('6102a3cbf245ef001c9a1837', 'New post tile too long. New post tile too long. New post tile too long. New post tile too long.', content, 'Others')).to.throw(RangeError, 'The title of the post is too long.'))

    it('fails on empty summary text', () => expect(() => createPost('6102a3cbf245ef001c9a1837', 'New post title', '', 'Others')).to.throw(ContentError, 'The new post content field is empty.'))

    it('fails on a non-string summary text', () => {
        const testUserId = '6102a3cbf245ef001c9a1837'
        const postTitle = 'New post title'
        const subject = 'Others'
        
        expect(() => createPost(testUserId, postTitle, true, subject)).to.throw(TypeError, 'The new post content is not a string.')
        expect(() => createPost(testUserId, postTitle, [], subject)).to.throw(TypeError, 'The new post content is not a string.')
        expect(() => createPost(testUserId, postTitle, {}, subject)).to.throw(TypeError, 'The new post content is not a string.')
        expect(() => createPost(testUserId, postTitle, undefined, subject)).to.throw(TypeError, 'The new post content is not a string.')
        expect(() => createPost(testUserId, postTitle, 1, subject)).to.throw(TypeError, 'The new post content is not a string.')
    })

    it('fails on empty summary text', () => expect(() => createPost('6102a3cbf245ef001c9a1837', 'New post title.', 'Content too short.', 'Others')).to.throw(RangeError, 'The content of the post is too short.'))

    it('fails on empty post subject', () => expect(() => createPost('6102a3cbf245ef001c9a1837', 'New post title', content, '')).to.throw(ContentError, `The subject field is empty.`))
    
    it('fails on a non-string post subject', () => {
        const testUserId = '6102a3cbf245ef001c9a1837'
        const postTitle = 'New post title'
        
        expect(() => createPost(testUserId, postTitle, content, true)).to.throw(TypeError, `The subject is not a string.`)
        expect(() => createPost(testUserId, postTitle, content, [])).to.throw(TypeError, `The subject is not a string.`)
        expect(() => createPost(testUserId, postTitle, content, {})).to.throw(TypeError, `The subject is not a string.`)
        expect(() => createPost(testUserId, postTitle, content, undefined)).to.throw(TypeError, `The subject is not a string.`)
        expect(() => createPost(testUserId, postTitle, content, 1)).to.throw(TypeError, `The subject is not a string.`)
    })

    it('fails on invalid post subject', () => expect(() => createPost('6102a3cbf245ef001c9a1837', 'New post title', content, 'physical education')).to.throw(ContentError, 'The subject is not valid'))

    after(async () => await mongoose.disconnect())
})