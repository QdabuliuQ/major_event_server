const express = require('express')
const expressJoi = require('@escook/express-joi')
const {
    update_userPwd_schema,
    add_admin_schema,
    update_adminInfo_schema,
    update_adminPwd_schema,
} = require("../../schema/admin/adminPower");
const {
    adminUpdateUserPwd,
    adminGetUserList,
    adminGetAdminList,
    adminAddAdminInfo,
    adminUpdateAdminInfo,
    adminUpdateAdminPwd
} = require("../../router_handler/admin/adminPower");

const router = express.Router()

// 管理员修改用户密码
router.post('/adminUpdateUserPwd', expressJoi(update_userPwd_schema), adminUpdateUserPwd)

// 获取所有用户信息
router.post('/adminGetUserList', adminGetUserList)

// 获取普通管理员信息
router.post('/adminGetAdminList', adminGetAdminList)

// 添加普通管理员信息
router.post('/adminAddAdminInfo', expressJoi(add_admin_schema), adminAddAdminInfo)

// 修改普通管理员信息
router.post('/adminUpdateAdminInfo', expressJoi(update_adminInfo_schema), adminUpdateAdminInfo)

// 修改普通管理员密码
router.post('/adminUpdateAdminPwd', expressJoi(update_adminPwd_schema), adminUpdateAdminPwd)

module.exports = router