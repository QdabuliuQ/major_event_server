const joi = require('joi')
const {
    pattern
} = require('../../config')
const {string} = require("joi");

const nickname = joi.string().max(20).required().error(new Error('昵称长度不超过20'))
const user_pic = joi.string()
const bg_image = joi.string()
const sex = joi.number().integer()
const intro = joi.string().max(40).error(new Error('简介长度不超过40'))
const birthday = joi.number()
const province = joi.string()
const city = joi.string()
const area = joi.string()


exports.update_user_info_schema = {
    body: {
        nickname,
        user_pic,
        bg_image,
        sex,
        intro,
        birthday,
        province,
        city,
        area,
    }
}

exports.update_follow_user_schema = {
    body: {
        follow_id: joi.string().required(),
        is_follow: joi.number().integer().valid(0,1)
    }
}
