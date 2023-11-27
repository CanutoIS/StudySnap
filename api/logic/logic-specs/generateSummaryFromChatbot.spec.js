require('dotenv').config()

const { expect } = require('chai')
const generateSummaryFromChatbot = require('../generateSummaryFromChatbot')
const { cleanUp, generate, populate } = require('../helpers-test')
const mongoose = require('mongoose')
const { errors: { ExistenceError, ContentError } } = require('com')
const { User, Conversation } = require('../../data/models')
const { mongoose: { Types: { ObjectId } } } = require('mongoose')

describe('generateSummaryFromChatbot', () => {
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

            const conversationTitle = 'Test Conversation'
            const conversationMessages = [{ role: 'user', content: '¿Quién es Juan Carlos I?' }, { role: 'assistant', content: 'Juan Carlos I de Borbon, es el padre del actual rey de la monarquía española, Felipe IV. Juan Carlos también fue rey de España hasta que en 2014 abdicó cediendole el trono a su hijo Felipe.' }]
            
            await Conversation.create({ author: new ObjectId(userId), title: conversationTitle, messages: conversationMessages })

            const conversation = await Conversation.findOne({ author: userId })
            const conversationId = conversation._id.toString()

            const response = await generateSummaryFromChatbot(userId, conversationId)

            expect(response).to.exist
            expect(response).to.be.an('string')

        } catch (error) {
            
        }
    })



    it('fails on non-existing user', async () => {
        try {
            const _user = await User.findOne({ email: user.email })
            const userId = _user._id.toString()

            const conversationTitle = 'Test Conversation'
            const conversationMessages = [{ role: 'user', content: '¿Quién es Juan Carlos I?' }, { role: 'assistant', content: 'Juan Carlos I de Borbon, es el padre del actual rey de la monarquía española, Felipe IV. Juan Carlos también fue rey de España hasta que en 2014 abdicó cediendole el trono a su hijo Felipe.' }]
            
            await Conversation.create({ author: new ObjectId(userId), title: conversationTitle, messages: conversationMessages })

            const conversation = await Conversation.findOne({ author: userId })
            const conversationId = conversation._id.toString()

            const wrongUserId = '6102a3cbf245ef001c9a1837'

            const response = await generateSummaryFromChatbot(wrongUserId, conversationId)

        } catch (error) {
            expect(error).to.be.instanceOf(ExistenceError)
            expect(error.message).to.equal('User not found.')
        }
    })
    
    it('fails on non-existing conversation', async () => {
        try {
            const _user = await User.findOne({ email: user.email })
            const userId = _user._id.toString()

            const conversationTitle = 'Test Conversation'
            const conversationMessages = [{ role: 'user', content: '¿Quién es Juan Carlos I?' }, { role: 'assistant', content: 'Juan Carlos I de Borbon, es el padre del actual rey de la monarquía española, Felipe IV. Juan Carlos también fue rey de España hasta que en 2014 abdicó cediendole el trono a su hijo Felipe.' }]
            
            await Conversation.create({ author: new ObjectId(userId), title: 'Test conversation', messages: conversationMessages })

            const conversation = await Conversation.findOne({ author: userId })
            const conversationId = conversation._id.toString()

            const wrongConversationId = '6102a3cbf245ef001c9a1837'

            const response = await generateSummaryFromChatbot(userId, wrongConversationId)

        } catch (error) {
            expect(error).to.be.instanceOf(ExistenceError)
            expect(error.message).to.equal('Conversation not found.')
        }
    })

    it('fails on empty user id', () => expect(() => generateSummaryFromChatbot('', '6102a3cbf245ef001c9a1837')).to.throw(ContentError, 'The user id does not have 24 characters.'))

    it('fails on a non-string user id', () => {
        const testConversationId = '6102a3cbf245ef001c9a1837'

        expect(() => generateSummaryFromChatbot(true, testConversationId)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => generateSummaryFromChatbot([], testConversationId)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => generateSummaryFromChatbot({}, testConversationId)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => generateSummaryFromChatbot(undefined, testConversationId)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => generateSummaryFromChatbot(1, testConversationId)).to.throw(TypeError, 'The user id is not a string.')
    })

    it('fails on not hexadecimal user id', () => expect(() => generateSummaryFromChatbot('-102a3cbf245ef001c9a1837', '6102a3cbf245ef001c9a1837')).to.throw(ContentError, 'The user id is not hexadecimal.'))
    
    it('fails on empty conversation id', () => expect(() => generateSummaryFromChatbot('6102a3cbf245ef001c9a1837', '')).to.throw(ContentError, 'The conversation id does not have 24 characters.'))

    it('fails on a non-string conversation id', () => {
        const testUserId = '6102a3cbf245ef001c9a1837'

        expect(() => generateSummaryFromChatbot(testUserId, true)).to.throw(TypeError, 'The conversation id is not a string.')
        expect(() => generateSummaryFromChatbot(testUserId, [])).to.throw(TypeError, 'The conversation id is not a string.')
        expect(() => generateSummaryFromChatbot(testUserId, {})).to.throw(TypeError, 'The conversation id is not a string.')
        expect(() => generateSummaryFromChatbot(testUserId, undefined)).to.throw(TypeError, 'The conversation id is not a string.')
        expect(() => generateSummaryFromChatbot(testUserId, 1)).to.throw(TypeError, 'The conversation id is not a string.')
    })

    it('fails on not hexadecimal conversation id', () => expect(() => generateSummaryFromChatbot('6102a3cbf245ef001c9a1837', '-102a3cbf245ef001c9a1837')).to.throw(ContentError, 'The conversation id is not hexadecimal.'))


    after(async () => await mongoose.disconnect())
})