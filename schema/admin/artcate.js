const joi = require('joi')

const name = joi.string().max(20).required().error(new Error('名称格式不正确'))
const alias = joi.string().alphanum().required().error(new Error('别名格式不正确'))
const id = joi.string().alphanum().required().error(new Error('ID格式不正确'))
const desc = joi.string().required().error(new Error('描述内容不能为空'))
const password = joi.string().required()
const is_delete = joi.number().integer().min(0).max(1)

exports.add_cate_schema = {
  body: {
    name,
    alias,
    desc,
    password
  }
}

exports.delete_cate_schema = {
  params: {
    id,
    is_delete
  }
}

exports.get_cate_schema = {
  params: {
    id
  }
}

exports.update_cate_schema = {
  body: {
    id,
    name,
    alias,
    desc,
    password
  }
}

exports.add_cate_target_schema = {
  body: {
    cate_id: id,
    name
  }
}