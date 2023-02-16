const joi = require('joi')

exports.add_report_schema = {
    body: {
        reason: joi.string().required().max(20),
        desc: joi.string().required().max(200),
        proof: joi.string().allow(null, ''),
        id: joi.string().required(),
        // 1 文章举报   2 视频举报
        type: joi.string().valid('1', '2').required()
    }
}

exports.add_comment_report_schema = {
    body: {
        reason: joi.string().required().max(20),
        comment_id: joi.string().required(),
        type: joi.string().valid('1','2').required()
    }
}