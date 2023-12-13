require('dotenv').config()

const { expect } = require('chai')
const registerUser = require('../registerUser')
const { cleanUp, generate, populate } = require('../helpers-test')
const mongoose = require('mongoose')
const { errors: { ContentError, DuplicityError } } = require('com')
const { User } = require('../../data/models')
const bcrypt = require('bcryptjs')

describe('registerUser', () => {
    let user, name, username, email, password, avatar, favs

    before(async () => await mongoose.connect(process.env.MONGODB_URL))

    beforeEach(async () => {
        try {
            await cleanUp()

            user = generate.user()
            name = user.name
            username = user.username
            email = user.email
            password = user.password
            avatar = user.avatar
            favs = user.favs

        } catch (error) {
            
        }

    })

    it('succeeds on registering user', async () => {
        try {
            await registerUser(name, username, email, password)

            const _user = await User.findOne({ email: email })

            expect(_user).to.be.a('object')
            expect(_user.name).to.equal(name)
            expect(_user.email).to.equal(email)
            expect(_user.avatar).to.be.null
            expect(_user.favs).to.be.an('array')

            const match = await bcrypt.compare(password, _user.password)

            expect(match).to.be.true
            

        } catch (error) {
            
        }
    })
    
    it('fails on existing user', async () => {
        const newEmail = 'email@newUser.com'
        
        try {
            await User.create({ name, username, email: newEmail, password })

            await registerUser(name, username, newEmail, password)

        } catch (error) {
            console.log(error)
            expect(error).to.be.instanceOf(DuplicityError)
            expect(error.message).to.equal(`User with email "${newEmail}" already exists.`)
        }
    })

    it('fails on email not valid', async () => {
        try {
            const wrongEmail = 'testEmail.com'
            await registerUser(name, username, wrongEmail, password)

        } catch (error) {
            expect(error).to.be.instanceOf(ContentError)
            expect(error.message).to.equal(`The email is not valid.`)
        }
    })

    it('fails on empty name', () => expect(() => registerUser('', email, password)).to.throw(ContentError, 'The name of the user field is empty.'))

    it('fails on a non-string name', () => {
        expect(() => registerUser(true, email, password)).to.throw(TypeError, 'The name of the user is not a string.')
        expect(() => registerUser([], email, password)).to.throw(TypeError, 'The name of the user is not a string.')
        expect(() => registerUser({}, email, password)).to.throw(TypeError, 'The name of the user is not a string.')
        expect(() => registerUser(undefined, email, password)).to.throw(TypeError, 'The name of the user is not a string.')
        expect(() => registerUser(1, email, password)).to.throw(TypeError, 'The name of the user is not a string.')
    })
    
    it('fails on empty username', () => expect(() => registerUser(name, '', email, password)).to.throw(ContentError, 'The username field is empty.'))

    it('fails on a non-string username', () => {
        expect(() => registerUser(name, true, email, password)).to.throw(TypeError, 'The username is not a string.')
        expect(() => registerUser(name, [], email, password)).to.throw(TypeError, 'The username is not a string.')
        expect(() => registerUser(name, {}, email, password)).to.throw(TypeError, 'The username is not a string.')
        expect(() => registerUser(name, undefined, email, password)).to.throw(TypeError, 'The username is not a string.')
        expect(() => registerUser(name, 1, email, password)).to.throw(TypeError, 'The username is not a string.')
    })

    it('fails on a too short username', () => expect(() => registerUser(name, 'user1', email, password)).to.throw(RangeError, 'The username is too short.'))

    it('fails on username containing spaces', () => expect(() => registerUser(name, 'user 1234', email, password)).to.throw(ContentError, 'The username contains spaces.'))

    it('fails on username containing uppercase letters', () => expect(() => registerUser(name, 'USER1234', email, password)).to.throw(ContentError, 'The username contains uppercase letters.'))

    it('fails on empty email', () => expect(() => registerUser(name, 'usernametest', '', email, password)).to.throw(ContentError, 'The user email field is empty.'))

    it('fails on a non-string email', () => {
        expect(() => registerUser(name, 'usernametest', true, password)).to.throw(TypeError, 'The user email is not a string.')
        expect(() => registerUser(name, 'usernametest', [], password)).to.throw(TypeError, 'The user email is not a string.')
        expect(() => registerUser(name, 'usernametest', {}, password)).to.throw(TypeError, 'The user email is not a string.')
        expect(() => registerUser(name, 'usernametest', undefined, password)).to.throw(TypeError, 'The user email is not a string.')
        expect(() => registerUser(name, 'usernametest', 1, password)).to.throw(TypeError, 'The user email is not a string.')
    })

    it('fails on empty password', () => expect(() => registerUser(name, 'usernametest', email, '123')).to.throw(RangeError, 'The user password is lower than 6 characters.'))

    it('fails on a non-string password', () => {
        expect(() => registerUser(name, 'usernametest', email, true)).to.throw(TypeError, 'The user password is not a string.')
        expect(() => registerUser(name, 'usernametest', email, [])).to.throw(TypeError, 'The user password is not a string.')
        expect(() => registerUser(name, 'usernametest', email, {})).to.throw(TypeError, 'The user password is not a string.')
        expect(() => registerUser(name, 'usernametest', email, undefined)).to.throw(TypeError, 'The user password is not a string.')
        expect(() => registerUser(name, 'usernametest', email, 1)).to.throw(TypeError, 'The user password is not a string.')
    })

    after(async () => await mongoose.disconnect())
})