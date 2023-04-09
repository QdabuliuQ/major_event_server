const joi = require('joi')

exports.pub_event_schema = {
	type: joi.string().required().valid('1','2', '3','4'),
	content: joi.string().max(200),
	images: joi.string(),
	resource_id: joi.string(),
}