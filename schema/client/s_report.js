const joi = require('joi')

const reason = joi.string().required().max(20)
const id = joi.string().required()

exports.add_report_schema = {
    body: {
        reason,
        desc: joi.string().required().max(200),
        proof: joi.string().allow(null, ''),
        id,
        // 1 文章举报   2 视频举报
        type: joi.string().valid('1', '2').required()
    }
}

exports.add_comment_report_schema = {
    body: {
        reason: joi.string().required().max(20),
        comment_id: id,
        type: joi.string().valid('1','2').required()
    }
}

exports.add_message_report_schema = {
	body: {
		msg_id: id,
		send_id: id,
		reason,
	}
}