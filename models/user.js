const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs')

const emailLengthChecker = (email) => {
    if (!email) {
        return false;
    } else {
        if (email.length < 5 || email.length > 30) {
            return false;
        } else {
            return true
        }
    }
}

const emailValidators = [{
    validator: emailLengthChecker,
    message: 'Email must be at least 5 characters but not more than 30'
}]


const userSchema = new Schema({
    email: {
        type: String,
        trim: true,
        unique: true,
        required: true,
        lowercase: true,
        validate: emailValidators
    },
    password: {
        type: String,
        required: true
    },
    CreatedAt: {
        type: Date,
        default: Date.now()
    },
    UpdatedAt: {
        type: Date
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    }
})

userSchema.pre('save', function (next) {
    if (!this.isModified('password'))
        return next();

    bcrypt.hash(this.password, null, null, (err, hash) => {
        if (err) return next(err);
        this.password = hash;
        next()
    })
})

userSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password)
}

module.exports = mongoose.model('User', userSchema);