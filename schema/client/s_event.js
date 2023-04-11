const joi = require('joi')

const str = joi.string()
const id = joi.string().required()

exports.pub_event_schema = {
	type: joi.string().required().valid('1','2', '3','4'),
	content: joi.string().max(200),
	images: str,
	resource_id: str,
}

exports.add_event_comment_schema = {
	ev_id: id,
	content: joi.string().required().max(100)
}

exports.praise_comment_schema = {
	ev_id: id,
	comment_id: id,
	is_praise: joi.string().required().valid('0','1')
}

exports.praise_event_schema = {
	body: {
		ev_id: id,
		is_praise: joi.string().required().valid('0','1')
	}
}