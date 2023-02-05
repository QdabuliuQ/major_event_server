const express = require('express')

// 导入验证规则包
const expressJoi = require('@escook/express-joi')

const router = express.Router()  // 获取路由实例对象
// 导入路由处理函数
const { regUser, login } = require('../../router_handler/admin/user')

// 导入验证规则
const {
    reg_login_schema,
    reg_register_schema
} = require('../../schema/admin/user.js')
// 注册
// 使用局部中间件来验证规则
router.post('/reguser', expressJoi(reg_register_schema), regUser)

// 登录
router.post('/login', login)

module.exports = router