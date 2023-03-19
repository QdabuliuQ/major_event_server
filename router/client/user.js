const express = require('express')
const expressJoi = require('@escook/express-joi')
const {
    registerUser,
    loginUser,
    forgetPassword
} = require('../../router_handler/client/h_user')
const {
    add_user_info_schema
} = require('../../schema/client/s_user')

const router = express.Router()

// 用户注册
router.post('/registerUser', expressJoi(add_user_info_schema), registerUser)

// 用户登录
router.post('/loginUser', loginUser)

// 忘记密码
router.post('/forgetPassword', forgetPassword)

module.exports = router