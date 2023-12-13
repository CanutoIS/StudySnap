const { 
    validators: { validateEmail },
    errors: { ExistenceError }
  } = require('com')
  require('dotenv').config()
  const { User } = require('../data/models')
  const nodemailer = require("nodemailer");
  
  /**
   * Sends a message to the new user with the password recovery code
   * 
   * @param {string} email The user's email
   * 
   * @returns {promise} A Promise that resolves if sending the email is successful, or rejects with an error message if fails
   * 
   * @throws {TypeError} On non-string email
   * @throws {ContentError} On empty email
   */
  
  module.exports = (email) => {
    validateEmail(email, 'user email')
  
    return (async () => {
        const user = await User.findOne({ email })
        if(!user) throw new ExistenceError('User with this email is not registered.')

        const randomNumber = Math.floor(Math.random() * 1000000) + 1

        await User.updateOne(
            { _id: user._id },
            { recoveryCode: randomNumber }
        )

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const info = await transporter.sendMail({
            from: `StudySnap <${process.env.EMAIL}`,
            to: email,
            subject: "Password recovery code",
            text: "Recovery code to generate a new password",
            html: `
            <p>¡Hello, ${user.name}!</p>
            <p>You has requested a recovery password code for your account.</p>
            <p>Your recovery code is: <strong>${randomNumber}</strong></p>
            <p>Please, use it to restore your password.</p>
            <p>Thank you,</p>
            <p>The StudySnap team</p>
            `,
        });

        // console.log("Message sent: %s", info.messageId);
    })()
  }