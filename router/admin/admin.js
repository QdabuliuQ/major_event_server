const express = require('express')
const expressJoi = require('@escook/express-joi')
const {
    adminLogin,
    adminUpdateUserPwd
} = require('../../router_handler/admin/admin')

const router = express.Router()

router.post('/adminLogin', adminLogin)

module.exports = router