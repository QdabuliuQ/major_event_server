const express = require('express')
const expressJoi = require('@escook/express-joi')
const router = express.Router()
const {
	getEventList,
	deleteEvent,
	getEventDetail,
	getEventReport,
	updateReportState
} = require("../../router_handler/admin/event")
const {
	update_report_state_schema
} = require("../../schema/admin/event")

// 获取动态列表
router.get('/getEventList', getEventList)

// 封禁动态
router.post('/deleteEvent', deleteEvent)

// 查看动态
router.get('/getEventDetail', getEventDetail)

// 查看动态举报
router.get('/getEventReport', getEventReport)

// 更新举报状态
router.post('/updateReportState', expressJoi(update_report_state_schema), updateReportState)

module.exports = router
