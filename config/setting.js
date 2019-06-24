require('dotenv').config()

module.exports = {
    dbUrl: process.env.dbUrl || 'mongodb://localhost:27017/authApp',
    secret: process.env.Secret || 'This is Secret',
    PORT: process.env.PORT || 9000,
    emailId: process.env.emailId,
    password: process.env.password
}