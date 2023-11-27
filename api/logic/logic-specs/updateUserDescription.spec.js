require('dotenv').config()

const { expect } = require('chai')
const updateUserDescription = require('../updateUserDescription')
const { cleanUp, generate, populate } = require('../helpers-test')
const mongoose = require('mongoose')
const { errors: { ExistenceError, ContentError } } = require('com')
const { User } = require('../../data/models')

describe('updateUserDescription', () => {
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

    it('succeeds on updating the user description', async () => {
        try {            
            const _user = await User.findOne({ email: email })
            const userId = _user._id.toString()

            const testDescription = 'test description'

            await updateUserDescription(userId, testDescription)

            const _user2 = await User.findOne({ email: email })

            expect(_user2.description).to.equal(testDescription)
        } catch (error) {
            
        }
    })

    it('fails on non-existing user', async () => {
        try {
            const wrongUserId = '6102a3cbf245ef001c9a1837'
            const testDescription = 'test description'

            const users = await updateUserDescription(wrongUserId, testDescription)
        } catch (error) {
            expect(error).to.be.instanceOf(ExistenceError)
            expect(error.message).to.equal('User not found.')
        }
    })

    it('fails on empty user id', () => expect(() => updateUserDescription('', 'test description')).to.throw(ContentError, 'The user id does not have 24 characters.'))

    it('fails on a non-string user id', () => {
        const testTextToSearch = 'test description'

        expect(() => updateUserDescription(true, testTextToSearch)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => updateUserDescription([], testTextToSearch)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => updateUserDescription({}, testTextToSearch)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => updateUserDescription(undefined, testTextToSearch)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => updateUserDescription(1, testTextToSearch)).to.throw(TypeError, 'The user id is not a string.')
    })

    it('fails on not hexadecimal user id', () => expect(() => updateUserDescription('-102a3cbf245ef001c9a1837', 'test description')).to.throw(ContentError, 'The user id is not hexadecimal.'))
    
    it('fails on empty description', () => expect(() => updateUserDescription('6102a3cbf245ef001c9a1837', '')).to.throw(ContentError, 'The description field is empty.'))

    it('fails on a non-string description', () => {
        const testUserId = '6102a3cbf245ef001c9a1837'

        expect(() => updateUserDescription(testUserId, true)).to.throw(TypeError, 'The description is not a string.')
        expect(() => updateUserDescription(testUserId, [])).to.throw(TypeError, 'The description is not a string.')
        expect(() => updateUserDescription(testUserId, {})).to.throw(TypeError, 'The description is not a string.')
        expect(() => updateUserDescription(testUserId, undefined)).to.throw(TypeError, 'The description is not a string.')
        expect(() => updateUserDescription(testUserId, 1)).to.throw(TypeError, 'The description is not a string.')
    })

    after(async () => await mongoose.disconnect())
})