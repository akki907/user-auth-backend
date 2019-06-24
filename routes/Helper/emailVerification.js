const nodemailer = require("nodemailer");
const setting = require('./../../config/setting')
var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: setting.emailId,
        pass: setting.password
    }
});

const sendEmail = (req, user) => {
    if (!req && !user.email) return
    const host = req.get('host');
    const link = `http://${host}/auth/emailVerify?email=${user.email}&id=${user.id}`;
    mailOptions = {
        to: user.email,
        subject: "Please confirm your Email account",
        html: `Please Click on the link to verify your email.<br><a href="${link}">Click here to verify</a>`
    }
    smtpTransport.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
    })
}

module.exports =sendEmail