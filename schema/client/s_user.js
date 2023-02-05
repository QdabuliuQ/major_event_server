const joi = require('joi')
const {
    pattern
} = require('../../config')

const email = joi.string().pattern(pattern.email)
const phone = joi.string().pattern(pattern.phone)
const pwd = joi.string().pattern(/^[\S]{6,12}$/).required()

exports.add_user_info_schema = {
    body: {
        email,
        phone,
        password: pwd
    }
}