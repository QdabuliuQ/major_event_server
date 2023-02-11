const joi = require('joi')
const url = joi.string().required()
const id = joi.string().required()
exports.pub_video_schema = {
    body: {
        title: joi.string().max(40).required(),
        video_url: url,
        cover_img: url,
        duration: joi.number().required()
    }
}

exports.pub_video_comment_schema = {
    body: {
        content: joi.string().max(100).required(),
        video_id: id
    }
}

exports.praise_comment_schema = {
    body: {
        video_id: id,
        comment_id: id,
        is_praise: joi.string().valid('0','1').required()
    }
}