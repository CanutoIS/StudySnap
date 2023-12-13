const { 
    validators: { validateEmail },
    errors: { ExistenceError }
  } = require('com')
  require('dotenv').config()
  const { User } = require('../data/models')
  const bcrypt = require('bcryptjs')
  const nodemailer = require("nodemailer");
  
  /**
   * Sends a message to the new user when the register succeeds
   * 
   * @param {string} email The user's email
   * 
   * @returns {promise} A Promise that resolves when the registration is successful, or rejects with an error message if registration fails
   * 
   * @throws {TypeError} On non-string email
   * @throws {ContentError} On empty email
   */
  
  module.exports = (email) => {
    validateEmail(email, 'user email')
  
    return (async () => {
        const user = await User.findOne({ email })
        if(!user) throw new ExistenceError('User not found.')

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
            subject: "Welcome to StudySnap",
            text: "Welcome to StudySnap",
            html: `
                <h1>Welcome to StudySnap</h1>
                <p>Hello ${user.name},</p>
                <p>Welcome to StudySnap, the perfect platform for learning and sharing knowledge.</p>
                <p>We hope you enjoy your experience with us.</p>
                <p>Thank you for joining our community.</p>
                <p>Sincerely,</p>
                <p>The StudySnap Team</p>
                `,
        });

        // console.log("Message sent: %s", info.messageId);
    })()
  }