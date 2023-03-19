const joi = require('joi')
const {
    pattern
} = require('../../config')

const email = joi.string().pattern(pattern.email)
const phone = joi.string().pattern(pattern.phone)
const pwd = joi.string().pattern(pattern.password).required()

exports.add_user_info_schema = {
    body: {
        email,
        phone,
        password: pwd
    }
}

exports.forget_user_password_schema = {
    body: {
        password: pwd,
        re_password: pwd,
        email: joi.string().pattern(pattern.email).required(),
        phone: joi.string().pattern(pattern.phone).required(),
    }
}