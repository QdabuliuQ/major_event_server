// 用户信息相关模块
const express = require('express')
const expressJoi = require('@escook/express-joi')
const {
  getUserInfo,
  updateUserInfo,
  updatePassword,
  updateAvatar,
} = require('../../router_handler/admin/userInfo')
const {
  update_userInfo_schema,
  update_password_schema,
  update_avatar_schema
} = require('../../schema/admin/user')
const router = express.Router()

// 获取用户信息
router.get('/userInfo', getUserInfo)

// 修改用户信息
router.post('/userInfo', expressJoi(update_userInfo_schema), updateUserInfo)

// 修改密码
router.post('/updatePwd', expressJoi(update_password_schema), updatePassword)

// 修改头像
router.post('/update/avatar', expressJoi(update_avatar_schema), updateAvatar)

module.exports = router