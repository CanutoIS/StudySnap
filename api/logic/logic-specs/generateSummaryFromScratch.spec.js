require('dotenv').config()

const { expect } = require('chai')
const generateSummaryFromScratch = require('../generateSummaryFromScratch')
const { cleanUp, generate, populate } = require('../helpers-test')
const mongoose = require('mongoose')
const { errors: { ExistenceError, ContentError } } = require('com')
const { User } = require('../../data/models')
const { mongoose: { Types: { ObjectId } } } = require('mongoose')

describe('generateSummaryFromScratch', () => {
    let user, email

    const testContent = `JavaScript (abreviado comúnmente JS) es un lenguaje de programación interpretado, dialecto del estándar ECMAScript. Se define como orientado a objetos, basado en prototipos, imperativo, débilmente tipado y dinámico.

    Se utiliza principalmente del lado del cliente, implementado como parte de un navegador web permitiendo mejoras en la interfaz de usuario y páginas web dinámicas y JavaScript del lado del servidor (Server-side JavaScript o SSJS). Su uso en aplicaciones externas a la web, por ejemplo en documentos PDF, aplicaciones de escritorio (mayoritariamente widgets) es también significativo.
    
    Desde 2012, todos los navegadores modernos soportan completamente ECMAScript 5.1, una versión de JavaScript. Los navegadores más antiguos soportan por lo menos ECMAScript 3. La sexta edición se liberó en julio de 2015.`

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

            const response = await generateSummaryFromScratch(userId, testContent)

            expect(response).to.exist
            expect(response).to.be.an('string')

        } catch (error) {
            
        }
    })

    it('fails on non-existing user', async () => {
        try {
            const _user = await User.findOne({ email: user.email })
            const userId = _user._id.toString()

            const wrongUserId = '6102a3cbf245ef001c9a1837'

            const response = await generateSummaryFromScratch(wrongUserId, testContent)

        } catch (error) {
            expect(error).to.be.instanceOf(ExistenceError)
            expect(error.message).to.equal('User not found.')
        }
    })

    it('fails on empty user id', () => expect(() => generateSummaryFromScratch('', testContent)).to.throw(ContentError, 'The user id does not have 24 characters.'))

    it('fails on a non-string user id', () => {
        expect(() => generateSummaryFromScratch(true, testContent)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => generateSummaryFromScratch([], testContent)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => generateSummaryFromScratch({}, testContent)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => generateSummaryFromScratch(undefined, testContent)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => generateSummaryFromScratch(1, testContent)).to.throw(TypeError, 'The user id is not a string.')
    })

    it('fails on not hexadecimal user id', () => expect(() => generateSummaryFromScratch('-102a3cbf245ef001c9a1837', '6102a3cbf245ef001c9a1837')).to.throw(ContentError, 'The user id is not hexadecimal.'))
    
    it('fails on empty text to summarize', () => expect(() => generateSummaryFromScratch('6102a3cbf245ef001c9a1837', '')).to.throw(ContentError, 'The text to summarize field is empty.'))

    it('fails on a non-string text to summarize', () => {
        const testUserId = '6102a3cbf245ef001c9a1837'

        expect(() => generateSummaryFromScratch(testUserId, true)).to.throw(TypeError, 'The text to summarize is not a string.')
        expect(() => generateSummaryFromScratch(testUserId, [])).to.throw(TypeError, 'The text to summarize is not a string.')
        expect(() => generateSummaryFromScratch(testUserId, {})).to.throw(TypeError, 'The text to summarize is not a string.')
        expect(() => generateSummaryFromScratch(testUserId, undefined)).to.throw(TypeError, 'The text to summarize is not a string.')
        expect(() => generateSummaryFromScratch(testUserId, 1)).to.throw(TypeError, 'The text to summarize is not a string.')
    })

    after(async () => await mongoose.disconnect())
})