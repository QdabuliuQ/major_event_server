const joi = require('joi')

exports.update_report_state_schema = {
	body: {
		rep_id: joi.string().required(),
		ev_id: joi.string().required(),
		user_id: joi.string().required(),
		state: joi.string().valid('2','3').required()
	}
}