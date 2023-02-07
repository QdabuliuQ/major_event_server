const joi = require('joi')
const url = joi.string().required()

exports.pub_video_schema = {
    body: {
        title: joi.string().max(40).required(),
        video_url: url,
        cover_img: url,
        duration: joi.number().required()
    }
}