const joi = require('joi')
const {
    pattern
} = require('../../config')

const newPwd = joi.string().pattern(/^[\S]{6,12}$/).required()
const rootPwd = joi.string().required()
const id = joi.string()
const name = joi.string().required()
const email = joi.string().pattern(pattern.email).required()
const phone = joi.string().pattern(pattern.phone).required()
const status = joi.string().required()

exports.update_userPwd_schema = {
    body: {
        id,
        newPwd,
        rootPwd
    }
}

exports.add_admin_schema = {
    body: {
        name,
        email,
        phone,
        password: newPwd,
        rootPwd
    }
}

exports.update_adminInfo_schema = {
    body: {
        rootPwd,
        email,
        name,
        phone,
        status,
        admin_id: id
    }
}

exports.update_adminPwd_schema = {
    body: {
        admin_id: id,
        newPwd,
        rootPwd
    }
}
