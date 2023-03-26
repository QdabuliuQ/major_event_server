const joi = require('joi')

const id = joi.string().required()

exports.add_chat_object_schema = {
	body: {
		to_id: id
	}
}

exports.add_message_record_schema = {
	body: {
		to_id: id,
		room_id: id,
		type: joi.string().required(),
		resource: joi.string().min(0).max(200)
	}
}