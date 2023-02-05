const joi = require('joi')  // 定义验证规则包
const {
  pattern
} = require('../../config')
/**
 * string 必须是字符串
 * alphanum 字符加数字
 * min最小长度
 * max最大长度
 * required必填项
 * pattern正则规则
 */
const username = joi.string().min(1).max(10).required()

const password = joi.string().pattern(/^[\S]{6,12}$/).required()

// 定义id nickname email验证规则
// id是number类型 最小值1 必填项
const id = joi.string().required()
const nickname = joi.string()
// email方法会自动对邮箱进行验证
const email = joi.string().pattern(pattern.email).required()
// dataUri方法表示是base64类型
const avatar = joi.string().required()
const status = joi.number().integer().required()
const phone = joi.string().pattern(pattern.phone).required().error(new Error('手机号格式错误'))

exports.reg_register_schema = {
  body: {
    email,
    phone,
    password
  }
}

// 更新用户信息验证对象
exports.update_userInfo_schema = {
  body: {
    id,
    nickname,
    email,
    phone,
    status,
    user_pic: avatar,
    bg_image: avatar
  }
}

exports.update_password_schema = {
  body: {
    oldPwd: password,
    // not表示不与括号内的值一致
    // concat合并 joi.not(joi.ref('oldPwd')) 和 password两条规则
    newPwd: joi.not(joi.ref('oldPwd')).concat(password)
  }
}

exports.update_avatar_schema = {
  body: {
    avatar
  }
}