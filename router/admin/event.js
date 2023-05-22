const express = require('express')
const router = express.Router()
const {
	getEventList,
	deleteEvent
} = require("../../router_handler/admin/event")

// 获取动态列表
router.get('/getEventList', getEventList)

// 封禁动态
router.post('/deleteEvent', deleteEvent)

module.exports = router
