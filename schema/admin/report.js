const joi = require('joi')

exports.update_report_state_schema = {
    body: {
        id: joi.string().required(),
        type: joi.string().valid('1','2').required(),
        state: joi.string().valid('2','3').required()
    }
}

exports.add_report_reason_schema = {
    body: {
        type: joi.string().valid('1','2'),
        name: joi.string().required().max(20)
    }
}