const joi = require('joi')
const type = joi.string().valid('1','2').required()

exports.get_comment_by_id_schema = {
    query: {
        type,
        offset: joi.required()
    }
}

exports.delete_comment_by_id_schema = {
    body: {
        type,
        comment_id: joi.string().required()
    }
}