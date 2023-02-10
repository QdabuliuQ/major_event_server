const joi = require('joi')

const state = joi.string().valid('2','3').required()
const id = joi.string().required()

exports.update_video_state_schema = {
    body: {
        state,
        id
    }
}