require('dotenv').config()

const { expect } = require('chai')
const updatePost = require('../updatePost')
const { cleanUp, generate, populate } = require('../helpers-test')
const mongoose = require('mongoose')
const { errors: { ExistenceError, ContentError } } = require('com')
const { User, Post } = require('../../data/models')
const { mongoose: { Types: { ObjectId } } } = require('mongoose')
const bcrypt = require('bcryptjs')

describe('updatePost', () => {
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

    it('succeeds on updating the title and the content of the post', async () => {
        try {
            const _user = await User.findOne({ email: user.email })
            const userId = _user._id.toString()

            const postTitle = 'Test Conversation'
            const postText = 'Juan Carlos I de Borbon, es el padre del actual rey de la monarquía española, Felipe IV. Juan Carlos también fue rey de España hasta que en 2014 abdicó cediendole el trono a su hijo Felipe.'
            
            await Post.create({ author: new ObjectId(userId), title: postTitle, text: postText, subject: 'Others' })

            const post = await Post.findOne({ author: new ObjectId(userId) })
            const postId = post._id.toString()

            const newTitlePost = 'New post title'
            const postSubject = 'Others'

            await updatePost(userId, postId, newTitlePost, content, postSubject)

            const _post = await Post.findOne({ author: userId })

            expect(_post).to.exist
            expect(_post).to.be.an('object')
            expect(_post.title).to.equal(newTitlePost)
            expect(_post.text).to.equal(content)

        } catch (error) {
            
        }
    })

    it('fails on non-existing user', async () => {
        try {
            const _user = await User.findOne({ email: user.email })
            const userId = _user._id.toString()

            const postTitle = 'Test Conversation'
            const postText = 'Juan Carlos I de Borbon, es el padre del actual rey de la monarquía española, Felipe IV. Juan Carlos también fue rey de España hasta que en 2014 abdicó cediendole el trono a su hijo Felipe.'
            
            await Post.create({ author: new ObjectId(userId), title: postTitle, text: postText, subject: 'Others' })

            const post = await Post.findOne({ author: new ObjectId(userId) })
            const postId = post._id.toString()

            const newTitlePost = 'New post title'
            const postSubject = 'Others'

            const wrongUserId = '6102a3cbf245ef001c9a1837'
            
            await updatePost(wrongUserId, postId, newTitlePost, content, postSubject)

        } catch (error) {
            expect(error).to.be.instanceOf(ExistenceError)
            expect(error.message).to.equal('User not found.')
        }
    })
    
    it('fails on non-existing post', async () => {
        try {
            const _user = await User.findOne({ email: user.email })
            const userId = _user._id.toString()

            const postTitle = 'Test Conversation'
            const postText = 'Juan Carlos I de Borbon, es el padre del actual rey de la monarquía española, Felipe IV. Juan Carlos también fue rey de España hasta que en 2014 abdicó cediendole el trono a su hijo Felipe.'
            
            await Post.create({ author: new ObjectId(userId), title: postTitle, text: postText, subject: 'Others' })

            const newTitlePost = 'New post title'
            const postSubject = 'Others'

            const wrongPostId = '6102a3cbf245ef001c9a1837'

            await updatePost(userId, wrongPostId, newTitlePost, content, postSubject)

        } catch (error) {
            expect(error).to.be.instanceOf(ExistenceError)
            expect(error.message).to.equal('Post not found.')
        }
    })
    
    it('fails on the user is not the owner of the post', async () => {
        try {
            const _user = await User.findOne({ email: user.email })
            const userId = _user._id.toString()

            const postTitle = 'Test Conversation'
            const postText = 'Juan Carlos I de Borbon, es el padre del actual rey de la monarquía española, Felipe IV. Juan Carlos también fue rey de España hasta que en 2014 abdicó cediendole el trono a su hijo Felipe.'

            await Post.create({ author: new ObjectId(userId), title: postTitle, text: postText, subject: 'Others' })
            
            const post = await Post.findOne({ author: userId })
            const postId = post._id.toString()
            
            const testPassword = 'testPassword'
            const hash = await bcrypt.hash(testPassword, 10)

            await User.create({ name: 'testName', username: 'usernametest', email: 'test@email.com', password: hash})

            const newUser = await User.findOne({ email: 'test@email.com' })
            const newUserId = newUser._id.toString()

            const newTitlePost = 'New post title'
            const postSubject = 'Others'

            await updatePost(newUserId, postId, newTitlePost, content, postSubject)

        } catch (error) {
            expect(error).to.be.instanceOf(Error)
            expect(error.message).to.equal('This user is not the owner of the post.')
        }
    })

    it('fails on empty user id', () => expect(() => updatePost('', '6102a3cbf245ef001c9a1837', 'New post title', content, 'Others')).to.throw(ContentError, 'The user id does not have 24 characters.'))

    it('fails on a non-string user id', () => {
        const testPostId = '6102a3cbf245ef001c9a1837'
        const testPostTitle = 'New post title'
        const postSubject = 'Others'

        expect(() => updatePost(true, testPostId, testPostTitle, content, postSubject)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => updatePost([], testPostId, testPostTitle, content, postSubject)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => updatePost({}, testPostId, testPostTitle, content, postSubject)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => updatePost(undefined, testPostId, testPostTitle, content, postSubject)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => updatePost(1, testPostId, testPostTitle, content, postSubject)).to.throw(TypeError, 'The user id is not a string.')
    })

    it('fails on not hexadecimal user id', () => expect(() => updatePost('-102a3cbf245ef001c9a1837', '6102a3cbf245ef001c9a1837', 'New post title', content, 'Others')).to.throw(ContentError, 'The user id is not hexadecimal.'))
    
    it('fails on empty post id', () => expect(() => updatePost('6102a3cbf245ef001c9a1837', '', 'New post title', content, 'Others')).to.throw(ContentError, 'The post id does not have 24 characters.'))

    it('fails on a non-string post id', () => {
        const testUserId = '6102a3cbf245ef001c9a1837'
        const testPostTitle = 'New post title'
        const postSubject = 'Others'

        expect(() => updatePost(testUserId, true, testPostTitle, content, postSubject)).to.throw(TypeError, 'The post id is not a string.')
        expect(() => updatePost(testUserId, [], testPostTitle, content, postSubject)).to.throw(TypeError, 'The post id is not a string.')
        expect(() => updatePost(testUserId, {}, testPostTitle, content, postSubject)).to.throw(TypeError, 'The post id is not a string.')
        expect(() => updatePost(testUserId, undefined, testPostTitle, content, postSubject)).to.throw(TypeError, 'The post id is not a string.')
        expect(() => updatePost(testUserId, 1, testPostTitle, content, postSubject)).to.throw(TypeError, 'The post id is not a string.')
    })

    it('fails on not hexadecimal post id', () => expect(() => updatePost('6102a3cbf245ef001c9a1837', '-102a3cbf245ef001c9a1837', 'New post title', content, 'Others')).to.throw(ContentError, 'The post id is not hexadecimal.'))

    it('fails on empty post title', () => expect(() => updatePost('6102a3cbf245ef001c9a1837', '6102a3cbf245ef001c9a1837', '', content, 'Others')).to.throw(ContentError, 'The new post title field is empty.'))

    it('fails on a non-string post title', () => {
        const testUserId = '6102a3cbf245ef001c9a1837'
        const testPostId = '6102a3cbf245ef001c9a1837'
        const postSubject = 'Others'
        
        expect(() => updatePost(testUserId, testPostId, true, content, postSubject)).to.throw(TypeError, 'The new post title is not a string.')
        expect(() => updatePost(testUserId, testPostId, [], content, postSubject)).to.throw(TypeError, 'The new post title is not a string.')
        expect(() => updatePost(testUserId, testPostId, {}, content, postSubject)).to.throw(TypeError, 'The new post title is not a string.')
        expect(() => updatePost(testUserId, testPostId, undefined, content, postSubject)).to.throw(TypeError, 'The new post title is not a string.')
        expect(() => updatePost(testUserId, testPostId, 1, content, postSubject)).to.throw(TypeError, 'The new post title is not a string.')
    })

    it('fails on post title too long', () => expect(() => updatePost('6102a3cbf245ef001c9a1837', '6102a3cbf245ef001c9a1837', content, content, 'Others')).to.throw(RangeError, 'The title of the post is too long.'))
    
    it('fails on empty post text', () => expect(() => updatePost('6102a3cbf245ef001c9a1837', '6102a3cbf245ef001c9a1837', 'New post title', '', 'Others')).to.throw(ContentError, 'The new post content field is empty.'))

    it('fails on a non-string post text', () => {
        const testUserId = '6102a3cbf245ef001c9a1837'
        const testPostId = '6102a3cbf245ef001c9a1837'
        const testPostTitle = 'New post title'
        const postSubject = 'Others'
        
        expect(() => updatePost(testUserId, testPostId, testPostTitle, true, postSubject)).to.throw(TypeError, 'The new post content is not a string.')
        expect(() => updatePost(testUserId, testPostId, testPostTitle, [], postSubject)).to.throw(TypeError, 'The new post content is not a string.')
        expect(() => updatePost(testUserId, testPostId, testPostTitle, {}, postSubject)).to.throw(TypeError, 'The new post content is not a string.')
        expect(() => updatePost(testUserId, testPostId, testPostTitle, undefined, postSubject)).to.throw(TypeError, 'The new post content is not a string.')
        expect(() => updatePost(testUserId, testPostId, testPostTitle, 1, postSubject)).to.throw(TypeError, 'The new post content is not a string.')
    })

    it('fails on post content too long', () => expect(() => updatePost('6102a3cbf245ef001c9a1837', '6102a3cbf245ef001c9a1837', 'New post title', 'This is the new short text of the post.', 'Others')).to.throw(RangeError, 'The content of the post is too short.'))
    
    it('fails on empty post subject', () => expect(() => updatePost('6102a3cbf245ef001c9a1837', '6102a3cbf245ef001c9a1837', 'New post title', content, '')).to.throw(ContentError, 'The subject field is empty.'))

    it('fails on a non-string post subject', () => {
        const testUserId = '6102a3cbf245ef001c9a1837'
        const testPostId = '6102a3cbf245ef001c9a1837'
        const testPostTitle = 'New post title'
        const postSubject = 'Others'
        
        expect(() => updatePost(testUserId, testPostId, testPostTitle, content, true)).to.throw(TypeError, 'The subject is not a string.')
        expect(() => updatePost(testUserId, testPostId, testPostTitle, content, [])).to.throw(TypeError, 'The subject is not a string.')
        expect(() => updatePost(testUserId, testPostId, testPostTitle, content, {})).to.throw(TypeError, 'The subject is not a string.')
        expect(() => updatePost(testUserId, testPostId, testPostTitle, content, undefined)).to.throw(TypeError, 'The subject is not a string.')
        expect(() => updatePost(testUserId, testPostId, testPostTitle, content, 1)).to.throw(TypeError, 'The subject is not a string.')
    })

    it('fails on invalid post subject', () => expect(() => updatePost('6102a3cbf245ef001c9a1837', '6102a3cbf245ef001c9a1837', 'New post title', content, 'physical education')).to.throw(ContentError, 'The subject is not valid'))

    after(async () => await mongoose.disconnect())
})