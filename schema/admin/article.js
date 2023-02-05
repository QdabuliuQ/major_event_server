const joi = require('joi')  // 定义验证规则包

const title = joi.string().required()
const content = joi.string().required()
const cover_img = joi.string().required()
const pub_date = joi.number().integer().required()
const cate_id = joi.number().integer().required()
const id = joi.string().required()
const state = joi.string().required()

exports.add_article_schema = {
  body: {
    title,
    content,
    cover_img,
    pub_date,
    cate_id
  }
}

exports.update_article_state_schema = {
  body: {
    id,
    state
  }
}