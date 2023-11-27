require('dotenv').config()

const { expect } = require('chai')
const retrieveSeenPosts = require('../retrieveSeenPosts')
const { cleanUp, generate, populate } = require('../helpers-test')
const mongoose = require('mongoose')
const { errors: { ExistenceError, ContentError } } = require('com')
const { User, Post } = require('../../data/models')
const { mongoose: { Types: { ObjectId } } } = require('mongoose')

describe('retrieveSeenPosts', () => {
    let user, name, email

    before(async () => await mongoose.connect(process.env.MONGODB_URL))

    beforeEach(async () => {
        try {
            await cleanUp()

            user = generate.user()
            name = user.name
            email = user.email

            await populate(user, [])
        } catch (error) {
            
        }
    })

    it('succeeds on rtrieving seen posts', async () => {
        try {
            const _user = await User.findOne({ email: user.email })
            const userId = _user._id.toString()

            const postTitle = 'Juan Carlos I, antiguo rey'
            const postText = 'Juan Carlos I de Borbon, es el padre del actual rey de la monarquía española, Felipe IV. Juan Carlos también fue rey de España hasta que en 2014 abdicó cediendole el trono a su hijo Felipe.'

            const postTitle2 = 'Felipe VI, rey de España'
            const postText2 = 'Felipe VI es el actual rey de España, perteneciente a la dinastía de los Borbones, hijo de Juan Carlos I, quien abdicó en 2014 para cederle el trono a él.'
            
            await Post.create({ author: new ObjectId(userId), title: postTitle, text: postText })
            await Post.create({ author: new ObjectId(userId), title: postTitle2, text: postText2 })

            const posts = await Post.find()

            posts.forEach(post => _user.seenLately.unshift(post._id))

            await _user.save()

            const postsFound = await retrieveSeenPosts(userId)

            expect(postsFound).to.exist
            expect(postsFound).to.be.an('array')
            expect(postsFound).to.have.lengthOf(2)

            expect(postsFound[0].author.id).to.equal(userId)
            expect(postsFound[0].author.name).to.equal(name)
            expect(postsFound[0].author.avatar).to.be.null
            expect(postsFound[0].title).to.equal(postTitle2)
            expect(postsFound[0].text).to.equal(postText2)
            expect(postsFound[0].likes).to.be.an('array')
            expect(postsFound[0].likes).to.have.lengthOf(0)
            expect(postsFound[0].visible).to.be.true
            expect(postsFound[0].comments).to.be.an('array')
            expect(postsFound[0].comments).to.have.lengthOf(0)
            
            expect(postsFound[1].author.id).to.equal(userId)
            expect(postsFound[1].author.name).to.equal(name)
            expect(postsFound[1].author.avatar).to.be.null
            expect(postsFound[1].title).to.equal(postTitle)
            expect(postsFound[1].text).to.equal(postText)
            expect(postsFound[1].likes).to.be.an('array')
            expect(postsFound[1].likes).to.have.lengthOf(0)
            expect(postsFound[1].visible).to.be.true
            expect(postsFound[1].comments).to.be.an('array')
            expect(postsFound[1].comments).to.have.lengthOf(0)

        } catch (error) {
            
        }
    })

    it('fails on non-existing user', async () => {
        try {
            const _user = await User.findOne({ email: user.email })
            const userId = _user._id.toString()

            const postTitle = 'Juan Carlos I, antiguo rey'
            const postText = 'Juan Carlos I de Borbon, es el padre del actual rey de la monarquía española, Felipe IV. Juan Carlos también fue rey de España hasta que en 2014 abdicó cediendole el trono a su hijo Felipe.'

            const postTitle2 = 'Felipe VI, rey de España'
            const postText2 = 'Felipe VI es el actual rey de España, perteneciente a la dinastía de los Borbones, hijo de Juan Carlos I, quien abdicó en 2014 para cederle el trono a él.'
            
            await Post.create({ author: new ObjectId(userId), title: postTitle, text: postText })
            await Post.create({ author: new ObjectId(userId), title: postTitle2, text: postText2 })

            const wrongUserId = '6102a3cbf245ef001c9a1837'

            await retrieveSeenPosts(wrongUserId)

        } catch (error) {
            console.log(error)
            expect(error).to.be.instanceOf(ExistenceError)
            expect(error.message).to.equal('User not found.')
        }
    })

    it('fails on empty user id', () => expect(() => retrieveSeenPosts('')).to.throw(ContentError, 'The user id does not have 24 characters.'))

    it('fails on a non-string user id', () => {
        expect(() => retrieveSeenPosts(true)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => retrieveSeenPosts([])).to.throw(TypeError, 'The user id is not a string.')
        expect(() => retrieveSeenPosts({})).to.throw(TypeError, 'The user id is not a string.')
        expect(() => retrieveSeenPosts(undefined)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => retrieveSeenPosts(1)).to.throw(TypeError, 'The user id is not a string.')
    })

    it('fails on not hexadecimal user id', () => expect(() => retrieveSeenPosts('-102a3cbf245ef001c9a1837')).to.throw(ContentError, 'The user id is not hexadecimal.'))

    after(async () => await mongoose.disconnect())
})