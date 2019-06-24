const jwt = require('jsonwebtoken');
const config = require('../../config/setting')
exports.requireAuth = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        res.json({
            success: false,
            message: 'No token provided'
        })
    } else {
        jwt.verify(token, config.secret, (err, user) => {
            if (err) return res.json({
                success: false,
                message: "Token Invalid" + err
            })
            if (!user.isEmailVerified) return res.json({
                success: false,
                message: "Email not verified"
            })
            req.user = user;
            next()
        })
    }
}