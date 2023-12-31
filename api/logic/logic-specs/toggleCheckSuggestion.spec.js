require('dotenv').config()

const { expect } = require('chai')
const toggleCheckSuggestion = require('../toggleCheckSuggestion')
const { cleanUp, generate, populate } = require('../helpers-test')
const mongoose = require('mongoose')
const { errors: { ExistenceError, ContentError } } = require('com')
const { User, Post, Suggestion } = require('../../data/models')
const { mongoose: { Types: { ObjectId } } } = require('mongoose')

describe('toggleCheckSuggestion', () => {
    let user, email

    before(async () => await mongoose.connect(process.env.MONGODB_URL))

    beforeEach(async () => {
        try {
            await cleanUp()

            user = generate.user()
            email = user.email

            await populate(user, [])
        } catch (error) {
            
        }
    })

    it('succeeds on checking suggestion', async () => {
        try {
            const _user = await User.findOne({ email: user.email })
            const userId = _user._id.toString()

            const postTitle = 'Test Conversation'
            const postText = 'Juan Carlos I de Borbon, es el padre del actual rey de la monarquía española, Felipe IV. Juan Carlos también fue rey de España hasta que en 2014 abdicó cediendole el trono a su hijo Felipe.'
            
            await Post.create({ author: new ObjectId(userId), title: postTitle, text: postText, subject: 'Others' })

            const post = await Post.findOne({ author: new ObjectId(userId) })
            const postId = post._id

            const suggestionTitle = 'Título de prueba'
            const suggestionContent = 'Este es un texto de prueba para la creación de una sugerencia, que se hace para un test el cual usa unas librerías llamadas "mocha" y "chai"'

            await Suggestion.create({ author: new ObjectId(userId), post: postId, postAuthor: new ObjectId(userId), title: suggestionTitle, content: suggestionContent })

            const suggestion = await Suggestion.findOne({ author: userId })
            const suggestionId = suggestion._id.toString()

            await toggleCheckSuggestion(userId, suggestionId)

            const _suggestion = await Suggestion.findOne({ author: userId })

            expect(_suggestion).to.exist
            expect(_suggestion).to.be.an('object')
            expect(_suggestion.id).to.equal(suggestionId)
            expect(_suggestion.checked).to.be.true
        } catch (error) {
            
        }
    })
    
    it('succeeds on unchecking suggestion', async () => {
        try {
            const _user = await User.findOne({ email: user.email })
            const userId = _user._id.toString()

            const postTitle = 'Test Conversation'
            const postText = 'Juan Carlos I de Borbon, es el padre del actual rey de la monarquía española, Felipe IV. Juan Carlos también fue rey de España hasta que en 2014 abdicó cediendole el trono a su hijo Felipe.'
            
            await Post.create({ author: new ObjectId(userId), title: postTitle, text: postText, subject: 'Others' })

            const post = await Post.findOne({ author: new ObjectId(userId) })
            const postId = post._id

            const suggestionTitle = 'Título de prueba'
            const suggestionContent = 'Este es un texto de prueba para la creación de una sugerencia, que se hace para un test el cual usa unas librerías llamadas "mocha" y "chai"'

            await Suggestion.create({ author: new ObjectId(userId), post: postId, postAuthor: new ObjectId(userId), title: suggestionTitle, content: suggestionContent, checked: true })

            const suggestion = await Suggestion.findOne({ author: userId })
            const suggestionId = suggestion._id.toString()

            await toggleCheckSuggestion(userId, suggestionId)

            const _suggestion = await Suggestion.findOne({ author: userId })

            expect(_suggestion).to.exist
            expect(_suggestion).to.be.an('object')
            expect(_suggestion.id).to.equal(suggestionId)
            expect(_suggestion.checked).to.be.false
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
            const postId = post._id

            const suggestionTitle = 'Título de prueba'
            const suggestionContent = 'Este es un texto de prueba para la creación de una sugerencia, que se hace para un test el cual usa unas librerías llamadas "mocha" y "chai"'

            await Suggestion.create({ author: new ObjectId(userId), post: postId, postAuthor: new ObjectId(userId), title: suggestionTitle, content: suggestionContent })

            const suggestion = await Suggestion.findOne({ author: userId })
            const suggestionId = suggestion._id.toString()

            const wrongUserId = '6102a3cbf245ef001c9a1837'
            
            await toggleCheckSuggestion(wrongUserId, suggestionId)
        } catch (error) {
            expect(error).to.be.instanceOf(ExistenceError)
            expect(error.message).to.equal('User not found.')
        }
    })
    
    it('fails on non-existing suggestion', async () => {
        try {
            const _user = await User.findOne({ email: user.email })
            const userId = _user._id.toString()

            const postTitle = 'Test suggestion'
            const postText = 'Juan Carlos I de Borbon, es el padre del actual rey de la monarquía española, Felipe IV. Juan Carlos también fue rey de España hasta que en 2014 abdicó cediendole el trono a su hijo Felipe.'
            
            await Post.create({ author: new ObjectId(userId), title: postTitle, text: postText, subject: 'Others' })

            const post = await Post.findOne({ author: new ObjectId(userId) })
            const postId = post._id

            const suggestionTitle = 'Título de prueba'
            const suggestionContent = 'Este es un texto de prueba para la creación de una sugerencia, que se hace para un test el cual usa unas librerías llamadas "mocha" y "chai"'

            await Suggestion.create({ author: new ObjectId(userId), post: postId, postAuthor: new ObjectId(userId), text: suggestionTitle, content: suggestionContent })

            const wrongSuggestionId = '6102a3cbf245ef001c9a1837'

            await toggleCheckSuggestion(userId, wrongSuggestionId)
        } catch (error) {
            expect(error).to.be.instanceOf(ExistenceError)
            expect(error.message).to.equal('Suggestion not found.')
        }
    })

    it('fails on empty user id', () => expect(() => toggleCheckSuggestion('', '6102a3cbf245ef001c9a1837')).to.throw(ContentError, 'The user id does not have 24 characters.'))

    it('fails on a non-string user id', () => {
        const testSuggestionId = '6102a3cbf245ef001c9a1837'

        expect(() => toggleCheckSuggestion(true, testSuggestionId)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => toggleCheckSuggestion([], testSuggestionId)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => toggleCheckSuggestion({}, testSuggestionId)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => toggleCheckSuggestion(undefined, testSuggestionId)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => toggleCheckSuggestion(1, testSuggestionId)).to.throw(TypeError, 'The user id is not a string.')
    })

    it('fails on not hexadecimal user id', () => expect(() => toggleCheckSuggestion('-102a3cbf245ef001c9a1837', '6102a3cbf245ef001c9a1837')).to.throw(ContentError, 'The user id is not hexadecimal.'))
    
    it('fails on empty suggestion id', () => expect(() => toggleCheckSuggestion('6102a3cbf245ef001c9a1837', '')).to.throw(ContentError, 'The suggestion id does not have 24 characters.'))

    it('fails on a non-string suggestion id', () => {
        const testUserId = '6102a3cbf245ef001c9a1837'

        expect(() => toggleCheckSuggestion(testUserId, true)).to.throw(TypeError, 'The suggestion id is not a string.')
        expect(() => toggleCheckSuggestion(testUserId, [])).to.throw(TypeError, 'The suggestion id is not a string.')
        expect(() => toggleCheckSuggestion(testUserId, {})).to.throw(TypeError, 'The suggestion id is not a string.')
        expect(() => toggleCheckSuggestion(testUserId, undefined)).to.throw(TypeError, 'The suggestion id is not a string.')
        expect(() => toggleCheckSuggestion(testUserId, 1)).to.throw(TypeError, 'The suggestion id is not a string.')
    })

    it('fails on not hexadecimal suggestion id', () => expect(() => toggleCheckSuggestion('6102a3cbf245ef001c9a1837', '-102a3cbf245ef001c9a1837')).to.throw(ContentError, 'The suggestion id is not hexadecimal.'))


    after(async () => await mongoose.disconnect())
})