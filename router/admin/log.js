const express = require('express')
const {
    getSupAdminLog
} = require('../../router_handler/admin/log')

const router = express.Router()

router.post('/getSupAdminLog', getSupAdminLog)

module.exports = router