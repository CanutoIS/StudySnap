require('dotenv').config()

const { expect } = require('chai')
const updateUserOccupation = require('../updateUserOccupation')
const { cleanUp, generate, populate } = require('../helpers-test')
const mongoose = require('mongoose')
const { errors: { ExistenceError, ContentError } } = require('com')
const { User } = require('../../data/models')

describe('updateUserOccupation', () => {
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

    it('succeeds on updating the user occupation', async () => {
        try {            
            const _user = await User.findOne({ email: email })
            const userId = _user._id.toString()

            const testOccupation = 'test occupation'

            await updateUserOccupation(userId, testOccupation)

            const _user2 = await User.findOne({ email: email })

            expect(_user2.occupation).to.equal(testOccupation)
        } catch (error) {
            
        }
    })

    it('fails on non-existing user', async () => {
        try {
            const wrongUserId = '6102a3cbf245ef001c9a1837'
            const testOccupation = 'test occupation'

            const users = await updateUserOccupation(wrongUserId, testOccupation)
        } catch (error) {
            expect(error).to.be.instanceOf(ExistenceError)
            expect(error.message).to.equal('User not found.')
        }
    })

    it('fails on empty user id', () => expect(() => updateUserOccupation('', 'test occupation')).to.throw(ContentError, 'The user id does not have 24 characters.'))

    it('fails on a non-string user id', () => {
        const testTextToSearch = 'test occupation'

        expect(() => updateUserOccupation(true, testTextToSearch)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => updateUserOccupation([], testTextToSearch)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => updateUserOccupation({}, testTextToSearch)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => updateUserOccupation(undefined, testTextToSearch)).to.throw(TypeError, 'The user id is not a string.')
        expect(() => updateUserOccupation(1, testTextToSearch)).to.throw(TypeError, 'The user id is not a string.')
    })

    it('fails on not hexadecimal user id', () => expect(() => updateUserOccupation('-102a3cbf245ef001c9a1837', 'test occupation')).to.throw(ContentError, 'The user id is not hexadecimal.'))
    
    it('fails on empty user occupation', () => expect(() => updateUserOccupation('6102a3cbf245ef001c9a1837', '')).to.throw(ContentError, 'The user occupation field is empty.'))

    it('fails on a non-string user occupation', () => {
        const testUserId = '6102a3cbf245ef001c9a1837'

        expect(() => updateUserOccupation(testUserId, true)).to.throw(TypeError, 'The user occupation is not a string.')
        expect(() => updateUserOccupation(testUserId, [])).to.throw(TypeError, 'The user occupation is not a string.')
        expect(() => updateUserOccupation(testUserId, {})).to.throw(TypeError, 'The user occupation is not a string.')
        expect(() => updateUserOccupation(testUserId, undefined)).to.throw(TypeError, 'The user occupation is not a string.')
        expect(() => updateUserOccupation(testUserId, 1)).to.throw(TypeError, 'The user occupation is not a string.')
    })

    after(async () => await mongoose.disconnect())
})