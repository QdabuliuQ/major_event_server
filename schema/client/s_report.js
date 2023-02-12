const joi = require('joi')

exports.add_article_report_schema = {
    body: {
        reason: joi.string().required().max(20),
        desc: joi.string().required().max(200),
        proof: joi.string(),
        art_id: joi.string().required()
    }
}

exports.add_comment_report_schema = {
    body: {
        reason: joi.string().required().max(20),
        comment_id: joi.string().required(),
        type: joi.string().valid('1','2').required()
    }
}