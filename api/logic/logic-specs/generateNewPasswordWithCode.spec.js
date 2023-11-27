require('dotenv').config()

const { expect } = require('chai')
const generateNewPasswordWithCode = require('../generateNewPasswordWithCode')
const { cleanUp, generate, populate } = require('../helpers-test')
const mongoose = require('mongoose')
const { errors: { ContentError, DuplicityError } } = require('com')
const { User } = require('../../data/models')
const bcrypt = require('bcryptjs')
const { ExistenceError } = require('com/errors')

describe('generateNewPasswordWithCode', () => {
    let user, name, email, password

    before(async () => await mongoose.connect(process.env.MONGODB_URL))

    beforeEach(async () => {
        try {
            await cleanUp()

            user = generate.user()
            name = user.name
            email = user.email
            username = user.username
            code = user.code
            password = user.password
            
            const hash = await bcrypt.hash(user.password, 10)

            const _user = {name, email, username, password:hash, recoveryCode: code}

            await populate(_user)

        } catch (error) {
            console.log(error)
        }
    })

    it('succeeds on restoring the current password', async () => {
        try {
            const newPassword = 'newPassword'
            const newPasswordConfirm = 'newPassword'

            await generateNewPasswordWithCode(email, code, newPassword, newPasswordConfirm)
            
            const _user = await User.findOne({ email: email })

            expect(_user).to.be.a('object')

            const match = await bcrypt.compare(newPassword, _user.password)

            expect(match).to.be.true
            
        } catch (error) {
            
        }
    })
    
    it('fails on non-existent user', async () => {
        try {
            const wrongEmail = 'wrong@email.com'
            const newPassword = 'newPassword'
            const newPasswordConfirm = 'newPassword'

            await generateNewPasswordWithCode(wrongEmail, code, newPassword, newPasswordConfirm)

        } catch (error) {
            expect(error).to.be.instanceOf(ExistenceError)
            expect(error.message).to.equal(`User with this email is not registered.`)
        }
    })
    
    it('fails on wrong verification code', async () => {
        try {
            const newPassword = 'newPassword'
            const newPasswordConfirm = 'newPassword'
            const wrongCode = 'wrongCode'

            const user = await User.find()

            await generateNewPasswordWithCode(email, wrongCode, newPassword, newPasswordConfirm)

        } catch (error) {
            expect(error.message).to.equal('Incorrect code.')
        }
    })
    
    it('fails on the new passwords do not match', async () => {
        try {
            const newPassword = 'newPassword'
            const newPasswordConfirm = 'wrongPasswordConfirm'

            await generateNewPasswordWithCode(email, code, newPassword, newPasswordConfirm)

        } catch (error) {
            expect(error.message).to.equal('The new passwords do not match.')
        }
    })
    
    it('fails on new password the same as the old one', async () => {
        try {
            const newPassword = password
            const newPasswordConfirm = newPassword

            await generateNewPasswordWithCode(email, code, newPassword, newPasswordConfirm)

        } catch (error) {
            expect(error.message).to.equal('The password is the same as the old one.')
        }
    })

    it('fails on email not valid', async () => {
        try {
            const wrongEmail = 'testEmail.com'
            const newPassword = 'newPassword'
            const newPasswordConfirm = 'newPassword'

            await generateNewPasswordWithCode(wrongEmail, code, newPassword, newPasswordConfirm)

        } catch (error) {
            expect(error).to.be.instanceOf(ContentError)
            expect(error.message).to.equal(`The email is not valid.`)
        }
    })

    const newPassword = 'newPassword'
    const newPasswordConfirm = 'newPassword'

    it('fails on empty email', () => expect(() => generateNewPasswordWithCode('', code, newPassword, newPasswordConfirm)).to.throw(ContentError, 'The user email field is empty.'))

    it('fails on a non-string email', () => {
        expect(() => generateNewPasswordWithCode(true, code, newPassword, newPasswordConfirm)).to.throw(TypeError, 'The user email is not a string.')
        expect(() => generateNewPasswordWithCode([], code, newPassword, newPasswordConfirm)).to.throw(TypeError, 'The user email is not a string.')
        expect(() => generateNewPasswordWithCode({}, code, newPassword, newPasswordConfirm)).to.throw(TypeError, 'The user email is not a string.')
        expect(() => generateNewPasswordWithCode(undefined, code, newPassword, newPasswordConfirm)).to.throw(TypeError, 'The user email is not a string.')
        expect(() => generateNewPasswordWithCode(1, code, newPassword, newPasswordConfirm)).to.throw(TypeError, 'The user email is not a string.')
    })

    it('fails on empty verification code', () => expect(() => generateNewPasswordWithCode(email, '', newPassword, newPasswordConfirm)).to.throw(ContentError, 'The recovery password code field is empty.'))

    it('fails on a non-string verification code', () => {
        expect(() => generateNewPasswordWithCode(email, true, newPassword, newPasswordConfirm)).to.throw(TypeError, 'The recovery password code is not a string.')
        expect(() => generateNewPasswordWithCode(email, [], newPassword, newPasswordConfirm)).to.throw(TypeError, 'The recovery password code is not a string.')
        expect(() => generateNewPasswordWithCode(email, {}, newPassword, newPasswordConfirm)).to.throw(TypeError, 'The recovery password code is not a string.')
        expect(() => generateNewPasswordWithCode(email, undefined, newPassword, newPasswordConfirm)).to.throw(TypeError, 'The recovery password code is not a string.')
        expect(() => generateNewPasswordWithCode(email, 1, newPassword, newPasswordConfirm)).to.throw(TypeError, 'The recovery password code is not a string.')
    })

    it('fails on empty new password', () => expect(() => generateNewPasswordWithCode(email, code, '123', newPasswordConfirm)).to.throw(RangeError, 'The new password is lower than 6 characters.'))

    it('fails on a non-string new password', () => {
        expect(() => generateNewPasswordWithCode(email, code, true, newPasswordConfirm)).to.throw(TypeError, 'The new password is not a string.')
        expect(() => generateNewPasswordWithCode(email, code, [], newPasswordConfirm)).to.throw(TypeError, 'The new password is not a string.')
        expect(() => generateNewPasswordWithCode(email, code, {}, newPasswordConfirm)).to.throw(TypeError, 'The new password is not a string.')
        expect(() => generateNewPasswordWithCode(email, code, undefined, newPasswordConfirm)).to.throw(TypeError, 'The new password is not a string.')
        expect(() => generateNewPasswordWithCode(email, code, 1, newPasswordConfirm)).to.throw(TypeError, 'The new password is not a string.')
    })

    it('fails on empty new password confirm', () => expect(() => generateNewPasswordWithCode(email, code, newPassword, '123')).to.throw(RangeError, 'The new password confirm is lower than 6 characters.'))

    it('fails on a non-string new password confirm', () => {
        expect(() => generateNewPasswordWithCode(email, code, newPassword, true)).to.throw(TypeError, 'The new password confirm is not a string.')
        expect(() => generateNewPasswordWithCode(email, code, newPassword, [])).to.throw(TypeError, 'The new password confirm is not a string.')
        expect(() => generateNewPasswordWithCode(email, code, newPassword, {})).to.throw(TypeError, 'The new password confirm is not a string.')
        expect(() => generateNewPasswordWithCode(email, code, newPassword, undefined)).to.throw(TypeError, 'The new password confirm is not a string.')
        expect(() => generateNewPasswordWithCode(email, code, newPassword, 1)).to.throw(TypeError, 'The new password confirm is not a string.')
    })

    after(async () => await mongoose.disconnect())
})