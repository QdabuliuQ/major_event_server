const express = require('express')
const {
    adminLogin
} = require('../../router_handler/admin/admin')

const router = express.Router()

// 登录
router.post('/adminLogin', adminLogin)

module.exports = router