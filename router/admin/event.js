const express = require('express')
const router = express.Router()
const {
	getEventList,
	deleteEvent,
	getEventDetail
} = require("../../router_handler/admin/event")

// 获取动态列表
router.get('/getEventList', getEventList)

// 封禁动态
router.post('/deleteEvent', deleteEvent)

// 查看动态
router.get('/getEventDetail', getEventDetail)

module.exports = router
