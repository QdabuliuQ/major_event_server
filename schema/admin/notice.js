const joi = require('joi')

const title = joi.string().required()
const content = joi.string().required()
const is_top = joi.number().integer().required()
const status = joi.string().required()
const id = joi.string()

exports.add_back_notice_schema = {
    body: {
        title,
        content,
        is_top,
        status,
        id,
    }
}

exports.add_rece_notice_schema = {
    body: {
        title,
        content,
        is_top: joi.number().integer(),
        status: joi.string(),
        id: joi.string(),
    }
}

exports.update_notice_status_schema = {
    id,
    app_status: joi.string().required()
}


