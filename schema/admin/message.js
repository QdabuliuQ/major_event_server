const joi = require('joi')

const id = joi.string().required()

exports.update_report_state_schema = {
	body: {
		msg_id: id,
		user_id: id,
		state: joi.string().valid('2','3').required()
	}
}